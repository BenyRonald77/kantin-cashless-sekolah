import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/kantin";
import { produkOut } from "@/lib/mappers";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json().catch(() => null);
    const data: { nama?: string; harga?: number } = {};
    if (body && body.nama !== undefined) data.nama = String(body.nama);
    if (body && body.harga !== undefined) data.harga = Number(body.harga);
    if (Object.keys(data).length === 0) {
      throw new ApiError(400, "tidak ada field yang diubah");
    }
    let updated;
    try {
      updated = await prisma.produk.update({ where: { id }, data });
    } catch {
      throw new ApiError(404, "produk tidak ditemukan");
    }
    return NextResponse.json(produkOut(updated));
  } catch (e) {
    return apiError(e);
  }
}
