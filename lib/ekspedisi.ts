import { randomInt } from "crypto";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Status yang valid, sama persis dengan versi Python. */
export const STATUS = ["diterima", "transit", "tiba", "diantar", "selesai"] as const;
export type PaketStatus = (typeof STATUS)[number];

/** Waktu lokal ISO tanpa offset, presisi detik — sama seperti
 *  datetime.now().isoformat(timespec="seconds") versi Python. */
export const nowIso = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours()
  )}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

/** Nomor resi: EXP-YYYYMMDD-XXXXXX (X = digit acak), sama seperti Python. */
export const resiBaru = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const tgl = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  return `EXP-${tgl}-${String(randomInt(0, 1000000)).padStart(6, "0")}`;
};

/** Ongkir = ceil(berat_kg) × tarif_per_kg, sama seperti Python. */
export const hitungOngkir = (beratKg: number, tarifPerKg: number) =>
  Math.ceil(beratKg) * tarifPerKg;
