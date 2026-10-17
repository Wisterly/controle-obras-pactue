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
  '.csv': 'text/csv; charset=utf-8',
  '.webp': 'image/webp'
};

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
}

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
  // API de Upload e Armazenamento de Fotos (Solução 1.B / Nuvem e Servidor)
  if (reqPath === '/api/upload-photo' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const base64Data = payload.data || payload.base64 || '';
        let originalName = payload.name || `foto-${Date.now()}`;
        originalName = originalName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');

        if (!base64Data) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Dados da imagem ausentes' }));
          return;
        }

        const match = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let ext = '.webp';
        let buffer;
        if (match) {
          const mime = match[1];
          if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
          else if (mime.includes('png')) ext = '.png';
          else if (mime.includes('webp')) ext = '.webp';
          buffer = Buffer.from(match[2], 'base64');
        } else {
          buffer = Buffer.from(base64Data, 'base64');
        }

        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}-${originalName}${originalName.endsWith(ext) ? '' : ext}`;
        const savePath = path.join(UPLOADS_DIR, filename);
        fs.writeFileSync(savePath, buffer);

        const localIp = getLocalIp();
        const photoUrl = `/uploads/${filename}`;
        const absoluteUrl = `http://${localIp}:${PORT}/uploads/${filename}`;

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: true,
          filename: filename,
          url: photoUrl,
          absoluteUrl: absoluteUrl
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // API Proxy para contornar qualquer bloqueio de CORS no celular e desktop
  if (reqPath === '/api/proxy' && req.method === 'GET') {
    const rawTarget = new URL(req.url, 'http://localhost').searchParams.get('url');
    if (!rawTarget) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Parâmetro url ausente');
      return;
    }

    const fetchWithRedirects = (targetUrl, redirectCount = 0) => {
      if (redirectCount > 5) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Muitos redirecionamentos');
        return;
      }
      try {
        const parsedUrl = new URL(targetUrl);
        const client = parsedUrl.protocol === 'http:' ? require('http') : require('https');
        client.get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        }, (proxyRes) => {
          if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
            let nextLoc = proxyRes.headers.location;
            if (nextLoc.startsWith('/')) {
              nextLoc = `${parsedUrl.origin}${nextLoc}`;
            }
            return fetchWithRedirects(nextLoc, redirectCount + 1);
          }
          res.writeHead(proxyRes.statusCode, {
            'Content-Type': proxyRes.headers['content-type'] || 'text/plain; charset=utf-8'
          });
          proxyRes.pipe(res);
        }).on('error', err => {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`Erro no proxy: ${err.message}`);
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`URL inválida: ${err.message}`);
      }
    };

    fetchWithRedirects(rawTarget);
    return;
  }

  // Aliases para os nomes legados de arquivo (mantém compatibilidade 100% sem duplicatas)
  const decodedPath = decodeURIComponent(reqPath);
  if (reqPath === '/' || reqPath === '' || 
      decodedPath === '/Controle de Obras GPR.html' || 
      decodedPath === '/controle_de_obras_gpr.html' || 
      reqPath.toLowerCase().includes('controle') && reqPath.toLowerCase().endsWith('.html')) {
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
