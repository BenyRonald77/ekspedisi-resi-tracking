"""Halaman UI."""
from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)


@pages_bp.get("/")
def dashboard():
    return render_template("dashboard.html")


@pages_bp.get("/paket")
def paket():
    return render_template("paket.html")


@pages_bp.get("/scan")
def scan():
    return render_template("scan.html")


@pages_bp.get("/lacak")
def lacak():
    return render_template("lacak.html")
