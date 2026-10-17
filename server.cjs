const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, 'app_config.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=utf-8'
};

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal && (net.address.startsWith('192.168.') || net.address.startsWith('10.'))) {
        return net.address;
      }
    }
  }
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const server = http.createServer((req, res) => {
  // CORS enabled for local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = req.url.split('?')[0];

  // API de Informações do Servidor (IP local para acesso no celular)
  if (reqPath === '/api/info' && req.method === 'GET') {
    const localIp = getLocalIp();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      port: PORT,
      localIp: localIp,
      mobileUrl: `http://${localIp}:${PORT}`
    }));
    return;
  }

  // API de Configuração Compartilhada (migração Desktop <-> Celular)
  if (reqPath === '/api/config') {
    if (req.method === 'GET') {
      try {
        if (fs.existsSync(CONFIG_FILE)) {
          const data = fs.readFileSync(CONFIG_FILE, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(data);
          return;
        }
      } catch (e) {
        console.error('Erro ao ler app_config.json:', e);
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({}));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          let current = {};
          if (fs.existsSync(CONFIG_FILE)) {
            try { current = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (e) {}
          }
          const merged = { ...current };
          for (const [k, v] of Object.entries(parsed)) {
            if (v !== undefined && v !== null && (typeof v !== 'string' || v.trim() !== '')) {
              merged[k] = v;
            }
          }
          merged.updatedAt = new Date().toISOString();
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: true, config: merged }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }
  }
  // API Proxy para contornar qualquer bloqueio de CORS no celular e desktop
  if (reqPath === '/api/proxy' && req.method === 'GET') {
    const rawTarget = new URL(req.url, 'http://localhost').searchParams.get('url');
    if (!rawTarget) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Parâmetro url ausente');
      return;
    }
    try {
      const parsedUrl = new URL(rawTarget);
      const client = parsedUrl.protocol === 'http:' ? require('http') : require('https');
      const proxyReq = client.get(rawTarget, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }, (proxyRes) => {
        // Trata redirecionamentos automáticos do Google (301, 302, 307)
        if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
          const redirectUrl = proxyRes.headers.location;
          const redirectClient = redirectUrl.startsWith('http:') ? require('http') : require('https');
          redirectClient.get(redirectUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }, (redRes) => {
            res.writeHead(redRes.statusCode, { 'Content-Type': redRes.headers['content-type'] || 'text/plain; charset=utf-8' });
            redRes.pipe(res);
          }).on('error', err => {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(err.message);
          });
          return;
        }

        res.writeHead(proxyRes.statusCode, {
          'Content-Type': proxyRes.headers['content-type'] || 'text/plain; charset=utf-8'
        });
        proxyRes.pipe(res);
      });
      proxyReq.on('error', err => {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Erro no proxy: ${err.message}`);
      });
      return;
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`URL inválida: ${err.message}`);
      return;
    }
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 - Arquivo não encontrado</h1><p><a href="/">Voltar para o início</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`[Servidor Local OBRAS GRE] Pronto em:`);
  console.log(`  🖥️  Desktop: http://localhost:${PORT}`);
  console.log(`  📱 Celular:  http://${localIp}:${PORT}`);
});
