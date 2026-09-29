import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, apiError } from "@/lib/kantin";
import { produkOut } from "@/lib/mappers";

export async function GET() {
  try {
    const rows = await prisma.produk.findMany({ orderBy: { nama: "asc" } });
    return NextResponse.json(rows.map(produkOut));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.nama || body.harga === undefined || body.harga === null) {
      throw new ApiError(400, "nama dan harga wajib");
    }
    const created = await prisma.produk.create({
      data: { nama: String(body.nama), harga: Number(body.harga) },
    });
    return NextResponse.json(produkOut(created), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
