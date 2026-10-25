import { readCollection } from '../lib/store.js';
import { methodNotAllowed } from '../lib/http.js';

// Endpoint publik: dipakai halaman utama dan halaman Shop.
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const [works, products, settings] = await Promise.all([
    readCollection('works'),
    readCollection('products'),
    readCollection('settings')
  ]);
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=60');
  res.status(200).json({
    works,
    products: products.filter((p) => p.status !== 'hidden'),
    settings
  });
}
