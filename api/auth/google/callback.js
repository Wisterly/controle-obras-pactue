export default async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'controle-obras-pactue.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/api/auth/google/callback`;

  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Código de autorização ausente');
  }

  let clientId = process.env.GOOGLE_CLIENT_ID || '';
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  try {
    const fs = await import('fs');
    const path = await import('path');
    const credPath = path.join(process.cwd(), 'google_credentials.json');
    if (fs.existsSync(credPath)) {
      const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      if (!clientId) clientId = creds.client_id;
      if (!clientSecret) clientSecret = creds.client_secret;
    }
  } catch (e) {}

  if (!clientId || !clientSecret) {
    return res.status(500).send('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não configurados no ambiente.');
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const data = await tokenRes.json();
    if (!data.access_token) {
      return res.status(400).send(`Erro do Google: ${data.error_description || data.error}`);
    }

    const tokensToSave = JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token || '',
      expires_at: Date.now() + ((data.expires_in || 3600) * 1000)
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Autorizado com Sucesso!</title>
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #fff; }
        .box { background: #1e293b; padding: 32px; border-radius: 12px; text-align: center; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 480px; }
        h2 { color: #10b981; margin-top: 0; }
        p { color: #cbd5e1; line-height: 1.5; font-size: 14px; }
        .btn { display: inline-block; background: #0284c7; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
        textarea { width: 100%; height: 60px; background: #0f172a; color: #38bdf8; border: 1px solid #334155; border-radius: 6px; font-family: monospace; font-size: 11px; padding: 8px; box-sizing: border-box; }
      </style>
      </head>
      <body>
        <div class="box">
          <h2>✅ Robô Autorizado no Google!</h2>
          <p>O token permanente foi gerado com sucesso para a sua conta.</p>
          <p>Copie este token abaixo para salvar na Vercel (se necessário):</p>
          <textarea readonly id="tok">${tokensToSave}</textarea>
          <br>
          <a href="/" class="btn">Voltar para o Sistema</a>
          <script>
            try {
              localStorage.setItem('google_auth_tokens', document.getElementById('tok').value);
            } catch(e){}
            setTimeout(() => { window.location.href = '/'; }, 3500);
          </script>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    return res.status(500).send('Erro interno ao autorizar: ' + err.message);
  }
}
