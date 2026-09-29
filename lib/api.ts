import { NextResponse } from "next/server";
import { ApiError } from "@/lib/ekspedisi";

export function apiError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof Error) {
    const code = (e as unknown as { code?: string }).code;
    // Prisma: P2002 unique violation, P2003 FK violation → 400 (paritas Python)
    if (code === "P2002" || code === "P2003") {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  return NextResponse.json({ error: "kesalahan server" }, { status: 500 });
}

export function requireFields(body: Record<string, unknown>, fields: string[]): void {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ""
  );
  if (missing.length) {
    throw new ApiError(400, `field wajib: ${missing.join(", ")}`);
  }
}
