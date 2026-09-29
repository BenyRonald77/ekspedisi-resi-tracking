import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/api";
import { hubToSnake } from "@/lib/mappers";

export async function GET() {
  try {
    const rows = await prisma.hub.findMany({ orderBy: { nama: "asc" } });
    return NextResponse.json(rows.map(hubToSnake));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    requireFields(body, ["nama", "kota"]);
    const created = await prisma.hub.create({
      data: { nama: String(body.nama), kota: String(body.kota) },
    });
    return NextResponse.json(hubToSnake(created), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
