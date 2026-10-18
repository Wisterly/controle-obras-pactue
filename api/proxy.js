export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).send('Parâmetro url ausente');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let accessToken = null;

  const envTokens = process.env.GOOGLE_AUTH_TOKENS ? JSON.parse(process.env.GOOGLE_AUTH_TOKENS) : null;
  if (envTokens && envTokens.refresh_token && clientId && clientSecret) {
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: envTokens.refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        accessToken = tokenData.access_token;
      }
    } catch (e) {
      console.error('Erro ao renovar token Vercel:', e);
    }
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (accessToken && url.includes('google')) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const fetchRes = await fetch(url, { headers });
    const text = await fetchRes.text();
    res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'text/plain; charset=utf-8');
    return res.status(fetchRes.status).send(text);
  } catch (err) {
    return res.status(500).send('Erro no proxy: ' + err.message);
  }
}
