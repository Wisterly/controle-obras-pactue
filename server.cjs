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

  // API de Autenticação Google OAuth2
  if (reqPath === '/api/auth/google/url' && req.method === 'GET') {
    const googleAuth = require('./google-auth-service.cjs');
    const host = req.headers.host || `localhost:${PORT}`;
    const proto = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
    const redirectUri = `${proto}://${host}/api/auth/google/callback`;
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets.readonly');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleAuth.CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ authUrl, redirectUri }));
    return;
  }

  if (reqPath === '/api/auth/google/status' && req.method === 'GET') {
    const googleAuth = require('./google-auth-service.cjs');
    const tokens = googleAuth.getStoredTokens();
    const isConnected = !!(tokens && (tokens.access_token || tokens.refresh_token));
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ connected: isConnected, email: tokens ? tokens.email : null }));
    return;
  }

  if (reqPath === '/api/auth/google/callback' && req.method === 'GET') {
    const googleAuth = require('./google-auth-service.cjs');
    const parsedReq = new URL(req.url, `http://${req.headers.host}`);
    const code = parsedReq.searchParams.get('code');
    const host = req.headers.host || `localhost:${PORT}`;
    const proto = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
    const redirectUri = `${proto}://${host}/api/auth/google/callback`;

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h3>Erro: Código de autorização não recebido do Google.</h3><p><a href="/">Voltar ao painel</a></p>');
      return;
    }

    const postData = new URLSearchParams({
      code,
      client_id: googleAuth.CLIENT_ID,
      client_secret: googleAuth.CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }).toString();

    const https = require('https');
    const tokenReq = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (tokenRes) => {
      let data = '';
      tokenRes.on('data', chunk => data += chunk);
      tokenRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            const currentTokens = googleAuth.getStoredTokens() || {};
            const savedTokens = {
              access_token: parsed.access_token,
              refresh_token: parsed.refresh_token || currentTokens.refresh_token || '',
              expires_at: Date.now() + ((parsed.expires_in || 3600) * 1000),
              scope: parsed.scope
            };
            googleAuth.saveStoredTokens(savedTokens);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <!DOCTYPE html>
              <html>
              <head><meta charset="utf-8"><title>Autorizado com Sucesso!</title>
              <style>
                body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #fff; }
                .box { background: #1e293b; padding: 32px; border-radius: 12px; text-align: center; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 450px; }
                h2 { color: #10b981; margin-top: 0; }
                p { color: #cbd5e1; line-height: 1.5; }
                .btn { display: inline-block; background: #0284c7; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
              </style>
              </head>
              <body>
                <div class="box">
                  <h2>✅ Robô do Servidor Conectado!</h2>
                  <p>Sua conta do Gmail foi autorizada com sucesso. Agora o servidor consegue ler a planilha de medições automaticamente e em tempo real para qualquer pessoa e em qualquer celular!</p>
                  <a href="/" class="btn">Voltar para o Sistema</a>
                  <script>
                    setTimeout(() => { window.location.href = '/'; }, 3000);
                  </script>
                </div>
              </body>
              </html>
            `);
            return;
          } else {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`<h3>Erro na autorização: ${parsed.error_description || parsed.error}</h3><p><a href="/">Voltar</a></p>`);
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h3>Erro ao processar tokens: ${err.message}</h3><p><a href="/">Voltar</a></p>`);
        }
      });
    });
    tokenReq.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h3>Erro de rede: ${err.message}</h3><p><a href="/">Voltar</a></p>`);
    });
    tokenReq.write(postData);
    tokenReq.end();
    return;
  }

  // API Proxy para contornar qualquer bloqueio de CORS no celular e desktop (com suporte a Google OAuth)
  if (reqPath === '/api/proxy' && req.method === 'GET') {
    const rawTarget = new URL(req.url, 'http://localhost').searchParams.get('url');
    if (!rawTarget) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Parâmetro url ausente');
      return;
    }

    const googleAuth = require('./google-auth-service.cjs');
    googleAuth.getValidAccessToken().then(accessToken => {
      const fetchWithRedirects = (targetUrl, redirectCount = 0) => {
        if (redirectCount > 5) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Muitos redirecionamentos');
          return;
        }
        try {
          const parsedUrl = new URL(targetUrl);
          const client = parsedUrl.protocol === 'http:' ? require('http') : require('https');
          const reqHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          };
          if (accessToken && parsedUrl.hostname.includes('google')) {
            reqHeaders['Authorization'] = `Bearer ${accessToken}`;
          }

          client.get(targetUrl, { headers: reqHeaders }, (proxyRes) => {
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
    }).catch(err => {
      console.error('Erro ao obter token do Google:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`Erro de autenticação Google: ${err.message}`);
    });
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
    const headers = { 'Content-Type': contentType };

    const queryParams = new URL(req.url, 'http://localhost').searchParams;
    if (queryParams.get('download') === '1' || queryParams.get('dl') === '1') {
      const downloadName = queryParams.get('filename') || path.basename(filePath);
      headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(downloadName)}"`;
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`[Servidor Local OBRAS GRE] Pronto em:`);
  console.log(`  🖥️  Desktop: http://localhost:${PORT}`);
  console.log(`  📱 Celular:  http://${localIp}:${PORT}`);
});
