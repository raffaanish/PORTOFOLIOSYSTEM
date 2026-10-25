import { isAuthed } from '../lib/auth.js';
import { readCollection, writeCollection, deleteFiles, blobReady, COLLECTIONS } from '../lib/store.js';
import { CLEANERS } from '../lib/validate.js';
import { readJson, isJsonRequest, methodNotAllowed } from '../lib/http.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAuthed(req)) return res.status(401).json({ error: 'Belum masuk.' });

  try {
    if (req.method === 'GET') {
      const [works, products, settings] = await Promise.all(
        COLLECTIONS.map((c) => readCollection(c, { strict: blobReady() }))
      );
      return res.status(200).json({ works: works, products: products, settings: settings, blob: blobReady() });
    }

    // Semua perubahan wajib JSON (mencegah CSRF dari form lintas situs)
    if (!isJsonRequest(req)) return res.status(415).json({ error: 'Content-Type harus application/json' });

    if (req.method === 'PUT') {
      const key = String(req.query?.key || '');
      if (!COLLECTIONS.includes(key)) return res.status(400).json({ error: 'Koleksi tidak dikenal.' });
      const body = await readJson(req);
      if (body == null) return res.status(400).json({ error: 'Body tidak valid.' });
      const clean = CLEANERS[key](body);
      await writeCollection(key, clean);
      return res.status(200).json({ data: clean });
    }

    if (req.method === 'DELETE') {
      const body = await readJson(req);
      const urls = Array.isArray(body?.urls) ? body.urls.filter((u) => typeof u === 'string').slice(0, 50) : [];
      const n = await deleteFiles(urls);
      return res.status(200).json({ deleted: n });
    }

    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
  } catch (err) {
    console.error('admin api', err);
    return res.status(err.status || 500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
