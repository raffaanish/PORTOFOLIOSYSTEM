import { put, list, del } from '@vercel/blob';
import { SEED } from './seed.js';

export const blobReady = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const KEYS = {
  works: 'data/works.json',
  products: 'data/products.json',
  settings: 'data/settings.json'
};
export const COLLECTIONS = Object.keys(KEYS);

/**
 * Baca satu koleksi dari Vercel Blob.
 * strict=true (dipakai admin): lempar error jika gagal, supaya data tidak
 * tertimpa data awal secara tidak sengaja.
 */
export async function readCollection(name, { strict = false } = {}) {
  const fallback = structuredClone(SEED[name]);
  if (!blobReady()) {
    if (strict) throw new Error('Vercel Blob belum terhubung.');
    return fallback;
  }
  try {
    const { blobs } = await list({ prefix: KEYS[name], limit: 10 });
    const hit = blobs.find((b) => b.pathname === KEYS[name]);
    if (!hit) return fallback; // belum pernah disimpan
    const res = await fetch(`${hit.url}?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal membaca ' + name + ' (' + res.status + ')');
    return await res.json();
  } catch (err) {
    console.error('readCollection', name, err);
    if (strict) throw err;
    return fallback;
  }
}

export async function writeCollection(name, data) {
  if (!blobReady()) throw Object.assign(new Error('Vercel Blob belum terhubung.'), { status: 503 });
  await put(KEYS[name], JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  });
}

/** Hapus file yang diunggah lewat admin. URL lokal (/img/...) atau eksternal diabaikan. */
export async function deleteFiles(urls) {
  if (!blobReady()) return 0;
  const ours = [...new Set(urls)].filter((u) => {
    try {
      return new URL(u).hostname.endsWith('.public.blob.vercel-storage.com');
    } catch {
      return false;
    }
  });
  if (ours.length) await del(ours);
  return ours.length;
}
