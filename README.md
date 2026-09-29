# Ekspedisi dengan Resi dan Tracking

Nomor resi otomatis, ongkir dihitung dari berat dan zona tujuan, paket
di-scan di setiap hub transit, dan pelanggan bisa melacak resi lewat halaman
publik.

## Stack

- Next.js 14 + TypeScript + React 18
- Prisma 5 + SQLite
- Tailwind CSS

## Cara Menjalankan

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Buka http://localhost:3000.

## Halaman

- `/` — Dashboard: ringkasan total paket, total ongkir, jumlah per status,
  dan 10 paket terbaru.
- `/paket` — Daftar paket + form paket baru (resi dibuat otomatis,
  ongkir = ceil(berat_kg) × tarif zona tujuan).
- `/scan` — Scan paket di hub: nomor resi, hub, status, keterangan.
  Status paket mengikuti scan terakhir.
- `/lacak` — Lacak resi publik: posisi paket + riwayat perjalanan per hub.

## API

- `GET/POST /api/zona` — master zona (nama, tarif_per_kg, estimasi_hari)
- `GET/POST /api/hub` — master hub (nama, kota)
- `GET/POST /api/paket` — daftar paket (join nama zona) / buat paket baru
- `GET/POST /api/scan` — riwayat scan (filter `?paket_id=`) / scan paket
  (paket_id atau no_resi + hub_id + status)
- `GET /api/lacak/[resi]` — tracking publik per nomor resi
- `GET /api/ringkasan` — total paket, total ongkir, jumlah per status
