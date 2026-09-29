import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError, randomKartuId } from "@/lib/kantin";
import { siswaOut } from "@/lib/mappers";

export async function GET() {
  try {
    const rows = await prisma.siswa.findMany({
      orderBy: [{ kelas: "asc" }, { nama: "asc" }],
    });
    return NextResponse.json(rows.map(siswaOut));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.nama || !body.kelas) {
      throw new ApiError(400, "nama dan kelas wajib");
    }
    let kartuId = randomKartuId();
    while (await prisma.siswa.findUnique({ where: { kartuId } })) {
      kartuId = randomKartuId();
    }
    const created = await prisma.siswa.create({
      data: {
        nama: String(body.nama),
        kelas: String(body.kelas),
        kartuId,
        saldo: 0,
        batasHarian: body.batas_harian !== undefined ? Number(body.batas_harian) : 50000,
      },
    });
    return NextResponse.json(siswaOut(created), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
