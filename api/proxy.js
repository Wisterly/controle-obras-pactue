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

  // Identifica tokens (via variável de ambiente na Vercel ou fallback local)
  let accessToken = null;
  let envTokens = null;
  try {
    if (process.env.GOOGLE_AUTH_TOKENS) {
      envTokens = JSON.parse(process.env.GOOGLE_AUTH_TOKENS);
    }
  } catch (e) {}

  if (!envTokens) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const p = path.join(process.cwd(), 'google_auth_token.json');
      if (fs.existsSync(p)) {
        envTokens = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {}
  }

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

  // Se for Google Sheets e temos Access Token, usa a Google Sheets API v4 direta
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (accessToken && idMatch && idMatch[1]) {
    const sheetId = idMatch[1];
    const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : null;

    try {
      const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets(properties(sheetId,title))`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const meta = await metaRes.json();
      let sheetTitle = '';
      if (meta.sheets && meta.sheets.length > 0) {
        if (gid) {
          const targetSheet = meta.sheets.find(s => String(s.properties.sheetId) === String(gid));
          if (targetSheet) sheetTitle = targetSheet.properties.title;
        }
        if (!sheetTitle) sheetTitle = meta.sheets[0].properties.title;
      }

      if (sheetTitle) {
        const range = encodeURIComponent(`'${sheetTitle}'!A1:Z1000`);
        const valRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const valJson = await valRes.json();
        const rows = valJson.values || [];
        const csvLines = rows.map(r => r.map(cell => {
          const str = cell === null || cell === undefined ? '' : String(cell);
          return `"${str.replace(/"/g, '""')}"`;
        }).join(','));
        const csvOutput = csvLines.join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        return res.status(200).send(csvOutput);
      }
    } catch (errApi) {
      console.warn('Fallback da API Google na Vercel:', errApi);
    }
  }

  // Fallback para fetch direto
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
