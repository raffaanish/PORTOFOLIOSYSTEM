import { adminConfigured, checkPassword, createSessionCookie, clearSessionCookie, isAuthed } from '../lib/auth.js';
import { blobReady } from '../lib/store.js';
import { readJson, isJsonRequest, methodNotAllowed } from '../lib/http.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ authed: isAuthed(req), configured: adminConfigured(), blob: blobReady() });
  }

  if (req.method === 'POST') {
    if (!isJsonRequest(req)) return res.status(415).json({ error: 'Content-Type harus application/json' });
    if (!adminConfigured()) {
      return res.status(503).json({ error: 'ADMIN_PASSWORD belum diatur di Environment Variables Vercel.' });
    }
    const body = await readJson(req);
    if (!checkPassword(body?.password)) {
      await sleep(900); // perlambat tebak-tebakan password
      return res.status(401).json({ error: 'Password salah.' });
    }
    res.setHeader('Set-Cookie', createSessionCookie());
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearSessionCookie());
    return res.status(200).json({ ok: true });
  }

  return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
}
