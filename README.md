# Kantin Cashless Sekolah

Siswa membayar di kantin dengan kartu/QR berisi saldo. Orang tua bisa mengisi saldo, menetapkan batas jajan harian, dan melihat riwayat pembelian anaknya.

## Stack

Next.js 14 + TypeScript + Prisma 5 + SQLite + Tailwind CSS.

## Cara Menjalankan

```
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

## Halaman

- `/` — Kasir: scan/ketik ID kartu, cek saldo, pilih produk, bayar.
- `/siswa` — Kelola siswa: tambah siswa (kartu KNT-XXXXXX otomatis), topup saldo, ubah batas harian.
- `/riwayat` — Riwayat pembelian per siswa + ringkasan belanja harian.
- `/produk` — CRUD produk (harga di-snapshot saat pembelian).

## API

- `GET/POST /api/siswa`, `PATCH /api/siswa/[id]` (ubah batas_harian)
- `GET/POST /api/produk`, `PUT /api/produk/[id]`
- `GET/POST /api/topup` (siswa_id atau kartu_id, jumlah > 0)
- `POST /api/pembelian` (kartu_id + items; 402 saldo kurang, 409 melewati batas harian)
- `GET /api/siswa/[id]/riwayat`
- `GET /api/ringkasan-harian` (?tanggal=YYYY-MM-DD opsional)

## Aturan Bisnis

- Pembayaran ditolak bila saldo kurang (`402`) atau bila total belanja hari ini + transaksi ini melebihi batas_harian (`409`).
- Topup menambah saldo; saldo tidak boleh negatif.
- Harga produk di-snapshot ke item pembelian agar riwayat tidak berubah saat harga diubah.
- Batas harian dihitung dari total pembelian siswa pada tanggal kalender yang sama (waktu server); `batas_harian = 0` berarti tanpa batas.
