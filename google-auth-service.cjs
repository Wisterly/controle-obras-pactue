const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const GOOGLE_AUTH_FILE = path.join(__dirname, 'google_auth_token.json');
const CREDS_FILE = path.join(__dirname, 'google_credentials.json');

let CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
let CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

if (!CLIENT_ID && fs.existsSync(CREDS_FILE)) {
  try {
    const creds = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf8'));
    CLIENT_ID = creds.client_id;
    CLIENT_SECRET = creds.client_secret;
  } catch (e) {}
}

function getStoredTokens() {
  try {
    if (process.env.GOOGLE_AUTH_TOKENS) {
      return JSON.parse(process.env.GOOGLE_AUTH_TOKENS);
    }
    if (fs.existsSync(GOOGLE_AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(GOOGLE_AUTH_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Erro ao ler tokens do Google:', e);
  }
  return null;
}

function saveStoredTokens(tokens) {
  try {
    fs.writeFileSync(GOOGLE_AUTH_FILE, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (e) {
    console.error('Erro ao salvar tokens do Google:', e);
  }
}

async function refreshAccessToken(refreshToken) {
  const postData = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            reject(new Error(parsed.error_description || parsed.error || 'Falha ao atualizar token'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getValidAccessToken() {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  const now = Date.now();
  if (tokens.access_token && tokens.expires_at && tokens.expires_at > (now + 60000)) {
    return tokens.access_token;
  }

  if (tokens.refresh_token) {
    try {
      const newAccessToken = await refreshAccessToken(tokens.refresh_token);
      tokens.access_token = newAccessToken;
      tokens.expires_at = Date.now() + (3500 * 1000);
      saveStoredTokens(tokens);
      return newAccessToken;
    } catch (e) {
      console.error('Erro ao renovar token OAuth:', e.message);
      return tokens.access_token || null;
    }
  }
  return tokens.access_token || null;
}

module.exports = {
  get CLIENT_ID() { return CLIENT_ID; },
  get CLIENT_SECRET() { return CLIENT_SECRET; },
  GOOGLE_AUTH_FILE,
  getStoredTokens,
  saveStoredTokens,
  refreshAccessToken,
  getValidAccessToken
};
