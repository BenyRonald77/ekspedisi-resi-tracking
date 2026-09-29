"""Lacak resi publik + ringkasan dashboard."""
from flask import Blueprint, jsonify

from ekspedisi.api import _dicts
from ekspedisi.db import get_conn

lacak_bp = Blueprint("lacak", __name__, url_prefix="/api")


@lacak_bp.get("/lacak/<resi>")
def lacak(resi: str):
    conn = get_conn()
    try:
        p = conn.execute(
            """SELECT p.*, z.nama AS nama_zona, z.estimasi_hari FROM paket p
               JOIN zona z ON z.id = p.zona_id
               WHERE p.no_resi = ?""", (resi.strip().upper(),)).fetchone()
        if p is None:
            return jsonify({"error": "nomor resi tidak ditemukan"}), 404
        riwayat = _dicts(conn.execute(
            """SELECT s.waktu, s.status, s.keterangan, h.nama AS nama_hub, h.kota
               FROM scan s JOIN hub h ON h.id = s.hub_id
               WHERE s.paket_id = ? ORDER BY s.waktu, s.id""", (p["id"],)))
        out = dict(p)
        out["riwayat"] = riwayat
        return jsonify(out)
    finally:
        conn.close()


@lacak_bp.get("/ringkasan")
def ringkasan():
    conn = get_conn()
    try:
        per_status = _dicts(conn.execute(
            "SELECT status, COUNT(*) AS jumlah FROM paket GROUP BY status"))
        total_ongkir = conn.execute(
            "SELECT COALESCE(SUM(ongkir),0) FROM paket").fetchone()[0]
        total_paket = conn.execute("SELECT COUNT(*) FROM paket").fetchone()[0]
        return jsonify({"per_status": per_status, "total_paket": total_paket,
                        "total_ongkir": total_ongkir})
    finally:
        conn.close()
