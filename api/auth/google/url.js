export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  let clientId = process.env.GOOGLE_CLIENT_ID || '';
  try {
    const fs = await import('fs');
    const path = await import('path');
    const credPath = path.join(process.cwd(), 'google_credentials.json');
    if (fs.existsSync(credPath)) {
      const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      if (!clientId) clientId = creds.client_id;
    }
  } catch (e) {}
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'controle-obras-pactue.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${host}/api/auth/google/callback`;

  const scopes = encodeURIComponent('https://www.googleapis.com/auth/spreadsheets.readonly');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json({
    authUrl,
    redirectUri
  });
}
