import { handleUpload } from '@vercel/blob/client';
import { isAuthed } from '../lib/auth.js';
import { readJson, methodNotAllowed } from '../lib/http.js';

// Upload langsung dari browser ke Vercel Blob (tanpa batas 4.5 MB body function).
// Endpoint ini hanya membuat token upload, dan hanya untuk admin yang sudah login.
export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const body = await readJson(req);
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body tidak valid.' });

  // Event "upload-completed" datang dari server Vercel (tanpa cookie); hanya token yang perlu login.
  if (body.type === 'blob.generate-client-token' && !isAuthed(req)) {
    return res.status(401).json({ error: 'Belum masuk.' });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/*', 'video/*'],
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true
      }),
      onUploadCompleted: async () => {}
    });
    return res.status(200).json(json);
  } catch (err) {
    console.error('upload', err);
    return res.status(400).json({ error: err.message });
  }
}
