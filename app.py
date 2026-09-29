"""Aplikasi Flask ekspedisi dengan resi dan tracking."""
from flask import Flask

from ekspedisi.api import api_bp
from ekspedisi.db import init_db
from ekspedisi.lacak import lacak_bp
from ekspedisi.pages import pages_bp


def create_app() -> Flask:
    app = Flask(__name__)
    init_db()
    app.register_blueprint(api_bp)
    app.register_blueprint(lacak_bp)
    app.register_blueprint(pages_bp)
    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5005, debug=False)
