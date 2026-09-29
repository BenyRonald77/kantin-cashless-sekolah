"""CRUD siswa/produk + topup + pembelian via kartu_id."""
import random
from datetime import datetime

from flask import Blueprint, jsonify, request

from kantin.db import get_conn

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _dicts(cur):
    return [dict(r) for r in cur.fetchall()]


def _hari_ini() -> str:
    return datetime.now().date().isoformat()


def _belanja_hari_ini(conn, siswa_id: int) -> int:
    return conn.execute(
        "SELECT COALESCE(SUM(total),0) FROM pembelian"
        " WHERE siswa_id = ? AND substr(tanggal,1,10) = ?",
        (siswa_id, _hari_ini())).fetchone()[0]


# ---------- siswa ----------

@api_bp.get("/siswa")
def list_siswa():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute("SELECT * FROM siswa ORDER BY kelas, nama")))
    finally:
        conn.close()


@api_bp.post("/siswa")
def create_siswa():
    data = request.get_json(force=True)
    if not data.get("nama") or not data.get("kelas"):
        return jsonify({"error": "nama dan kelas wajib"}), 400
    conn = get_conn()
    try:
        kartu = f"KNT-{random.randint(100000, 999999)}"
        while conn.execute("SELECT id FROM siswa WHERE kartu_id = ?",
                           (kartu,)).fetchone():
            kartu = f"KNT-{random.randint(100000, 999999)}"
        cur = conn.execute(
            "INSERT INTO siswa (nama, kelas, kartu_id, saldo, batas_harian)"
            " VALUES (?, ?, ?, ?, ?)",
            (data["nama"], data["kelas"], kartu, 0,
             int(data.get("batas_harian", 50000))))
        conn.commit()
        return jsonify(dict(conn.execute(
            "SELECT * FROM siswa WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
    finally:
        conn.close()


@api_bp.patch("/siswa/<int:s_id>")
def update_siswa(s_id: int):
    data = request.get_json(force=True)
    if "batas_harian" not in data:
        return jsonify({"error": "batas_harian wajib"}), 400
    try:
        batas = int(data["batas_harian"])
        assert batas >= 0
    except (ValueError, AssertionError):
        return jsonify({"error": "batas_harian harus >= 0"}), 400
    conn = get_conn()
    try:
        cur = conn.execute("UPDATE siswa SET batas_harian = ? WHERE id = ?",
                           (batas, s_id))
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "siswa tidak ditemukan"}), 404
        return jsonify(dict(conn.execute(
            "SELECT * FROM siswa WHERE id = ?", (s_id,)).fetchone()))
    finally:
        conn.close()


# ---------- produk ----------

@api_bp.get("/produk")
def list_produk():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute("SELECT * FROM produk ORDER BY nama")))
    finally:
        conn.close()


@api_bp.post("/produk")
def create_produk():
    data = request.get_json(force=True)
    if not data.get("nama") or data.get("harga") is None:
        return jsonify({"error": "nama dan harga wajib"}), 400
    conn = get_conn()
    try:
        cur = conn.execute("INSERT INTO produk (nama, harga) VALUES (?, ?)",
                           (data["nama"], int(data["harga"])))
        conn.commit()
        return jsonify(dict(conn.execute(
            "SELECT * FROM produk WHERE id = ?", (cur.lastrowid,)).fetchone())), 201
    finally:
        conn.close()


@api_bp.put("/produk/<int:p_id>")
def update_produk(p_id: int):
    data = request.get_json(force=True)
    conn = get_conn()
    try:
        sets, vals = [], []
        for f in ("nama", "harga"):
            if f in data:
                sets.append(f"{f} = ?")
                vals.append(data[f])
        if not sets:
            return jsonify({"error": "tidak ada field yang diubah"}), 400
        cur = conn.execute(f"UPDATE produk SET {', '.join(sets)} WHERE id = ?",
                           vals + [p_id])
        conn.commit()
        if cur.rowcount == 0:
            return jsonify({"error": "produk tidak ditemukan"}), 404
        return jsonify(dict(conn.execute(
            "SELECT * FROM produk WHERE id = ?", (p_id,)).fetchone()))
    finally:
        conn.close()


# ---------- topup ----------

@api_bp.get("/topup")
def list_topup():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT t.*, s.nama AS nama_siswa FROM topup t
               JOIN siswa s ON s.id = t.siswa_id
               ORDER BY t.tanggal DESC, t.id DESC LIMIT 100""")))
    finally:
        conn.close()


@api_bp.post("/topup")
def create_topup():
    """{"siswa_id"|"kartu_id", "jumlah", "metode"}"""
    data = request.get_json(force=True)
    if not data.get("jumlah"):
        return jsonify({"error": "jumlah wajib"}), 400
    try:
        jumlah = int(data["jumlah"])
        assert jumlah > 0
    except (ValueError, AssertionError):
        return jsonify({"error": "jumlah harus > 0"}), 400
    conn = get_conn()
    try:
        if data.get("siswa_id"):
            s = conn.execute("SELECT * FROM siswa WHERE id = ?",
                             (data["siswa_id"],)).fetchone()
        elif data.get("kartu_id"):
            s = conn.execute("SELECT * FROM siswa WHERE kartu_id = ?",
                             (data["kartu_id"],)).fetchone()
        else:
            return jsonify({"error": "siswa_id atau kartu_id wajib"}), 400
        if s is None:
            return jsonify({"error": "siswa tidak ditemukan"}), 404
        conn.execute("UPDATE siswa SET saldo = saldo + ? WHERE id = ?",
                     (jumlah, s["id"]))
        conn.execute(
            "INSERT INTO topup (siswa_id, tanggal, jumlah, metode) VALUES (?, ?, ?, ?)",
            (s["id"], datetime.now().isoformat(timespec="seconds"),
             jumlah, data.get("metode", "tunai")))
        conn.commit()
        s = conn.execute("SELECT * FROM siswa WHERE id = ?", (s["id"],)).fetchone()
        return jsonify({"siswa": dict(s), "topup": jumlah}), 201
    finally:
        conn.close()


# ---------- pembelian ----------

@api_bp.post("/pembelian")
def create_pembelian():
    """Kasir: {"kartu_id": "...", "items": [{"produk_id":.., "qty":..}]}.
    Tolak bila saldo kurang (402) atau melewati batas harian (409)."""
    data = request.get_json(force=True)
    if not data.get("kartu_id"):
        return jsonify({"error": "kartu_id wajib (scan kartu/QR siswa)"}), 400
    items = data.get("items") or []
    if not items:
        return jsonify({"error": "items tidak boleh kosong"}), 400
    conn = get_conn()
    try:
        s = conn.execute("SELECT * FROM siswa WHERE kartu_id = ?",
                         (data["kartu_id"],)).fetchone()
        if s is None:
            return jsonify({"error": "kartu tidak dikenal"}), 404
        baris, total = [], 0
        for it in items:
            p = conn.execute("SELECT * FROM produk WHERE id = ?",
                             (it.get("produk_id"),)).fetchone()
            if p is None:
                return jsonify({"error": f"produk {it.get('produk_id')} tidak ditemukan"}), 404
            qty = int(it.get("qty", 0))
            if qty <= 0:
                return jsonify({"error": "qty harus > 0"}), 400
            baris.append((p, qty))
            total += qty * p["harga"]
        if total > s["saldo"]:
            return jsonify({"error": f"saldo kurang (saldo {s['saldo']}, total {total})"}), 402
        sudah = _belanja_hari_ini(conn, s["id"])
        if s["batas_harian"] > 0 and sudah + total > s["batas_harian"]:
            return jsonify({"error": f"melewati batas jajan harian "
                            f"({sudah} + {total} > {s['batas_harian']})"}), 409
        cur = conn.execute(
            "INSERT INTO pembelian (siswa_id, tanggal, total) VALUES (?, ?, ?)",
            (s["id"], datetime.now().isoformat(timespec="seconds"), total))
        bid = cur.lastrowid
        for p, qty in baris:
            conn.execute(
                "INSERT INTO pembelian_item (pembelian_id, produk_id, qty, harga_satuan)"
                " VALUES (?, ?, ?, ?)", (bid, p["id"], qty, p["harga"]))
        conn.execute("UPDATE siswa SET saldo = saldo - ? WHERE id = ?",
                     (total, s["id"]))
        conn.commit()
        s = conn.execute("SELECT * FROM siswa WHERE id = ?", (s["id"],)).fetchone()
        return jsonify({"id": bid, "total": total,
                        "saldo_baru": s["saldo"]}), 201
    finally:
        conn.close()
