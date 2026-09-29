import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/kantin";
import { siswaOut, pembelianItemOut } from "@/lib/mappers";
import { today } from "@/lib/format";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sId = Number(params.id);
    const siswa = await prisma.siswa.findUnique({ where: { id: sId } });
    if (!siswa) {
      throw new ApiError(404, "siswa tidak ditemukan");
    }
    const belis = await prisma.pembelian.findMany({
      where: { siswaId: sId },
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      take: 100,
      include: { items: { include: { produk: { select: { nama: true } } } } },
    });
    const agg = await prisma.pembelian.aggregate({
      _sum: { total: true },
      where: { siswaId: sId, tanggal: { startsWith: today() } },
    });
    const riwayat = belis.map((b) => ({
      id: b.id,
      siswa_id: b.siswaId,
      tanggal: b.tanggal,
      total: b.total,
      items: b.items.map((it) =>
        pembelianItemOut({
          id: it.id,
          produkId: it.produkId,
          qty: it.qty,
          hargaSatuan: it.hargaSatuan,
          namaProduk: it.produk.nama,
        })
      ),
    }));
    return NextResponse.json({
      siswa: siswaOut(siswa),
      belanja_hari_ini: agg._sum.total ?? 0,
      riwayat,
    });
  } catch (e) {
    return apiError(e);
  }
}
