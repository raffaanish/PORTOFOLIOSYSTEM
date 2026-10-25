import crypto from 'node:crypto';

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
// hanya izinkan http(s) atau path lokal (/...), blok javascript: dan //host
const url = (v) => {
  const s = str(v, 2000);
  return /^(https?:\/\/|\/(?!\/))/i.test(s) ? s : '';
};
const oneOf = (v, list, def) => (list.includes(v) ? v : def);
const id = (v) => (typeof v === 'string' && /^[a-z0-9_-]{4,40}$/i.test(v) ? v : crypto.randomBytes(6).toString('hex'));
const arr = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);

export function cleanWork(w = {}) {
  return {
    id: id(w.id),
    title: str(w.title, 120) || 'Untitled',
    category: str(w.category, 60),
    type: oneOf(w.type, ['image', 'video'], 'image'),
    src: url(w.src),
    poster: url(w.poster),
    width: Math.max(0, Math.round(num(w.width))) || 1080,
    height: Math.max(0, Math.round(num(w.height))) || 1920,
    software: str(w.software, 120),
    metaLabel: str(w.metaLabel, 40) || 'Format',
    metaValue: str(w.metaValue, 160)
  };
}

export function cleanProduct(p = {}) {
  return {
    id: id(p.id),
    name: str(p.name, 120) || 'Untitled product',
    price: Math.max(0, num(p.price)),
    category: str(p.category, 60),
    description: str(p.description, 3000),
    images: arr(p.images, 8).map(url).filter(Boolean),
    status: oneOf(p.status, ['active', 'soldout', 'hidden'], 'active'),
    buyUrl: url(p.buyUrl),
    createdAt: Number.isFinite(Number(p.createdAt)) ? Number(p.createdAt) : Date.now()
  };
}

export function cleanSettings(s = {}) {
  return {
    name: str(s.name, 80) || 'Rasya Ghatfan',
    role: str(s.role, 80),
    bio: arr(s.bio, 8).map((x) => str(x, 1200)).filter(Boolean),
    email: str(s.email, 120),
    instagram: str(s.instagram, 80).replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[@/]/g, ''),
    whatsapp: str(s.whatsapp, 30).replace(/\D/g, ''),
    currency: oneOf(s.currency, ['IDR', 'USD'], 'IDR'),
    shopIntro: str(s.shopIntro, 400),
    workCategories: arr(s.workCategories, 20).map((x) => str(x, 60)).filter(Boolean)
  };
}

export const CLEANERS = {
  works: (data) => arr(data, 500).map(cleanWork).filter((w) => w.src),
  products: (data) => arr(data, 500).map(cleanProduct),
  settings: (data) => cleanSettings(data)
};
