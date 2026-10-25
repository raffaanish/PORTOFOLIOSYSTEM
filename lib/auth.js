import crypto from 'node:crypto';

const COOKIE = 'rg_admin';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function key() {
  const base = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
  return crypto.createHash('sha256').update('rg-portfolio:' + base).digest();
}
function sign(payload) {
  return crypto.createHmac('sha256', key()).update(payload).digest('base64url');
}
function sha(s) {
  return crypto.createHash('sha256').update(String(s)).digest();
}

export const adminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(input) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return crypto.timingSafeEqual(sha(input ?? ''), sha(expected));
}

export function createSessionCookie() {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  return `${COOKIE}=${exp}.${sign(exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function getCookie(req, name) {
  const header = req.headers?.cookie || '';
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}

export function isAuthed(req) {
  if (!adminConfigured()) return false;
  const token = getCookie(req, COOKIE);
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  const good = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(good);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
