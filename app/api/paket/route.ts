import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireFields } from "@/lib/api";
import { ApiError, hitungOngkir, nowIso, resiBaru } from "@/lib/ekspedisi";
import { paketToSnake } from "@/lib/mappers";

export async function GET() {
  try {
    const rows = await prisma.paket.findMany({
      include: { zona: { select: { nama: true, estimasiHari: true } } },
      orderBy: [{ dibuatPada: "desc" }, { id: "desc" }],
    });
    return NextResponse.json(rows.map(paketToSnake));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    requireFields(body, [
      "nama_pengirim",
      "nama_penerima",
      "alamat_tujuan",
      "berat_kg",
      "zona_id",
    ]);
    const zona = await prisma.zona.findUnique({
      where: { id: Number(body.zona_id) },
    });
    if (!zona) throw new ApiError(404, "zona tidak ditemukan");
    const berat = Number(body.berat_kg);
    if (!Number.isFinite(berat) || berat <= 0) {
      throw new ApiError(400, "berat_kg harus > 0");
    }
    const ongkir = hitungOngkir(berat, zona.tarifPerKg);
    let resi = resiBaru();
    while (await prisma.paket.findUnique({ where: { noResi: resi } })) {
      resi = resiBaru();
    }
    const created = await prisma.paket.create({
      data: {
        noResi: resi,
        namaPengirim: String(body.nama_pengirim),
        namaPenerima: String(body.nama_penerima),
        alamatTujuan: String(body.alamat_tujuan),
        beratKg: berat,
        zonaId: zona.id,
        ongkir,
        dibuatPada: nowIso(),
      },
      include: { zona: { select: { nama: true, estimasiHari: true } } },
    });
    return NextResponse.json(paketToSnake(created), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
