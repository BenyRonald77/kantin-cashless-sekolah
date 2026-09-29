import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/kantin";
import { today } from "@/lib/format";

export async function GET(req: NextRequest) {
  try {
    const tanggal = req.nextUrl.searchParams.get("tanggal") || today();
    const semua = await prisma.siswa.findMany({
      orderBy: [{ kelas: "asc" }, { nama: "asc" }],
    });
    const agg = await prisma.pembelian.groupBy({
      by: ["siswaId"],
      _sum: { total: true },
      where: { tanggal: { startsWith: tanggal } },
    });
    const map = new Map(agg.map((a) => [a.siswaId, a._sum.total ?? 0]));
    return NextResponse.json(
      semua.map((s) => ({
        id: s.id,
        nama: s.nama,
        kelas: s.kelas,
        batas_harian: s.batasHarian,
        total_belanja: map.get(s.id) ?? 0,
      }))
    );
  } catch (e) {
    return apiError(e);
  }
}
