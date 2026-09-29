# PRD — Ekspedisi dengan Resi dan Tracking

Nomor resi otomatis, ongkir dihitung dari berat dan zona tujuan, paket
di-scan di setiap hub transit, dan pelanggan bisa melacak resi lewat halaman
publik.

## Tujuan

Agen ekspedisi mencatat paket masuk (resi dibuat otomatis, ongkir dihitung
otomatis), setiap hub transit men-scan paket sehingga riwayat perjalanan
terbentuk, dan pelanggan cukup memasukkan nomor resi untuk melihat posisi
paketnya.

## Stack

- Backend: Python + Flask, SQLite (stdlib `sqlite3`)
- Frontend: HTML + vanilla JS + CSS murni

## Model Data

- `zona`: id, nama, tarif_per_kg, estimasi_hari
- `hub`: id, nama, kota
- `paket`: id, no_resi (unik, format `EXP-YYYYMMDD-XXXXXX`),
  nama_pengirim, nama_penerima, alamat_tujuan, berat_kg, zona_id,
  ongkir, status (`diterima`/`transit`/`tiba`/`diantar`/`selesai`),
  dibuat_pada
- `scan`: id, paket_id, hub_id, waktu, keterangan

## Aturan Bisnis

1. Nomor resi dibuat otomatis dan unik.
2. Ongkir = berat_kg × tarif_per_kg zona tujuan (dibulatkan ke atas per kg
   penuh? — versi ini: berat aktual × tarif, dibulatkan ke rupiah).
3. Setiap scan mencatat hub + waktu; status paket mengikuti scan terakhir:
   scan pertama di hub asal → `transit`, scan di hub tujuan → `tiba`,
   scan keluar untuk pengantaran → `diantar`, scan serah terima → `selesai`.
   Status dikirim eksplisit pada tiap scan agar fleksibel.
4. Riwayat scan diurut kronologis dan menjadi dasar halaman lacak publik.

## Tahap Pengerjaan

- **F0 — Fondasi**: PRD, README, struktur, requirements, .gitignore.
- **F1 — Database + API inti**: schema, seed (zona + hub), CRUD zona/hub,
  buat paket (resi otomatis + ongkir otomatis).
- **F2 — Scan & tracking**: API scan per hub, update status, endpoint lacak
  publik per nomor resi.
- **F3 — UI**: Dashboard, Paket, Scan Hub, Lacak Resi.

## Kriteria Selesai

- [ ] Nomor resi unik otomatis; ongkir = berat × tarif zona
- [ ] Scan berurutan membentuk riwayat yang benar
- [ ] Halaman lacak publik menampilkan posisi + riwayat paket
- [ ] `pip install -r requirements.txt && python app.py` langsung jalan

## Non-tujuan

- Integrasi kurir pihak ketiga, pembayaran online, aplikasi driver.
