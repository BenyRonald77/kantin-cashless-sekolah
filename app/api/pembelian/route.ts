import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/kantin";
import { today, nowIso } from "@/lib/format";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.kartu_id) {
      throw new ApiError(400, "kartu_id wajib (scan kartu/QR siswa)");
    }
    const items = body.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "items tidak boleh kosong");
    }
    const siswa = await prisma.siswa.findUnique({
      where: { kartuId: String(body.kartu_id).toUpperCase() },
    });
    if (!siswa) {
      throw new ApiError(404, "kartu tidak dikenal");
    }

    const baris: { produkId: number; qty: number; harga: number }[] = [];
    let total = 0;
    for (const it of items) {
      const produk = await prisma.produk.findUnique({
        where: { id: Number(it.produk_id) },
      });
      if (!produk) {
        throw new ApiError(404, `produk ${it.produk_id} tidak ditemukan`);
      }
      const qty = Number(it.qty);
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new ApiError(400, "qty harus > 0");
      }
      baris.push({ produkId: produk.id, qty, harga: produk.harga });
      total += qty * produk.harga;
    }

    if (total > siswa.saldo) {
      throw new ApiError(
        402,
        `saldo kurang (saldo ${siswa.saldo}, total ${total})`
      );
    }

    const agg = await prisma.pembelian.aggregate({
      _sum: { total: true },
      where: { siswaId: siswa.id, tanggal: { startsWith: today() } },
    });
    const sudah = agg._sum.total ?? 0;
    if (siswa.batasHarian > 0 && sudah + total > siswa.batasHarian) {
      throw new ApiError(
        409,
        `melewati batas jajan harian (${sudah} + ${total} > ${siswa.batasHarian})`
      );
    }

    const pembelian = await prisma.$transaction(async (tx) => {
      const p = await tx.pembelian.create({
        data: { siswaId: siswa.id, tanggal: nowIso(), total },
      });
      for (const b of baris) {
        await tx.pembelianItem.create({
          data: {
            pembelianId: p.id,
            produkId: b.produkId,
            qty: b.qty,
            hargaSatuan: b.harga, // snapshot harga
          },
        });
      }
      await tx.siswa.update({
        where: { id: siswa.id },
        data: { saldo: { decrement: total } },
      });
      return p;
    });

    const baru = await prisma.siswa.findUniqueOrThrow({ where: { id: siswa.id } });
    return NextResponse.json(
      { id: pembelian.id, total, saldo_baru: baru.saldo },
      { status: 201 }
    );
  } catch (e) {
    return apiError(e);
  }
}
