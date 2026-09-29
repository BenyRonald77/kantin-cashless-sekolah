import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/kantin";
import { siswaOut } from "@/lib/mappers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json().catch(() => null);
    if (!body || body.batas_harian === undefined) {
      throw new ApiError(400, "batas_harian wajib");
    }
    const batas = Number(body.batas_harian);
    if (!Number.isInteger(batas) || batas < 0) {
      throw new ApiError(400, "batas_harian harus >= 0");
    }
    let updated;
    try {
      updated = await prisma.siswa.update({ where: { id }, data: { batasHarian: batas } });
    } catch {
      throw new ApiError(404, "siswa tidak ditemukan");
    }
    return NextResponse.json(siswaOut(updated));
  } catch (e) {
    return apiError(e);
  }
}
