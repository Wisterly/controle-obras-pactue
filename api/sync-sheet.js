import https from 'https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const payload = req.body || {};
  const targetUrl = payload.webhookUrl || 'https://script.google.com/macros/s/AKfycby_uj9BL3Pcezc7BxJJ0v-DjqWdHHvGmxt2_-givBvv8Ek54C9GCAK-6J5Jj62IdSVd/exec';

  try {
    const postData = JSON.stringify({
      escola: payload.escola || '',
      status: payload.status,
      situacao: payload.situacao,
      termino: payload.termino,
      sheetName: payload.sheetName || ''
    });

    const result = await new Promise((resolve, reject) => {
      const sendRequest = (currentUrl) => {
        const urlObj = new URL(currentUrl);
        const options = {
          hostname: urlObj.hostname,
          path: urlObj.pathname + urlObj.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const reqGoogle = https.request(options, (resp) => {
          // Segue redirecionamentos (302) do Google Apps Script
          if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
            https.get(resp.headers.location, (redirResp) => {
              let body = '';
              redirResp.on('data', chunk => body += chunk);
              redirResp.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { resolve({ success: true, raw: body }); }
              });
            }).on('error', reject);
            return;
          }

          let body = '';
          resp.on('data', chunk => body += chunk);
          resp.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch (e) { resolve({ success: true, raw: body }); }
          });
        });

        reqGoogle.on('error', reject);
        reqGoogle.write(postData);
        reqGoogle.end();
      };

      sendRequest(targetUrl);
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro ao sincronizar com Google Sheets:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
