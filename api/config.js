import fs from 'fs';
import path from 'path';

const DEFAULT_CONFIG = {
  sheetUrlMain: "",
  sheetUrlContracts: "https://docs.google.com/spreadsheets/d/1SHZdGIlPEgu_M9U0IRak9hyGbc7lsZLXuhNz7pJfNdc/edit?gid=671056752#gid=671056752",
  sheetUrlPactue: "https://docs.google.com/spreadsheets/d/1SHZdGIlPEgu_M9U0IRak9hyGbc7lsZLXuhNz7pJfNdc/edit?gid=1717732222#gid=1717732222",
  sheetUrlMedicoes: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?usp=sharing",
  medicoesContratos: [
    { id: "ct-rmelo", name: "RMELO", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=1656782521#gid=1656782521" },
    { id: "ct-rodrigues-e-rodrigues", name: "RODRIGUES E RODRIGUES", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=1686909159#gid=1686909159" },
    { id: "ct-cp-engenharia", name: "CP ENGENHARIA", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=670888626#gid=670888626" },
    { id: "ct-fel-engemax", name: "F E L / ENGEMAX", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=1912665049#gid=1912665049" },
    { id: "ct-pavcon", name: "PAVCON", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=701250826#gid=701250826" },
    { id: "ct-desenvolva", name: "DESENVOLVA", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=1776695116#gid=1776695116" },
    { id: "ct-oasis", name: "OASIS", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=956198080#gid=956198080" },
    { id: "ct-assertiva", name: "ASSERTIVA", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=770821676#gid=770821676" },
    { id: "ct-monte-claro", name: "MONTE CLARO", url: "https://docs.google.com/spreadsheets/d/1H9fEk7FOtUVhyV5rmoisvspvwtlSeRWQ6vTZMEc7LiQ/edit?gid=1113761868#gid=1113761868" }
  ],
  projetosFolderUrl: "https://drive.google.com/drive/folders/1yBJ5EFkqekhkY0-_Yit0K05qGoGBE8je?usp=drive_link",
  fotosFolderUrl: "https://drive.google.com/drive/folders/1yBJ5EFkqekhkY0-_Yit0K05qGoGBE8je?usp=drive_link",
  autoSyncInterval: "5"
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const configPath = path.join(process.cwd(), 'app_config.json');

  if (req.method === 'GET') {
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf8');
        const parsed = JSON.parse(raw);
        return res.status(200).json({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch (e) {
      console.error('Erro ao ler app_config.json no Vercel:', e);
    }
    return res.status(200).json(DEFAULT_CONFIG);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body && typeof body === 'object') {
        try {
          fs.writeFileSync(configPath, JSON.stringify(body, null, 2), 'utf8');
        } catch (err) {}
        return res.status(200).json({ success: true, data: body });
      }
    } catch (e) {
      return res.status(400).json({ error: 'JSON inválido' });
    }
  }

  return res.status(200).json(DEFAULT_CONFIG);
}
