from __future__ import annotations

import os
import socket
import sys
import threading
import time
import webbrowser
from pathlib import Path


APP_NAME = "PersonalWorkLog"
HOST = "127.0.0.1"
DEFAULT_PORT = 5000


def app_root() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parent


def configure_portable_data() -> None:
    root = app_root()
    data_dir = root / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("WORKLOG_DB_PATH", str(data_dir / "worklog_v3.db"))


def find_port(start_port: int = DEFAULT_PORT) -> int:
    for port in range(start_port, start_port + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError("No available local port found.")


def open_browser(url: str) -> None:
    time.sleep(1)
    webbrowser.open(url)


def main() -> None:
    configure_portable_data()

    from app import app

    port = find_port()
    url = f"http://{HOST}:{port}"
    threading.Thread(target=open_browser, args=(url,), daemon=True).start()
    app.run(host=HOST, port=port, debug=False, use_reloader=False)


if __name__ == "__main__":
    main()
