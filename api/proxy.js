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

  try {
    const fetchRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const text = await fetchRes.text();
    res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'text/plain; charset=utf-8');
    return res.status(fetchRes.status).send(text);
  } catch (err) {
    return res.status(500).send('Erro no proxy: ' + err.message);
  }
}
