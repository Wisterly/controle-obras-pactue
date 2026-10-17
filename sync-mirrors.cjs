const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'index.html');
const targets = [
  path.join(__dirname, 'Controle de Obras GPR.html'),
  path.join(__dirname, 'controle_de_obras_gpr.html')
];

if (fs.existsSync(src)) {
  const content = fs.readFileSync(src);
  targets.forEach(t => {
    fs.writeFileSync(t, content);
    console.log(`[Sync] Espelhado com sucesso -> ${path.basename(t)}`);
  });
}
