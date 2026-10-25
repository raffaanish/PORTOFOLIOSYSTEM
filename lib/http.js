export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'); } catch { return null; }
}

export function isJsonRequest(req) {
  return String(req.headers['content-type'] || '').toLowerCase().includes('application/json');
}

export function methodNotAllowed(res, allow) {
  res.setHeader('Allow', allow.join(', '));
  return res.status(405).json({ error: 'Method not allowed' });
}
