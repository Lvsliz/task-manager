from __future__ import annotations

import threading
import time
import webbrowser

from app import app


HOST = "127.0.0.1"
PORT = 5000
URL = f"http://{HOST}:{PORT}"


def open_browser() -> None:
    time.sleep(1)
    webbrowser.open(URL)


if __name__ == "__main__":
    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host=HOST, port=PORT, debug=False, use_reloader=False)
