"use client";

import { useEffect, useState } from "react";

const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

type Siswa = {
  id: number;
  nama: string;
  kelas: string;
  kartu_id: string;
  saldo: number;
  batas_harian: number;
};

async function get<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`);
  return r.json();
}

export default function SiswaPage() {
  const [rows, setRows] = useState<Siswa[]>([]);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [batas, setBatasInput] = useState("50000");
  const [batasBaru, setBatasBaru] = useState<Record<number, string>>({});
  const [topupSiswa, setTopupSiswa] = useState("");
  const [topupJumlah, setTopupJumlah] = useState("");
  const [topupMetode, setTopupMetode] = useState("");

  const load = () => get<Siswa[]>("/api/siswa").then(setRows).catch((e) => alert(e.message));
  useEffect(() => {
    load();
  }, []);

  const tambah = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/siswa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, kelas, batas_harian: Number(batas) }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    alert("Kartu baru: " + j.kartu_id);
    setNama(""); setKelas(""); setBatasInput("50000");
    load();
  };

  const topup = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siswa_id: Number(topupSiswa),
        jumlah: Number(topupJumlah),
        metode: topupMetode || undefined,
      }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    alert("Topup berhasil. Saldo: " + rupiah(j.siswa.saldo));
    setTopupJumlah(""); setTopupMetode("");
    load();
  };

  const setBatas = async (id: number) => {
    const r = await fetch(`/api/siswa/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batas_harian: Number(batasBaru[id]) }),
    });
    if (r.ok) { alert("Batas harian diubah"); load(); }
    else alert((await r.json()).error);
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Siswa</h2>
      <table className="mb-8 w-full border bg-white text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2">Kartu</th>
            <th className="p-2">Nama</th>
            <th className="p-2">Kelas</th>
            <th className="p-2">Saldo</th>
            <th className="p-2">Batas Harian</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.id} className="border-t">
              <td className="p-2 font-bold">{x.kartu_id}</td>
              <td className="p-2">{x.nama}</td>
              <td className="p-2">{x.kelas}</td>
              <td className="p-2">{rupiah(x.saldo)}</td>
              <td className="p-2">
                <input
                  type="number"
                  min={0}
                  value={batasBaru[x.id] ?? String(x.batas_harian)}
                  onChange={(e) => setBatasBaru((b) => ({ ...b, [x.id]: e.target.value }))}
                  className="w-28 rounded border px-2 py-1"
                />
              </td>
              <td className="p-2">
                <button onClick={() => setBatas(x.id)} className="rounded bg-slate-700 px-2 py-1 text-white">
                  Ubah Batas
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold">Tambah Siswa</h3>
          <form onSubmit={tambah} className="flex flex-col gap-2">
            <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama" required className="rounded border px-3 py-2" />
            <input value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Kelas" required className="rounded border px-3 py-2" />
            <input value={batas} onChange={(e) => setBatasInput(e.target.value)} type="number" min={0} placeholder="Batas harian" className="rounded border px-3 py-2" />
            <button className="rounded bg-emerald-700 px-4 py-2 text-white">Simpan</button>
          </form>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Topup Saldo</h3>
          <form onSubmit={topup} className="flex flex-col gap-2">
            <select value={topupSiswa} onChange={(e) => setTopupSiswa(e.target.value)} required className="rounded border px-3 py-2">
              <option value="">— pilih siswa —</option>
              {rows.map((x) => (
                <option key={x.id} value={x.id}>{x.nama} ({x.kartu_id})</option>
              ))}
            </select>
            <input value={topupJumlah} onChange={(e) => setTopupJumlah(e.target.value)} type="number" min={1} placeholder="Jumlah" required className="rounded border px-3 py-2" />
            <input value={topupMetode} onChange={(e) => setTopupMetode(e.target.value)} placeholder="Metode (tunai/transfer)" className="rounded border px-3 py-2" />
            <button className="rounded bg-emerald-700 px-4 py-2 text-white">Topup</button>
          </form>
        </div>
      </div>
    </div>
  );
}
