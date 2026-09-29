import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/api";
import { ApiError } from "@/lib/ekspedisi";
import { zonaToSnake } from "@/lib/mappers";

export async function GET() {
  try {
    const rows = await prisma.zona.findMany({ orderBy: { nama: "asc" } });
    return NextResponse.json(rows.map(zonaToSnake));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    requireFields(body, ["nama", "tarif_per_kg", "estimasi_hari"]);
    const tarif = Number(body.tarif_per_kg);
    const estimasi = Number(body.estimasi_hari);
    if (!Number.isFinite(tarif) || tarif < 0) {
      throw new ApiError(400, "tarif_per_kg harus >= 0");
    }
    if (!Number.isInteger(estimasi) || estimasi <= 0) {
      throw new ApiError(400, "estimasi_hari harus > 0");
    }
    const created = await prisma.zona.create({
      data: {
        nama: String(body.nama),
        tarifPerKg: tarif,
        estimasiHari: estimasi,
      },
    });
    return NextResponse.json(zonaToSnake(created), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
