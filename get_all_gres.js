const fs = require('fs');
const content = fs.readFileSync('C:/Users/Lenovo/.gemini/antigravity/brain/2d47bbfc-14bb-4e35-85da-d8efafb406b2/.system_generated/steps/2470/content.md', 'utf8');

const gres = {};
for (let i = 1; i <= 21; i++) {
  const numStr = String(i).padStart(2, '0');
  const greLabel = `${numStr}ª GRE`;
  const regex = new RegExp(`aria-label="${numStr}ª\\s*GRE[^"]*"[^>]*ssk='5:auSv138:([a-zA-Z0-9_-]+)-0-16'`, 'i');
  const m = content.match(regex);
  if (m) {
    gres[greLabel] = m[1];
  } else {
    // Alternative match
    const idx = content.indexOf(`${numStr}ª GRE`);
    if (idx !== -1) {
      const sub = content.slice(idx, idx + 200);
      const sub2 = content.slice(Math.max(0, idx - 200), idx + 200);
      const idMatch = sub2.match(/ssk='5:auSv138:([a-zA-Z0-9_-]+)-0-16'/);
      if (idMatch) gres[greLabel] = idMatch[1];
    }
  }
}

console.log(JSON.stringify(gres, null, 2));
