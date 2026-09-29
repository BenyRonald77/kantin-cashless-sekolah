import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/kantin";
import { siswaOut } from "@/lib/mappers";
import { nowIso } from "@/lib/format";

export async function GET() {
  try {
    const rows = await prisma.topup.findMany({
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      take: 100,
      include: { siswa: { select: { nama: true } } },
    });
    return NextResponse.json(
      rows.map((t) => ({
        id: t.id,
        siswa_id: t.siswaId,
        tanggal: t.tanggal,
        jumlah: t.jumlah,
        metode: t.metode,
        nama_siswa: t.siswa.nama,
      }))
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || body.jumlah === undefined || body.jumlah === null || body.jumlah === "") {
      throw new ApiError(400, "jumlah wajib");
    }
    const jumlah = Number(body.jumlah);
    if (!Number.isInteger(jumlah) || jumlah <= 0) {
      throw new ApiError(400, "jumlah harus > 0");
    }
    let siswa = null;
    if (body.siswa_id) {
      siswa = await prisma.siswa.findUnique({ where: { id: Number(body.siswa_id) } });
    } else if (body.kartu_id) {
      siswa = await prisma.siswa.findUnique({
        where: { kartuId: String(body.kartu_id).toUpperCase() },
      });
    } else {
      throw new ApiError(400, "siswa_id atau kartu_id wajib");
    }
    if (!siswa) {
      throw new ApiError(404, "siswa tidak ditemukan");
    }
    await prisma.$transaction([
      prisma.siswa.update({ where: { id: siswa.id }, data: { saldo: { increment: jumlah } } }),
      prisma.topup.create({
        data: {
          siswaId: siswa.id,
          tanggal: nowIso(),
          jumlah,
          metode: body.metode ? String(body.metode) : "tunai",
        },
      }),
    ]);
    const updated = await prisma.siswa.findUniqueOrThrow({ where: { id: siswa.id } });
    return NextResponse.json({ siswa: siswaOut(updated), topup: jumlah }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
