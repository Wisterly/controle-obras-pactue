const fs = require('fs');

async function testExtraction() {
  const cfg = JSON.parse(fs.readFileSync('app_config.json', 'utf8'));
  let totalAll = 0;

  for (const c of cfg.medicoesContratos) {
    const res = await fetch('http://localhost:3000/api/proxy?url=' + encodeURIComponent(c.url));
    const text = await res.text();
    const lines = text.split('\n');
    let count = 0;
    let sample = null;

    const isRmelo = c.name === 'RMELO';
    const startIdx = isRmelo ? 3 : 4;
    
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      if (!line || line.trim().length < 10) continue;
      
      const cols = line.split('","').map(s => s.replace(/^"|"$/g, '').trim());
      
      let gre = '';
      let desc = '';
      let proc = '';
      let val = '';
      let setor = '';

      if (isRmelo) {
        desc = cols[2] || '';
        gre = cols[3] || '';
        proc = cols[4] || '';
        val = cols[6] || '';
        setor = cols[8] || '';
      } else {
        desc = cols[2] || '';
        gre = cols[3] || '';
        proc = cols[4] || '';
        val = cols[5] || '';
        setor = cols[6] || '';
      }

      if (proc || desc || val) {
        count++;
        if (!sample && val) sample = { desc, gre, proc, val, setor };
      }
    }
    console.log(c.name.padEnd(23) + ' -> ' + count + ' medições. Amostra: ' + JSON.stringify(sample));
    totalAll += count;
  }
  console.log('TOTAL GERAL DE MEDIÇÕES DOS 9 CONTRATOS:', totalAll);
}
testExtraction();
