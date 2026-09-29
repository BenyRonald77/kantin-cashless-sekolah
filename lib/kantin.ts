import { NextResponse } from "next/server";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function apiError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ error: "kesalahan server" }, { status: 500 });
}

/** Kartu unik format KNT-XXXXXX. */
export function randomKartuId(): string {
  return "KNT-" + String(Math.floor(100000 + Math.random() * 900000));
}
