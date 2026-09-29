# Ekspedisi dengan Resi dan Tracking

Resi otomatis, ongkir dari berat & zona, scan di tiap hub transit, halaman
lacak resi untuk pelanggan.

## Cara Menjalankan

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Buka http://localhost:5005. Database dibuat otomatis dan di-seed (zona &
hub) saat pertama dijalankan.

## Struktur

```
├── PRD.md
├── requirements.txt
├── app.py
├── ekspedisi/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── seed.sql
│   ├── api.py      # zona, hub, paket, scan
│   └── lacak.py    # endpoint lacak publik + dashboard ringkasan
├── static/
└── templates/
```
