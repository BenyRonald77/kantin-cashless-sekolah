// Mapper Prisma (camelCase) -> JSON snake_case, paritas dengan API Python.

type Siswa = { id: number; nama: string; kelas: string; kartuId: string; saldo: number; batasHarian: number };

export const siswaOut = (s: Siswa) => ({
  id: s.id,
  nama: s.nama,
  kelas: s.kelas,
  kartu_id: s.kartuId,
  saldo: s.saldo,
  batas_harian: s.batasHarian,
});

type Produk = { id: number; nama: string; harga: number };

export const produkOut = (p: Produk) => ({
  id: p.id,
  nama: p.nama,
  harga: p.harga,
});

export const pembelianItemOut = (it: {
  id: number;
  produkId: number;
  qty: number;
  hargaSatuan: number;
  namaProduk?: string;
}) => ({
  id: it.id,
  produk_id: it.produkId,
  qty: it.qty,
  harga_satuan: it.hargaSatuan,
  ...(it.namaProduk !== undefined ? { nama_produk: it.namaProduk } : {}),
});
