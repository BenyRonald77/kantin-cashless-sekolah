CREATE TABLE IF NOT EXISTS siswa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  kartu_id TEXT NOT NULL UNIQUE,
  saldo INTEGER NOT NULL DEFAULT 0 CHECK (saldo >= 0),
  batas_harian INTEGER NOT NULL DEFAULT 50000 CHECK (batas_harian >= 0)
);

CREATE TABLE IF NOT EXISTS produk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  harga INTEGER NOT NULL CHECK (harga >= 0)
);

CREATE TABLE IF NOT EXISTS topup (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siswa_id INTEGER NOT NULL REFERENCES siswa(id),
  tanggal TEXT NOT NULL,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  metode TEXT
);

CREATE TABLE IF NOT EXISTS pembelian (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  siswa_id INTEGER NOT NULL REFERENCES siswa(id),
  tanggal TEXT NOT NULL,
  total INTEGER NOT NULL CHECK (total >= 0)
);

CREATE TABLE IF NOT EXISTS pembelian_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pembelian_id INTEGER NOT NULL REFERENCES pembelian(id),
  produk_id INTEGER NOT NULL REFERENCES produk(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  harga_satuan INTEGER NOT NULL CHECK (harga_satuan >= 0)
);

CREATE INDEX IF NOT EXISTS idx_siswa_kartu ON siswa(kartu_id);
CREATE INDEX IF NOT EXISTS idx_beli_siswa ON pembelian(siswa_id, tanggal);
