"use client";

import { useEffect, useState } from "react";

const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

type Produk = { id: number; nama: string; harga: number };

export default function ProdukPage() {
  const [rows, setRows] = useState<Produk[]>([]);
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [edit, setEdit] = useState<Record<number, { nama: string; harga: string }>>({});

  const load = () =>
    fetch("/api/produk").then((r) => r.json()).then(setRows).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const tambah = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/produk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, harga: Number(harga) }),
    });
    if (!r.ok) return alert((await r.json()).error);
    setNama(""); setHarga("");
    load();
  };

  const ubah = async (id: number) => {
    const ed = edit[id] || {};
    const r = await fetch(`/api/produk/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(ed.nama !== undefined ? { nama: ed.nama } : {}),
        ...(ed.harga !== undefined && ed.harga !== "" ? { harga: Number(ed.harga) } : {}),
      }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    setEdit((e) => {
      const x = { ...e };
      delete x[id];
      return x;
    });
    load();
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Produk</h2>
      <table className="mb-8 w-full border bg-white text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2">Nama</th>
            <th className="p-2">Harga</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">
                <input
                  value={edit[p.id]?.nama ?? p.nama}
                  onChange={(e) =>
                    setEdit((x) => ({ ...x, [p.id]: { ...(x[p.id] || { nama: p.nama, harga: String(p.harga) }), nama: e.target.value } }))
                  }
                  className="w-full rounded border px-2 py-1"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  min={0}
                  value={edit[p.id]?.harga ?? String(p.harga)}
                  onChange={(e) =>
                    setEdit((x) => ({ ...x, [p.id]: { ...(x[p.id] || { nama: p.nama, harga: String(p.harga) }), harga: e.target.value } }))
                  }
                  className="w-32 rounded border px-2 py-1"
                />
              </td>
              <td className="p-2">
                <button onClick={() => ubah(p.id)} className="rounded bg-slate-700 px-2 py-1 text-white">
                  Simpan
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mb-2 font-semibold">Tambah Produk</h3>
      <form onSubmit={tambah} className="flex gap-2">
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama" required className="rounded border px-3 py-2" />
        <input value={harga} onChange={(e) => setHarga(e.target.value)} type="number" min={0} placeholder="Harga" required className="rounded border px-3 py-2" />
        <button className="rounded bg-emerald-700 px-4 py-2 text-white">Simpan</button>
      </form>
      <p className="mt-2 text-xs text-slate-500">
        Harga produk di-snapshot saat pembelian; riwayat lama tidak berubah saat harga diubah.
      </p>
    </div>
  );
}
