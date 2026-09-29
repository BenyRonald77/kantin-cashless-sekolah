"use client";

import { useEffect, useState } from "react";

const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

type Produk = { id: number; nama: string; harga: number };
type CartItem = { produk_id: number; nama: string; harga: number; qty: number };

async function api<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || `HTTP ${r.status}`);
  }
  return r.json();
}

export default function KasirPage() {
  const [kartu, setKartu] = useState("");
  const [info, setInfo] = useState("");
  const [katalog, setKatalog] = useState<Produk[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    api<Produk[]>("/api/produk").then(setKatalog).catch((e) => alert(e.message));
  }, []);

  const cek = async () => {
    const kode = kartu.trim().toUpperCase();
    if (!kode) return;
    try {
      const semua = await api<any[]>("/api/siswa");
      const s = semua.find((x) => x.kartu_id === kode);
      if (!s) {
        setInfo("Kartu tidak dikenal");
        return;
      }
      setInfo(
        `${s.nama} (${s.kelas}) · Saldo: ${rupiah(s.saldo)} · Batas harian: ${rupiah(s.batas_harian)}`
      );
    } catch (e: any) {
      setInfo(e.message);
    }
  };

  const tambah = (p: Produk) => {
    setCart((c) => {
      const ada = c.find((x) => x.produk_id === p.id);
      if (ada)
        return c.map((x) => (x.produk_id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { produk_id: p.id, nama: p.nama, harga: p.harga, qty: 1 }];
    });
  };

  const total = cart.reduce((a, x) => a + x.qty * x.harga, 0);

  const bayar = async () => {
    const kode = kartu.trim().toUpperCase();
    if (!kode) return alert("Scan kartu dulu");
    if (!cart.length) return alert("Keranjang kosong");
    const r = await fetch("/api/pembelian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kartu_id: kode,
        items: cart.map(({ produk_id, qty }) => ({ produk_id, qty })),
      }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j.error);
    alert(`Berhasil! Total ${rupiah(j.total)}, saldo tersisa ${rupiah(j.saldo_baru)}`);
    setCart([]);
    cek();
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold">Kasir</h2>
      <div className="mb-4 flex gap-2">
        <input
          value={kartu}
          onChange={(e) => setKartu(e.target.value)}
          placeholder="Scan/ketik ID kartu (KNT-…)"
          className="w-72 rounded border px-3 py-2"
          onKeyDown={(e) => e.key === "Enter" && cek()}
        />
        <button onClick={cek} className="rounded bg-slate-900 px-4 py-2 text-white">
          Cek Saldo
        </button>
      </div>
      {info && (
        <div className="mb-4 rounded bg-emerald-50 p-3 text-sm text-emerald-900">{info}</div>
      )}

      <h3 className="mb-2 font-semibold">Produk</h3>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {katalog.map((p) => (
          <div key={p.id} className="rounded border bg-white p-3">
            <div className="font-semibold">{p.nama}</div>
            <div className="text-sm text-slate-600">{rupiah(p.harga)}</div>
            <button
              onClick={() => tambah(p)}
              className="mt-2 rounded bg-emerald-600 px-3 py-1 text-sm text-white"
            >
              + Keranjang
            </button>
          </div>
        ))}
      </div>

      <h3 className="mb-2 font-semibold">Keranjang</h3>
      <table className="mb-4 w-full border bg-white text-sm">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2">Produk</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Subtotal</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((x, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{x.nama}</td>
              <td className="p-2">{x.qty}</td>
              <td className="p-2">{rupiah(x.qty * x.harga)}</td>
              <td className="p-2">
                <button
                  onClick={() => setCart((c) => c.filter((_, j) => j !== i))}
                  className="text-red-600"
                >
                  hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t bg-slate-50 font-bold">
            <td className="p-2" colSpan={2}>Total</td>
            <td className="p-2" colSpan={2}>{rupiah(total)}</td>
          </tr>
        </tfoot>
      </table>
      <button onClick={bayar} className="rounded bg-emerald-700 px-6 py-2 font-bold text-white">
        Bayar
      </button>
    </div>
  );
}
