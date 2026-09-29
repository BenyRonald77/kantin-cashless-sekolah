"""Halaman UI."""
from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def kasir():
    return render_template("kasir.html")


@pages_bp.get("/siswa")
def siswa():
    return render_template("siswa.html")


@pages_bp.get("/riwayat")
def riwayat():
    return render_template("riwayat.html")


@pages_bp.get("/produk")
def produk():
    return render_template("produk.html")
