"""CRUD zona/hub + buat paket (resi + ongkir otomatis) + scan per hub."""
import math
import random
from datetime import datetime

from flask import Blueprint, jsonify, request

from ekspedisi.db import get_conn

api_bp = Blueprint("api", __name__, url_prefix="/api")

STATUS = ["diterima", "transit", "tiba", "diantar", "selesai"]


def _dicts(cur):
    return [dict(r) for r in cur.fetchall()]


def _paket_row(conn, paket_id: int):
    return conn.execute(
        """SELECT p.*, z.nama AS nama_zona, z.estimasi_hari FROM paket p
           JOIN zona z ON z.id = p.zona_id WHERE p.id = ?""", (paket_id,)).fetchone()


def _crud(table: str, fields: list[str], order: str = "id"):
    base = "/" + table

    @api_bp.get(base, endpoint=f"list_{table}")
    def list_():
        conn = get_conn()
        try:
            return jsonify(_dicts(conn.execute(f"SELECT * FROM {table} ORDER BY {order}")))
        finally:
            conn.close()

    @api_bp.post(base, endpoint=f"create_{table}")
    def create():
        data = request.get_json(force=True)
        missing = [f for f in fields if f not in data or data[f] in (None, "")]
        if missing:
            return jsonify({"error": f"field wajib: {', '.join(missing)}"}), 400
        conn = get_conn()
        try:
            cur = conn.execute(
                f"INSERT INTO {table} ({', '.join(fields)})"
                f" VALUES ({', '.join('?' for _ in fields)})",
                [data[f] for f in fields])
            conn.commit()
            return jsonify(dict(conn.execute(
                f"SELECT * FROM {table} WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
        except Exception as e:  # noqa: BLE001
            return jsonify({"error": str(e)}), 400
        finally:
            conn.close()


_crud("zona", ["nama", "tarif_per_kg", "estimasi_hari"], order="nama")
_crud("hub", ["nama", "kota"], order="nama")


# ---------- paket ----------

@api_bp.get("/paket")
def list_paket():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT p.*, z.nama AS nama_zona FROM paket p
               JOIN zona z ON z.id = p.zona_id
               ORDER BY p.dibuat_pada DESC, p.id DESC""")))
    finally:
        conn.close()


@api_bp.post("/paket")
def create_paket():
    """Buat paket: no_resi otomatis, ongkir = ceil(berat) × tarif_per_kg."""
    data = request.get_json(force=True)
    for f in ("nama_pengirim", "nama_penerima", "alamat_tujuan", "berat_kg", "zona_id"):
        if f not in data or data[f] in (None, ""):
            return jsonify({"error": f"field wajib: {f}"}), 400
    conn = get_conn()
    try:
        z = conn.execute("SELECT * FROM zona WHERE id = ?",
                         (data["zona_id"],)).fetchone()
        if z is None:
            return jsonify({"error": "zona tidak ditemukan"}), 404
        try:
            berat = float(data["berat_kg"])
            assert berat > 0
        except (ValueError, AssertionError):
            return jsonify({"error": "berat_kg harus > 0"}), 400
        ongkir = math.ceil(berat) * z["tarif_per_kg"]
        dibuat = datetime.now()
        resi = f"EXP-{dibuat:%Y%m%d}-{random.randint(0, 999999):06d}"
        while conn.execute("SELECT id FROM paket WHERE no_resi = ?",
                           (resi,)).fetchone():
            resi = f"EXP-{dibuat:%Y%m%d}-{random.randint(0, 999999):06d}"
        cur = conn.execute(
            """INSERT INTO paket (no_resi, nama_pengirim, nama_penerima,
                                  alamat_tujuan, berat_kg, zona_id, ongkir,
                                  dibuat_pada)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (resi, data["nama_pengirim"], data["nama_penerima"],
             data["alamat_tujuan"], berat, z["id"], ongkir,
             dibuat.isoformat(timespec="seconds")))
        conn.commit()
        return jsonify(dict(_paket_row(conn, cur.lastrowid))), 201
    finally:
        conn.close()


# ---------- scan ----------

@api_bp.get("/scan")
def list_scan():
    paket_id = request.args.get("paket_id")
    conn = get_conn()
    try:
        q = ("""SELECT s.*, h.nama AS nama_hub, h.kota FROM scan s
                JOIN hub h ON h.id = s.hub_id""")
        vals = []
        if paket_id:
            q += " WHERE s.paket_id = ?"
            vals.append(paket_id)
        return jsonify(_dicts(conn.execute(q + " ORDER BY s.waktu, s.id", vals)))
    finally:
        conn.close()


@api_bp.post("/scan")
def create_scan():
    """Scan paket di hub: {"no_resi"|"paket_id", "hub_id", "status", "keterangan"}.
    Status paket mengikuti scan terakhir."""
    data = request.get_json(force=True)
    if data.get("status") not in STATUS:
        return jsonify({"error": f"status harus salah satu: {', '.join(STATUS)}"}), 400
    if not data.get("hub_id"):
        return jsonify({"error": "hub_id wajib"}), 400
    conn = get_conn()
    try:
        if data.get("paket_id"):
            p = conn.execute("SELECT id FROM paket WHERE id = ?",
                             (data["paket_id"],)).fetchone()
        elif data.get("no_resi"):
            p = conn.execute("SELECT id FROM paket WHERE no_resi = ?",
                             (data["no_resi"],)).fetchone()
        else:
            return jsonify({"error": "paket_id atau no_resi wajib"}), 400
        if p is None:
            return jsonify({"error": "paket tidak ditemukan"}), 404
        if conn.execute("SELECT id FROM hub WHERE id = ?",
                        (data["hub_id"],)).fetchone() is None:
            return jsonify({"error": "hub tidak ditemukan"}), 404
        waktu = data.get("waktu") or datetime.now().isoformat(timespec="seconds")
        cur = conn.execute(
            "INSERT INTO scan (paket_id, hub_id, waktu, status, keterangan)"
            " VALUES (?, ?, ?, ?, ?)",
            (p["id"], data["hub_id"], waktu, data["status"],
             data.get("keterangan", "")))
        conn.execute("UPDATE paket SET status = ? WHERE id = ?",
                     (data["status"], p["id"]))
        conn.commit()
        return jsonify(dict(conn.execute(
            "SELECT * FROM scan WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
    finally:
        conn.close()
