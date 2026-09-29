import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api";

export async function GET() {
  try {
    const perStatus = await prisma.paket.groupBy({
      by: ["status"],
      _count: { status: true },
    });
    const totalPaket = await prisma.paket.count();
    const agg = await prisma.paket.aggregate({
      _sum: { ongkir: true },
    });
    return NextResponse.json({
      per_status: perStatus.map((r) => ({ status: r.status, jumlah: r._count.status })),
      total_paket: totalPaket,
      total_ongkir: agg._sum.ongkir ?? 0,
    });
  } catch (e) {
    return apiError(e);
  }
}
