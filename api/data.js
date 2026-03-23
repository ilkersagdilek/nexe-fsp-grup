export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const GH_TOKEN = process.env.GH_TOKEN;
  const DATA_URL = 'https://api.github.com/repos/ilkersagdilek/nexe-fsp-grup/contents/data.json';
  const headers = { 'Authorization': 'Bearer ' + GH_TOKEN, 'Content-Type': 'application/json' };

  if (req.method === 'GET') {
    const r = await fetch(DATA_URL, { headers });
    const d = await r.json();
    if (!d.content) return res.status(500).json({ error: 'Veri okunamadı' });
    const bytes = Buffer.from(d.content.replace(/\n/g,''), 'base64');
    const data = JSON.parse(bytes.toString('utf-8'));
    return res.json({ ...data, _sha: d.sha });
  }

  if (req.method === 'PUT') {
    const { data, sha } = req.body;
    const content = Buffer.from(JSON.stringify(data)).toString('base64');
    const r = await fetch(DATA_URL, {
      method: 'PUT', headers,
      body: JSON.stringify({ message: 'update: data', content, sha })
    });
    const d = await r.json();
    if (!d.commit) return res.status(500).json({ error: d.message });
    return res.json({ ok: true, sha: d.content?.sha });
  }

  res.status(405).end();
}