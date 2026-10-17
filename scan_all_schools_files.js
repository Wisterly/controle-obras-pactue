const https = require('https');
const fs = require('fs');

const acervo = JSON.parse(fs.readFileSync('./acervo_escolas_piaui.json', 'utf8'));

// Carrega dados anteriores se existirem (para permitir continuar)
let results = {};
if (fs.existsSync('./acervo_arquivos_piaui.json')) {
  try {
    results = JSON.parse(fs.readFileSync('./acervo_arquivos_piaui.json', 'utf8'));
    console.log(`Carregado progresso anterior: ${Object.keys(results).length} escolas já mapeadas.`);
  } catch (e) {
    results = {};
  }
}

function fetchFolderFiles(folderId) {
  return new Promise((resolve) => {
    const req = https.get(`https://drive.google.com/drive/folders/${folderId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /aria-label="([^"]+)"[^>]*ssk='5:auSv138:([a-zA-Z0-9_-]+)-0-16'/g;
        let m;
        const files = [];
        while ((m = regex.exec(data)) !== null) {
          const label = m[1];
          const id = m[2];
          if (label.includes('Shared folder')) {
            const folderName = label.replace(/\s+Shared folder\s*$/i, '').trim();
            files.push({ type: 'folder', name: folderName, id });
          } else if (/(\.jpe?g|\.png)/i.test(label) || label.includes('Image Shared')) {
            const fileName = label.replace(/\s+Image Shared\s*$/i, '').trim();
            files.push({ type: 'image', name: fileName, id });
          } else if (/\.pdf/i.test(label) || label.includes('PDF Shared')) {
            const fileName = label.replace(/\s+PDF Shared\s*$/i, '').trim();
            files.push({ type: 'pdf', name: fileName, id });
          }
        }
        resolve(files);
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });
  });
}

async function run() {
  const allSchools = [];
  for (const [greKey, greData] of Object.entries(acervo)) {
    if (Array.isArray(greData.schools)) {
      for (const s of greData.schools) {
        allSchools.push({ ...s, greKey });
      }
    }
  }

  console.log(`Total de escolas a processar: ${allSchools.length}`);

  const toProcess = allSchools.filter(s => !results[s.driveFolderId]);
  console.log(`Restantes para processar: ${toProcess.length}`);

  const CONCURRENCY = 8;
  let processed = 0;
  let totalImagesFound = 0;
  let totalPdfsFound = 0;

  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (sch) => {
      const files = await fetchFolderFiles(sch.driveFolderId);
      const images = files.filter(f => f.type === 'image');
      const pdfs = files.filter(f => f.type === 'pdf');
      
      results[sch.driveFolderId] = {
        inep: sch.inep,
        nome: sch.nome,
        municipio: sch.municipio,
        greKey: sch.greKey,
        rawFolder: sch.rawFolder,
        driveFolderId: sch.driveFolderId,
        imagesCount: images.length,
        pdfsCount: pdfs.length,
        images: images,
        pdfs: pdfs
      };

      totalImagesFound += images.length;
      totalPdfsFound += pdfs.length;
    });

    await Promise.all(promises);
    processed += batch.length;

    if (processed % 40 === 0 || processed === toProcess.length) {
      fs.writeFileSync('./acervo_arquivos_piaui.json', JSON.stringify(results, null, 2), 'utf8');
      console.log(`Progresso: ${processed}/${toProcess.length} escolas. Imagens encontradas: ${totalImagesFound}, PDFs: ${totalPdfsFound}`);
    }
  }

  fs.writeFileSync('./acervo_arquivos_piaui.json', JSON.stringify(results, null, 2), 'utf8');
  console.log(`Concluído! Total de escolas salvas: ${Object.keys(results).length}`);
}

run();
