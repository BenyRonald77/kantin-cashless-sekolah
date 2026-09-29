"use client";

import { useEffect, useState } from "react";

const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

type Item = { id: number; produk_id: number; qty: number; harga_satuan: number; nama_produk: string };
type Beli = { id: number; siswa_id: number; tanggal: string; total: number; items: Item[] };
type Siswa = { id: number; nama: string; kelas: string; kartu_id: string; saldo: number; batas_harian: number };
type Ringkasan = { id: number; nama: string; kelas: string; batas_harian: number; total_belanja: number };

export default function RiwayatPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [sid, setSid] = useState("");
  const [data, setData] = useState<{ siswa: Siswa; belanja_hari_ini: number; riwayat: Beli[] } | null>(null);
  const [ringkasan, setRingkasan] = useState<Ringkasan[]>([]);

  useEffect(() => {
    fetch("/api/siswa").then((r) => r.json()).then(setSiswaList).catch(() => {});
    fetch("/api/ringkasan-harian").then((r) => r.json()).then(setRingkasan).catch(() => {});
  }, []);

  const lihat = async () => {
    if (!sid) return;
    const r = await fetch(`/api/siswa/${sid}/riwayat`);
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    setData(j);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Riwayat & Ringkasan</h2>

      <div className="mb-6 flex gap-2">
        <select value={sid} onChange={(e) => setSid(e.target.value)} className="rounded border px-3 py-2">
          <option value="">— pilih siswa —</option>
          {siswaList.map((s) => (
            <option key={s.id} value={s.id}>{s.nama} ({s.kartu_id})</option>
          ))}
        </select>
        <button onClick={lihat} className="rounded bg-slate-900 px-4 py-2 text-white">Lihat Riwayat</button>
      </div>

      {data && (
        <div className="mb-8">
          <div className="mb-3 rounded bg-slate-100 p-3 text-sm">
            <b>{data.siswa.nama}</b> ({data.siswa.kelas}) · Saldo {rupiah(data.siswa.saldo)} ·
            Belanja hari ini {rupiah(data.belanja_hari_ini)} / batas {rupiah(data.siswa.batas_harian)}
          </div>
          {data.riwayat.map((b) => (
            <div key={b.id} className="mb-3 rounded border bg-white p-3 text-sm">
              <div className="flex justify-between font-semibold">
                <span>{b.tanggal}</span>
                <span>{rupiah(b.total)}</span>
              </div>
              <ul className="mt-1 list-disc pl-5 text-slate-700">
                {b.items.map((it) => (
                  <li key={it.id}>
                    {it.nama_produk} × {it.qty} @ {rupiah(it.harga_satuan)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!data.riwayat.length && <p className="text-slate-500">Belum ada pembelian.</p>}
        </div>
      )}

      <h3 className="mb-2 font-semibold">Ringkasan Belanja Hari Ini</h3>
      <table className="w-full border bg-white text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2">Nama</th>
            <th className="p-2">Kelas</th>
            <th className="p-2">Total Belanja</th>
            <th className="p-2">Batas Harian</th>
          </tr>
        </thead>
        <tbody>
          {ringkasan.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{r.nama}</td>
              <td className="p-2">{r.kelas}</td>
              <td className="p-2">{rupiah(r.total_belanja)}</td>
              <td className="p-2">{rupiah(r.batas_harian)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
