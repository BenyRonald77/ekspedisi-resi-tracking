import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";
import { ApiError, STATUS, nowIso } from "@/lib/ekspedisi";
import { scanToSnake } from "@/lib/mappers";

export async function GET(req: NextRequest) {
  try {
    const paketId = req.nextUrl.searchParams.get("paket_id");
    const rows = await prisma.scan.findMany({
      where: paketId ? { paketId: Number(paketId) } : undefined,
      include: { hub: { select: { nama: true, kota: true } } },
      orderBy: [{ waktu: "asc" }, { id: "asc" }],
    });
    return NextResponse.json(rows.map(scanToSnake));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    if (!(STATUS as readonly string[]).includes(String(body.status))) {
      throw new ApiError(400, `status harus salah satu: ${STATUS.join(", ")}`);
    }
    if (!body.hub_id) throw new ApiError(400, "hub_id wajib");
    let paketId: number | null = null;
    if (body.paket_id) {
      const p = await prisma.paket.findUnique({
        where: { id: Number(body.paket_id) },
        select: { id: true },
      });
      if (!p) throw new ApiError(404, "paket tidak ditemukan");
      paketId = p.id;
    } else if (body.no_resi) {
      const p = await prisma.paket.findUnique({
        where: { noResi: String(body.no_resi).trim().toUpperCase() },
        select: { id: true },
      });
      if (!p) throw new ApiError(404, "paket tidak ditemukan");
      paketId = p.id;
    } else {
      throw new ApiError(400, "paket_id atau no_resi wajib");
    }
    const hub = await prisma.hub.findUnique({
      where: { id: Number(body.hub_id) },
      select: { id: true },
    });
    if (!hub) throw new ApiError(404, "hub tidak ditemukan");
    const created = await prisma.scan.create({
      data: {
        paketId,
        hubId: hub.id,
        waktu:
          body.waktu !== undefined && body.waktu !== null && body.waktu !== ""
            ? String(body.waktu)
            : nowIso(),
        status: String(body.status),
        keterangan: body.keterangan ? String(body.keterangan) : "",
      },
    });
    await prisma.paket.update({
      where: { id: paketId },
      data: { status: String(body.status) },
    });
    return NextResponse.json(scanToSnake(created), { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
