const https = require('https');
const fs = require('fs');

const GRES_FOLDER_IDS = {
  "01ª GRE": "1a45yhfJzMLCLDJG4SNcnLY136M-CqRix",
  "02ª GRE": "12KwlaG2NQskRqxbLc8Lnf8TK2_RulZI6",
  "03ª GRE": "1ZhUF76aIlu0abAAIwSqVKyNNZFstpPsz",
  "04ª GRE": "1aeLheUr4wWb51APxRt51VQORwlYprqMi",
  "05ª GRE": "1NwXU4Bw1V3gQKLx89j_HkD0I-0ZucSec",
  "06ª GRE": "1jeD1YmG79B2vLwk9jByyXWMx47qYSQvf",
  "07ª GRE": "1RxFkpPB8ZNx7S8hEtNvlyc3iV8CwFOjy",
  "08ª GRE": "1g7ZOrTSiJf3x_O3P5B-QxL5wSbgKorsp",
  "09ª GRE": "1C_3bbKZ6xnzDYcYA7c5l4ruAlGYy7vtA",
  "10ª GRE": "1wxugV8CZ2YV2KyGW1XeNAPVr9IlqY619",
  "11ª GRE": "1wJfXmdjwgV_9Wq936ZwNuY1hsxKznBQm",
  "12ª GRE": "1_wAGPu_68vQ4GrMWAijipCDEFjTl7t9u",
  "13ª GRE": "1QYrvKu-7EkkSp5kZ9sqG936Nf9USBgul",
  "14ª GRE": "1HF8wHkC27uWPgUw58H2RyO3cLBXe09ky",
  "15ª GRE": "1b9OIw_r9svKmV122QUzPArpoO9gmvQMI",
  "16ª GRE": "1P5uLt5icTDmFMAcDl_7Xwb_LM_8OvWaR",
  "17ª GRE": "1xfARy9Vh1Hs6iIYAD_Xpfm4nqscvYW0-",
  "18ª GRE": "1jQ57i7I0HPy0jKC6fedVb_DVrE8Q61la",
  "19ª GRE": "1oFbz03fLHz1w1md2MP9etGB3P0H9_DuY",
  "20ª GRE": "1HJRGsB6WMkkTuyFxw9XpViZ39uiFp1Rf",
  "21ª GRE": "1sZlu-Cz9x_4JlF1r6EcuODIjRDUnJDoE"
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseSchoolFolderInfo(rawStr, fallbackCity = '') {
  if (!rawStr) return { inep: '', municipio: (fallbackCity || 'MUNICÍPIO').toUpperCase(), nome: '' };
  const trimmed = String(rawStr).replace(/Shared folder/i, '').trim();

  // Split inteligente por hífen (- ou – ou —)
  const parts = trimmed.split(/\s*[-–—]\s*/).map(p => p.trim()).filter(Boolean);

  let inep = '';
  let nome = '';
  let municipio = '';

  // Regra 1: Código INEP é sempre a sequência numérica de 8 dígitos no início
  if (parts.length > 0 && /^\d{7,8}$/.test(parts[0])) {
    inep = parts[0];
    const remainingParts = parts.slice(1);

    // Regra 2: Nome da Escola é o segmento contendo as siglas CETI ou CEJA
    const schoolIndex = remainingParts.findIndex(p => /\b(CETI|CEJA)\b/i.test(p));

    if (schoolIndex !== -1) {
      nome = remainingParts[schoolIndex].toUpperCase();
      // Regra 3: Município é o segmento restante sem INEP e sem CETI/CEJA
      const cityParts = remainingParts.filter((_, idx) => idx !== schoolIndex);
      municipio = (cityParts.join(' - ') || fallbackCity || 'MUNICÍPIO').toUpperCase();
    } else {
      if (remainingParts.length >= 2) {
        municipio = remainingParts[0].toUpperCase();
        nome = remainingParts.slice(1).join(' - ').toUpperCase();
      } else if (remainingParts.length === 1) {
        nome = remainingParts[0].toUpperCase();
        municipio = (fallbackCity || 'MUNICÍPIO').toUpperCase();
      }
    }
    return { inep, municipio, nome: nome || trimmed.toUpperCase(), rawFolder: trimmed };
  }

  // Fallback se não começar com 8 dígitos numéricos
  const schoolIndex = parts.findIndex(p => /\b(CETI|CEJA)\b/i.test(p));
  if (schoolIndex !== -1) {
    nome = parts[schoolIndex].toUpperCase();
    const otherParts = parts.filter((_, idx) => idx !== schoolIndex);
    const numPart = otherParts.find(p => /^\d{7,8}$/.test(p));
    if (numPart) inep = numPart;
    const cityParts = otherParts.filter(p => !/^\d{7,8}$/.test(p));
    municipio = (cityParts.join(' - ') || fallbackCity || 'MUNICÍPIO').toUpperCase();
    return { inep, municipio, nome, rawFolder: trimmed };
  }

  return { inep: '', municipio: (fallbackCity || 'MUNICÍPIO').toUpperCase(), nome: trimmed.toUpperCase(), rawFolder: trimmed };
}

async function run() {
  console.log('Iniciando varredura das 21 GREs no Google Drive...');
  const result = {};
  const allSchools = [];

  for (const [greLabel, folderId] of Object.entries(GRES_FOLDER_IDS)) {
    console.log(`Buscando ${greLabel} (ID: ${folderId})...`);
    try {
      const html = await fetchUrl(`https://drive.google.com/drive/folders/${folderId}`);
      const regex = /aria-label="([^"]+)"[^>]*ssk='5:auSv138:([a-zA-Z0-9_-]+)-0-16'/g;
      let m;
      const schoolsInGre = [];
      while ((m = regex.exec(html)) !== null) {
        const rawLabel = m[1];
        const itemFolderId = m[2];
        if (rawLabel.includes('Shared folder')) {
          const parsed = parseSchoolFolderInfo(rawLabel);
          parsed.driveFolderId = itemFolderId;
          parsed.greKey = greLabel;
          schoolsInGre.push(parsed);
          allSchools.push(parsed);
        }
      }
      result[greLabel] = {
        folderId,
        schoolsCount: schoolsInGre.length,
        schools: schoolsInGre
      };
      console.log(`  ✓ ${greLabel}: ${schoolsInGre.length} escolas/unidades encontradas.`);
    } catch(err) {
      console.error(`  ✗ Erro em ${greLabel}:`, err.message);
    }
  }

  console.log(`Total de escolas mapeadas em todo o Piauí: ${allSchools.length}`);
  fs.writeFileSync('acervo_escolas_piaui.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Salvo em acervo_escolas_piaui.json com sucesso!');
}

run();
