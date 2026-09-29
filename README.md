# Kantin Cashless Sekolah

Bayar dengan kartu/QR bersaldo, ortu isi saldo + batasi jajan harian,
riwayat pembelian anak terpantau.

## Cara Menjalankan

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Buka http://localhost:5006. Database dibuat otomatis dan di-seed saat
pertama dijalankan.

## Struktur

```
├── PRD.md
├── requirements.txt
├── app.py
├── kantin/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── seed.sql
│   ├── api.py      # siswa, produk, topup, pembelian
│   └── pantau.py   # riwayat ortu + ringkasan
├── static/
└── templates/
```
