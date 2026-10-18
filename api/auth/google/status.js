export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  let isConnected = false;
  let email = null;

  try {
    if (process.env.GOOGLE_AUTH_TOKENS) {
      const tokens = JSON.parse(process.env.GOOGLE_AUTH_TOKENS);
      if (tokens && (tokens.refresh_token || tokens.access_token)) {
        isConnected = true;
        email = tokens.email || null;
      }
    }
    if (!isConnected) {
      const fs = await import('fs');
      const path = await import('path');
      const p = path.join(process.cwd(), 'google_auth_token.json');
      if (fs.existsSync(p)) {
        const tokens = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (tokens && (tokens.refresh_token || tokens.access_token)) {
          isConnected = true;
          email = tokens.email || null;
        }
      }
    }
  } catch (e) {}

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).json({
    connected: isConnected,
    email
  });
}
