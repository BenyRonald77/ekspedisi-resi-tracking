import type { Hub, Paket, Scan, Zona } from "@prisma/client";

export const zonaToSnake = (z: Zona) => ({
  id: z.id,
  nama: z.nama,
  tarif_per_kg: z.tarifPerKg,
  estimasi_hari: z.estimasiHari,
});

export const hubToSnake = (h: Hub) => ({
  id: h.id,
  nama: h.nama,
  kota: h.kota,
});

type PaketJoin = Paket & { zona?: { nama: string; estimasiHari: number } };

export const paketToSnake = (p: PaketJoin) => ({
  id: p.id,
  no_resi: p.noResi,
  nama_pengirim: p.namaPengirim,
  nama_penerima: p.namaPenerima,
  alamat_tujuan: p.alamatTujuan,
  berat_kg: p.beratKg,
  zona_id: p.zonaId,
  nama_zona: p.zona?.nama,
  estimasi_hari: p.zona?.estimasiHari,
  ongkir: p.ongkir,
  status: p.status,
  dibuat_pada: p.dibuatPada,
});

type ScanJoin = Scan & { hub?: { nama: string; kota: string } };

export const scanToSnake = (s: ScanJoin) => ({
  id: s.id,
  paket_id: s.paketId,
  hub_id: s.hubId,
  nama_hub: s.hub?.nama,
  kota: s.hub?.kota,
  waktu: s.waktu,
  status: s.status,
  keterangan: s.keterangan ?? "",
});
