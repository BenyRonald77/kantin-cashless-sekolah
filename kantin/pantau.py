"""Riwayat pembelian per siswa + ringkasan untuk orang tua."""
from flask import Blueprint, jsonify, request

from kantin.api import _belanja_hari_ini, _dicts, _hari_ini
from kantin.db import get_conn

pantau_bp = Blueprint("pantau", __name__, url_prefix="/api")


@pantau_bp.get("/siswa/<int:s_id>/riwayat")
def riwayat(s_id: int):
    conn = get_conn()
    try:
        s = conn.execute("SELECT * FROM siswa WHERE id = ?", (s_id,)).fetchone()
        if s is None:
            return jsonify({"error": "siswa tidak ditemukan"}), 404
        out = []
        for b in conn.execute(
                "SELECT * FROM pembelian WHERE siswa_id = ?"
                " ORDER BY tanggal DESC, id DESC LIMIT 100", (s_id,)):
            items = _dicts(conn.execute(
                """SELECT pi.*, p.nama AS nama_produk FROM pembelian_item pi
                   JOIN produk p ON p.id = pi.produk_id
                   WHERE pi.pembelian_id = ?""", (b["id"],)))
            out.append({**dict(b), "items": items})
        return jsonify({"siswa": dict(s),
                        "belanja_hari_ini": _belanja_hari_ini(conn, s_id),
                        "riwayat": out})
    finally:
        conn.close()


@pantau_bp.get("/ringkasan-harian")
def ringkasan_harian():
    """Total belanja per siswa hari ini (param tanggal opsional YYYY-MM-DD)."""
    tanggal = request.args.get("tanggal") or _hari_ini()
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT s.id, s.nama, s.kelas, s.batas_harian,
                      COALESCE(SUM(b.total),0) AS total_belanja
               FROM siswa s LEFT JOIN pembelian b
                 ON b.siswa_id = s.id AND substr(b.tanggal,1,10) = ?
               GROUP BY s.id ORDER BY s.kelas, s.nama""", (tanggal,))))
    finally:
        conn.close()
