CREATE TABLE IF NOT EXISTS zona (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL UNIQUE,
  tarif_per_kg INTEGER NOT NULL CHECK (tarif_per_kg >= 0),
  estimasi_hari INTEGER NOT NULL CHECK (estimasi_hari > 0)
);

CREATE TABLE IF NOT EXISTS hub (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kota TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS paket (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  no_resi TEXT NOT NULL UNIQUE,
  nama_pengirim TEXT NOT NULL,
  nama_penerima TEXT NOT NULL,
  alamat_tujuan TEXT NOT NULL,
  berat_kg REAL NOT NULL CHECK (berat_kg > 0),
  zona_id INTEGER NOT NULL REFERENCES zona(id),
  ongkir INTEGER NOT NULL CHECK (ongkir >= 0),
  status TEXT NOT NULL DEFAULT 'diterima'
    CHECK (status IN ('diterima','transit','tiba','diantar','selesai')),
  dibuat_pada TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paket_id INTEGER NOT NULL REFERENCES paket(id),
  hub_id INTEGER NOT NULL REFERENCES hub(id),
  waktu TEXT NOT NULL,
  status TEXT NOT NULL
    CHECK (status IN ('diterima','transit','tiba','diantar','selesai')),
  keterangan TEXT
);

CREATE INDEX IF NOT EXISTS idx_paket_resi ON paket(no_resi);
CREATE INDEX IF NOT EXISTS idx_scan_paket ON scan(paket_id, waktu);
