# Rasya Ghatfan — Portfolio + Shop + Admin

Website portfolio (frontend + backend dalam satu project) yang siap di-deploy ke **Vercel**.

- **Halaman utama** `/` — portfolio, isinya diambil dari admin panel
- **Shop** `/shop` — katalog produk, tombol order via WhatsApp / link beli
- **Admin panel** `/admin` — upload foto & video karya, kelola produk, ubah bio/kontak
- **Backend** — Vercel Functions di folder `api/`, data & file disimpan di **Vercel Blob**

## Cara deploy (±5 menit)

1. **Upload project ke GitHub** (extract zip ini, lalu push), atau pakai Vercel CLI (`npx vercel`) dari folder ini.
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → pilih repo-nya → **Deploy**.
   (Framework Preset: *Other*. Tidak perlu build command.)
3. **Hubungkan storage:** buka project → tab **Storage** → **Create Database / Store → Blob** → **Connect to Project**.
   Ini otomatis menambahkan `BLOB_READ_WRITE_TOKEN`.
4. **Atur password admin:** project → **Settings → Environment Variables**, tambahkan:
   | Nama | Isi |
   |---|---|
   | `ADMIN_PASSWORD` | password untuk masuk `/admin` (wajib) |
   | `SESSION_SECRET` | string acak panjang, mis. hasil `openssl rand -hex 32` (disarankan) |
5. **Redeploy** (Deployments → ⋯ → Redeploy) supaya env var terbaca.
6. Buka `https://domain-kamu.vercel.app/admin` dan masuk.

## Cara pakai admin

- **Karya** — tambah foto atau video. Poster & ukuran video dibuat otomatis. Urutan ↑↓ = urutan tampil di situs (paling atas = paling awal).
- **Produk** — nama, harga, kategori, deskripsi, sampai 8 foto, status (Tersedia / Habis / Sembunyikan), dan link beli opsional.
- **Pengaturan** — nama, bio, email, Instagram, **nomor WhatsApp untuk order**, mata uang (IDR/USD), kategori karya.

Isi awal situs (4 karya dari zip asli) tampil sampai kamu menyimpan perubahan pertama dari admin.

## Menjalankan di komputer sendiri

```bash
npm i -g vercel
npm install
vercel link            # hubungkan ke project di Vercel
vercel env pull .env.local
vercel dev             # buka http://localhost:3000
```

## Struktur

```
api/        content.js (publik) · auth.js · admin.js · upload.js
lib/        auth, store (Vercel Blob), validasi, data awal
public/     index.html · shop.html · admin.html · assets/ · img/
vercel.json package.json .env.example
```

## Catatan penting

- **Pembayaran:** Shop memakai alur order via WhatsApp / link beli eksternal (Tokopedia, Gumroad, dll). Belum ada payment gateway otomatis.
- Produk berstatus **Sembunyikan** tidak tampil di Shop, tetapi datanya tetap tersimpan di file JSON Blob yang publik. Jangan taruh info rahasia di sana.
- Upload langsung dari browser ke Blob (maks. 500 MB per file). Halaman admin memuat library upload dari `esm.sh`, jadi butuh koneksi internet saat mengunggah.
- Cookie login: `HttpOnly`, `Secure`, `SameSite=Strict`, berlaku 7 hari. Ganti `SESSION_SECRET` untuk mengeluarkan semua sesi.
