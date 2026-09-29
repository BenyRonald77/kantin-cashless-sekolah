"""Aplikasi Flask kantin cashless sekolah."""
from flask import Flask

from kantin.api import api_bp
from kantin.db import init_db
from kantin.pages import pages_bp
from kantin.pantau import pantau_bp


def create_app() -> Flask:
    app = Flask(__name__)
    init_db()
    app.register_blueprint(api_bp)
    app.register_blueprint(pantau_bp)
    app.register_blueprint(pages_bp)
    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5006, debug=False)
