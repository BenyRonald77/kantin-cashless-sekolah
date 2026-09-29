# PRD — Kantin Cashless Sekolah

Siswa membayar di kantin dengan kartu/QR berisi saldo. Orang tua bisa
mengisi saldo, menetapkan batas jajan harian, dan melihat riwayat pembelian
anaknya.

## Tujuan

Kantin sekolah tanpa uang tunai: tiap siswa punya akun bersaldo (diakses
via kartu/QR ber-ID unik). Kasir memindai ID lalu mencatat pembelian.
Orang tua top-up saldo, menetapkan batas belanja harian, dan memantau apa
saja yang dibeli anak.

## Stack

- Backend: Next.js 14 (App Router) + TypeScript, Prisma 5 + SQLite
- Frontend: React 18 + Tailwind CSS

## Model Data

- `siswa`: id, nama, kelas, kartu_id (unik, format `KNT-XXXXXX`), saldo,
  batas_harian (default 50000, 0 = tanpa batas)
- `produk`: id, nama, harga
- `topup`: id, siswa_id, tanggal, jumlah, metode
- `pembelian`: id, siswa_id, tanggal, total
- `pembelian_item`: id, pembelian_id, produk_id, qty, harga_satuan
  (snapshot harga)

## Aturan Bisnis

1. Pembayaran ditolak bila saldo kurang (`402`) atau bila total belanja hari
   ini + transaksi ini melebihi batas_harian (`409`).
2. Saldo tidak boleh negatif; topup menambah saldo.
3. Harga produk di-snapshot ke `pembelian_item` agar riwayat tidak berubah
   saat harga diubah.
4. Batas harian dihitung dari total pembelian siswa pada tanggal kalender
   yang sama (waktu server).

## Tahap Pengerjaan

- **F0 — Fondasi**: PRD, README, struktur, package.json, .gitignore.
- **F1 — Database + API inti**: schema, seed, CRUD siswa & produk, topup,
  pembelian via kartu_id dengan validasi saldo & batas harian.
- **F2 — Pantau ortu**: riwayat pembelian per siswa, ringkasan belanja
  harian, ubah batas harian.
- **F3 — UI**: Kasir, Siswa (topup + batas), Riwayat, Produk.

## Kriteria Selesai

- [x] Bayar dengan saldo kurang ditolak; melewati batas harian ditolak
- [x] Topup menambah saldo; batas harian bisa diubah ortu
- [x] Riwayat pembelian per siswa tampil lengkap dengan item
- [x] `npm install && npx prisma generate && npx prisma db push && npm run seed && npm run dev` langsung jalan

## Non-tujuan

- Cetak kartu fisik/NFC, integrasi e-wallet sungguhan, aplikasi ortu mobile.
