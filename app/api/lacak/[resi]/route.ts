import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";
import { ApiError } from "@/lib/ekspedisi";
import { paketToSnake, scanToSnake } from "@/lib/mappers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { resi: string } }
) {
  try {
    const resi = decodeURIComponent(params.resi).trim().toUpperCase();
    const p = await prisma.paket.findUnique({
      where: { noResi: resi },
      include: {
        zona: { select: { nama: true, estimasiHari: true } },
        scans: {
          include: { hub: { select: { nama: true, kota: true } } },
          orderBy: [{ waktu: "asc" }, { id: "asc" }],
        },
      },
    });
    if (!p) throw new ApiError(404, "nomor resi tidak ditemukan");
    const out = paketToSnake(p);
    return NextResponse.json({
      ...out,
      riwayat: p.scans.map((s) => {
        const row = scanToSnake(s);
        return {
          waktu: row.waktu,
          status: row.status,
          keterangan: row.keterangan,
          nama_hub: row.nama_hub,
          kota: row.kota,
        };
      }),
    });
  } catch (e) {
    return apiError(e);
  }
}
