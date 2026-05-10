from __future__ import annotations

import os
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request


BASE_DIR = Path(__file__).resolve().parent
RESOURCE_DIR = Path(getattr(sys, "_MEIPASS", BASE_DIR))
DB_PATH = Path(os.environ.get("WORKLOG_DB_PATH", BASE_DIR / "worklog_v3.db"))

app = Flask(
    __name__,
    template_folder=str(RESOURCE_DIR / "templates"),
    static_folder=str(RESOURCE_DIR / "static"),
)

CURRENT_SCHEMA_VERSION = 2
DEFAULT_PROJECT_NAME = "General"
INBOX_TASK_NAME = "Inbox"
DEFAULT_CATEGORY_NAME = "Misc"
DEFAULT_REMIND_AFTER_DAYS = 3
INBOX_REMIND_AFTER_DAYS = 30
VALID_TASK_STATUSES = {"active", "completed"}
VALID_REMINDER_WINDOWS = {3, 7, 14, 30}


SCHEMA = """
CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#9B9B9B'
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at TEXT NOT NULL,
    last_log_time TEXT,
    remind_after_days INTEGER NOT NULL DEFAULT 3 CHECK (remind_after_days > 0),
    folder_path TEXT,
    UNIQUE(name, project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    log_time TEXT NOT NULL,
    duration INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_last_log_time ON tasks(last_log_time);
CREATE INDEX IF NOT EXISTS idx_logs_task_time ON logs(task_id, log_time DESC, id DESC);
"""

DEFAULT_CATEGORIES = [
    ("Focus", "#4A90E2"),
    ("Meeting", "#F5A623"),
    ("Admin", "#7B8A8B"),
    (DEFAULT_CATEGORY_NAME, "#9B9B9B"),
]


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def parse_iso(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def parse_positive_int(value: Any, default: int | None = None) -> int | None:
    if value in (None, ""):
        return default
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed > 0 else default


def label_for_date(dt: datetime) -> str:
    today = datetime.now().date()
    if dt.date() == today:
        return "Today"
    if dt.date() == today - timedelta(days=1):
        return "Yesterday"
    if dt.year == today.year:
        return f"{dt.month}月{dt.day}日"
    return f"{dt.year}年{dt.month}月{dt.day}日"


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(SCHEMA)
        migrate_db(conn)
        ensure_seed_data(conn)
        conn.commit()


def get_schema_version(conn: sqlite3.Connection) -> int:
    row = conn.execute(
        "SELECT value FROM meta WHERE key = 'schema_version'"
    ).fetchone()
    if not row:
        return 0
    try:
        return int(row["value"])
    except (TypeError, ValueError):
        return 0


def set_meta(conn: sqlite3.Connection, key: str, value: Any) -> None:
    conn.execute(
        """
        INSERT INTO meta (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
        """,
        (key, str(value)),
    )


def set_schema_version(conn: sqlite3.Connection, version: int) -> None:
    set_meta(conn, "schema_version", version)


def migrate_db(conn: sqlite3.Connection) -> None:
    version = get_schema_version(conn)
    if version > CURRENT_SCHEMA_VERSION:
        raise RuntimeError(
            f"Database schema version {version} is newer than app version "
            f"{CURRENT_SCHEMA_VERSION}."
        )

    # Version 1 is the new clean baseline. Future migrations should be explicit
    # version-to-version steps here, without inferring historical table shapes.
    if version < 1:
        set_schema_version(conn, 1)
        set_meta(conn, "schema_initialized_at", now_iso())
        version = 1

    if version < 2:
        columns = {
            row["name"] for row in conn.execute("PRAGMA table_info(tasks)").fetchall()
        }
        if "folder_path" not in columns:
            conn.execute("ALTER TABLE tasks ADD COLUMN folder_path TEXT")
        set_schema_version(conn, 2)


def get_or_create_project(conn: sqlite3.Connection, name: str | None) -> int:
    project_name = (name or DEFAULT_PROJECT_NAME).strip() or DEFAULT_PROJECT_NAME
    row = conn.execute(
        "SELECT id FROM projects WHERE LOWER(name) = LOWER(?)",
        (project_name,),
    ).fetchone()
    if row:
        return int(row["id"])

    cursor = conn.execute(
        "INSERT INTO projects (name, created_at) VALUES (?, ?)",
        (project_name, now_iso()),
    )
    return int(cursor.lastrowid)


def get_or_create_category(
    conn: sqlite3.Connection,
    name: str,
    color: str = "#9B9B9B",
) -> int:
    category_name = name.strip() or DEFAULT_CATEGORY_NAME
    row = conn.execute(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER(?)",
        (category_name,),
    ).fetchone()
    if row:
        return int(row["id"])

    cursor = conn.execute(
        "INSERT INTO categories (name, color) VALUES (?, ?)",
        (category_name, color or "#9B9B9B"),
    )
    return int(cursor.lastrowid)


def get_default_category_id(conn: sqlite3.Connection) -> int:
    return get_or_create_category(conn, DEFAULT_CATEGORY_NAME, "#9B9B9B")


def ensure_seed_data(conn: sqlite3.Connection) -> None:
    general_project_id = get_or_create_project(conn, DEFAULT_PROJECT_NAME)
    for name, color in DEFAULT_CATEGORIES:
        get_or_create_category(conn, name, color)

    misc_category_id = get_default_category_id(conn)
    conn.execute(
        """
        INSERT INTO tasks
            (name, project_id, category_id, status, created_at, last_log_time, remind_after_days)
        VALUES (?, ?, ?, 'active', ?, NULL, ?)
        ON CONFLICT(name, project_id) DO UPDATE SET
            category_id = excluded.category_id,
            status = 'active',
            remind_after_days = excluded.remind_after_days
        """,
        (
            INBOX_TASK_NAME,
            general_project_id,
            misc_category_id,
            now_iso(),
            INBOX_REMIND_AFTER_DAYS,
        ),
    )


def task_select_sql(where_clause: str = "") -> str:
    return f"""
        SELECT
            tasks.id,
            tasks.name,
            tasks.project_id,
            tasks.category_id,
            tasks.status,
            tasks.created_at,
            tasks.last_log_time,
            tasks.remind_after_days,
            tasks.folder_path,
            projects.name AS project_name,
            categories.name AS category_name,
            categories.color AS category_color
        FROM tasks
        LEFT JOIN projects ON projects.id = tasks.project_id
        LEFT JOIN categories ON categories.id = tasks.category_id
        {where_clause}
    """


def normalize_status(value: Any) -> str:
    return value if value in VALID_TASK_STATUSES else "active"


def serialize_task(row: sqlite3.Row) -> dict[str, Any]:
    task_name = (row["name"] or "").strip() or "Untitled Task"
    project_name = (row["project_name"] or "").strip() or "Unknown Project"
    category_name = (row["category_name"] or "").strip() or DEFAULT_CATEGORY_NAME
    category_color = (row["category_color"] or "").strip() or "#9B9B9B"
    status = normalize_status(row["status"])
    remind_after_days = parse_positive_int(
        row["remind_after_days"], DEFAULT_REMIND_AFTER_DAYS
    ) or DEFAULT_REMIND_AFTER_DAYS
    created_at = row["created_at"] or now_iso()
    last_log_time = row["last_log_time"]
    stale_level = None
    stale_days = None
    stale_base = parse_iso(last_log_time) or parse_iso(created_at)

    if status == "active" and task_name != INBOX_TASK_NAME and stale_base:
        stale_days = max((datetime.now() - stale_base).days, 0)
        if stale_days > remind_after_days:
            stale_level = "warning"

    return {
        "id": int(row["id"]),
        "name": task_name,
        "project_id": int(row["project_id"]) if row["project_id"] is not None else None,
        "project_name": project_name,
        "category_id": int(row["category_id"]) if row["category_id"] is not None else None,
        "category_name": category_name,
        "category_color": category_color,
        "status": status,
        "created_at": created_at,
        "last_log_time": last_log_time,
        "remind_after_days": remind_after_days,
        "folder_path": row["folder_path"],
        "stale_level": stale_level,
        "stale_days": stale_days,
        "is_inbox": task_name == INBOX_TASK_NAME and project_name == DEFAULT_PROJECT_NAME,
    }


def serialize_log(row: sqlite3.Row) -> dict[str, Any]:
    log_time = row["log_time"] or now_iso()
    dt = parse_iso(log_time) or datetime.now()
    return {
        "id": int(row["id"]),
        "task_id": int(row["task_id"]),
        "content": row["content"] or "",
        "log_time": log_time,
        "time_label": dt.strftime("%H:%M"),
        "date_label": label_for_date(dt),
        "duration": row["duration"],
        "created_at": row["created_at"],
    }


def fetch_tasks(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        task_select_sql(
            """
            ORDER BY
                CASE WHEN projects.name = ? THEN 0 ELSE 1 END,
                LOWER(COALESCE(projects.name, '')),
                CASE tasks.status WHEN 'active' THEN 0 ELSE 1 END,
                COALESCE(tasks.last_log_time, tasks.created_at) DESC,
                LOWER(tasks.name)
            """
        ),
        (DEFAULT_PROJECT_NAME,),
    ).fetchall()
    return [serialize_task(row) for row in rows]


def fetch_task(conn: sqlite3.Connection, task_id: int) -> dict[str, Any] | None:
    row = conn.execute(
        task_select_sql("WHERE tasks.id = ?"),
        (task_id,),
    ).fetchone()
    return serialize_task(row) if row else None


def fetch_task_row(conn: sqlite3.Connection, task_id: int) -> sqlite3.Row | None:
    return conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()


def fetch_projects(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT id, name, created_at
        FROM projects
        ORDER BY CASE WHEN name = ? THEN 0 ELSE 1 END, LOWER(name)
        """,
        (DEFAULT_PROJECT_NAME,),
    ).fetchall()
    return [
        {
            "id": int(row["id"]),
            "name": row["name"] or DEFAULT_PROJECT_NAME,
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def fetch_categories(conn: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = conn.execute(
        "SELECT id, name, color FROM categories ORDER BY LOWER(name)"
    ).fetchall()
    return [
        {
            "id": int(row["id"]),
            "name": row["name"] or DEFAULT_CATEGORY_NAME,
            "color": row["color"] or "#9B9B9B",
        }
        for row in rows
    ]


def fetch_stale_tasks(tasks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [task for task in tasks if task["stale_level"]]


def fetch_logs(conn: sqlite3.Connection, task_id: int) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT id, task_id, content, log_time, duration, created_at
        FROM logs
        WHERE task_id = ?
        ORDER BY log_time DESC, id DESC
        """,
        (task_id,),
    ).fetchall()
    return [serialize_log(row) for row in rows]


def parse_reminder_window(value: Any, default: int = DEFAULT_REMIND_AFTER_DAYS) -> int:
    parsed = parse_positive_int(value, default)
    if parsed not in VALID_REMINDER_WINDOWS:
        raise ValueError("Invalid reminder window")
    return parsed


def normalize_folder_path(value: Any) -> str | None:
    if value in (None, ""):
        return None
    path = str(value).strip().strip('"')
    return path or None


@app.route("/")
def index() -> str:
    return render_template("index.html")


@app.get("/api/bootstrap")
def bootstrap() -> Any:
    with get_db() as conn:
        ensure_seed_data(conn)
        conn.commit()
        tasks = fetch_tasks(conn)
        inbox_task = next((task for task in tasks if task["is_inbox"]), None)
        return jsonify(
            {
                "schema_version": CURRENT_SCHEMA_VERSION,
                "defaults": {
                    "project_name": DEFAULT_PROJECT_NAME,
                    "inbox_task_name": INBOX_TASK_NAME,
                    "category_name": DEFAULT_CATEGORY_NAME,
                    "remind_after_days": DEFAULT_REMIND_AFTER_DAYS,
                },
                "projects": fetch_projects(conn),
                "categories": fetch_categories(conn),
                "tasks": tasks,
                "stale_tasks": fetch_stale_tasks(tasks),
                "inbox_task_id": inbox_task["id"] if inbox_task else None,
            }
        )


@app.get("/api/tasks/<int:task_id>/logs")
def task_logs(task_id: int) -> Any:
    with get_db() as conn:
        if not fetch_task_row(conn, task_id):
            return jsonify({"error": "Task not found"}), 404
        return jsonify({"logs": fetch_logs(conn, task_id)})


@app.patch("/api/projects/<int:project_id>")
def update_project(project_id: int) -> Any:
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Project name is required"}), 400

    with get_db() as conn:
        project = conn.execute(
            "SELECT id, name, created_at FROM projects WHERE id = ?",
            (project_id,),
        ).fetchone()
        if not project:
            return jsonify({"error": "Project not found"}), 404
        if project["name"] == DEFAULT_PROJECT_NAME:
            return jsonify({"error": "Default project cannot be renamed"}), 400

        duplicate = conn.execute(
            """
            SELECT id FROM projects
            WHERE LOWER(name) = LOWER(?) AND id != ?
            """,
            (name, project_id),
        ).fetchone()
        if duplicate:
            return jsonify({"error": "Project name already exists"}), 409

        conn.execute("UPDATE projects SET name = ? WHERE id = ?", (name, project_id))
        conn.commit()
        updated = conn.execute(
            "SELECT id, name, created_at FROM projects WHERE id = ?",
            (project_id,),
        ).fetchone()
        return jsonify(
            {
                "project": {
                    "id": int(updated["id"]),
                    "name": updated["name"],
                    "created_at": updated["created_at"],
                }
            }
        )


@app.post("/api/tasks")
def create_task() -> Any:
    payload = request.get_json(silent=True) or {}
    name = (payload.get("name") or "").strip()
    if not name:
        return jsonify({"error": "Task name is required"}), 400

    try:
        remind_after_days = parse_reminder_window(
            payload.get("remind_after_days", DEFAULT_REMIND_AFTER_DAYS)
        )
    except ValueError:
        return jsonify({"error": "Invalid reminder window"}), 400

    with get_db() as conn:
        ensure_seed_data(conn)
        project_id = get_or_create_project(conn, payload.get("project_name"))
        category_id = payload.get("category_id") or get_default_category_id(conn)
        category = conn.execute(
            "SELECT id FROM categories WHERE id = ?",
            (category_id,),
        ).fetchone()
        if not category:
            return jsonify({"error": "Category not found"}), 400

        try:
            cursor = conn.execute(
                """
                INSERT INTO tasks
                    (name, project_id, category_id, status, created_at, last_log_time, remind_after_days)
                VALUES (?, ?, ?, 'active', ?, NULL, ?)
                """,
                (name, project_id, int(category["id"]), now_iso(), remind_after_days),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            existing = conn.execute(
                task_select_sql(
                    """
                    WHERE LOWER(tasks.name) = LOWER(?)
                        AND tasks.project_id = ?
                    """
                ),
                (name, project_id),
            ).fetchone()
            if existing:
                return jsonify({"task": serialize_task(existing), "existing": True}), 200
            return jsonify({"error": "Task already exists in that project"}), 409

        created = fetch_task(conn, int(cursor.lastrowid))
        return jsonify({"task": created, "existing": False}), 201


@app.patch("/api/tasks/<int:task_id>")
def update_task(task_id: int) -> Any:
    payload = request.get_json(silent=True) or {}

    with get_db() as conn:
        ensure_seed_data(conn)
        existing = fetch_task(conn, task_id)
        if not existing:
            return jsonify({"error": "Task not found"}), 404

        status = payload.get("status", existing["status"])
        if status not in VALID_TASK_STATUSES:
            return jsonify({"error": "Invalid status"}), 400

        try:
            remind_after_days = parse_reminder_window(
                payload.get("remind_after_days", existing["remind_after_days"])
            )
        except ValueError:
            return jsonify({"error": "Invalid reminder window"}), 400

        name = (payload.get("name") or existing["name"]).strip()
        if not name:
            return jsonify({"error": "Task name is required"}), 400

        project_name = payload.get("project_name") or existing["project_name"]
        is_inbox = bool(existing["is_inbox"])
        if is_inbox and (
            name != existing["name"]
            or project_name != existing["project_name"]
            or status != existing["status"]
            or normalize_folder_path(payload.get("folder_path")) != existing["folder_path"]
        ):
            return jsonify({"error": "Inbox cannot be modified"}), 400

        project_id = get_or_create_project(conn, project_name)
        category_id = payload.get("category_id") or existing["category_id"]
        folder_path = normalize_folder_path(payload.get("folder_path", existing["folder_path"]))
        category = conn.execute(
            "SELECT id FROM categories WHERE id = ?",
            (category_id,),
        ).fetchone()
        if not category:
            category_id = get_default_category_id(conn)

        try:
            conn.execute(
                """
                UPDATE tasks
                SET name = ?,
                    project_id = ?,
                    category_id = ?,
                    status = ?,
                    remind_after_days = ?,
                    folder_path = ?
                WHERE id = ?
                """,
                (
                    name,
                    project_id,
                    int(category_id),
                    status,
                    remind_after_days,
                    folder_path,
                    task_id,
                ),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return jsonify({"error": "Task already exists in that project"}), 409

        return jsonify({"task": fetch_task(conn, task_id)})


@app.post("/api/tasks/<int:task_id>/open-folder")
def open_task_folder(task_id: int) -> Any:
    with get_db() as conn:
        task = fetch_task(conn, task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        if task["is_inbox"]:
            return jsonify({"error": "Quick record does not have a folder"}), 400

        folder_path = normalize_folder_path(task.get("folder_path"))
        if not folder_path:
            return jsonify({"error": "Folder path is not set"}), 400

        folder = Path(folder_path).expanduser()
        if not folder.exists() or not folder.is_dir():
            return jsonify({"error": "Folder does not exist"}), 400

        try:
            os.startfile(str(folder))  # type: ignore[attr-defined]
        except OSError as exc:
            return jsonify({"error": f"Failed to open folder: {exc}"}), 500

        return jsonify({"ok": True})


@app.post("/api/logs")
def create_log() -> Any:
    payload = request.get_json(silent=True) or {}
    task_id = payload.get("task_id")
    content = (payload.get("content") or "").strip()
    duration = payload.get("duration")
    log_time = payload.get("log_time")

    if not task_id:
        return jsonify({"error": "Task is required"}), 400
    if not content:
        return jsonify({"error": "Log content is required"}), 400

    dt = parse_iso(log_time) or datetime.now()
    duration_value = None
    if duration not in (None, "", 0):
        try:
            duration_value = int(duration)
        except (TypeError, ValueError):
            return jsonify({"error": "Duration must be an integer"}), 400
        if duration_value <= 0:
            return jsonify({"error": "Duration must be positive"}), 400

    with get_db() as conn:
        ensure_seed_data(conn)
        if not fetch_task_row(conn, int(task_id)):
            return jsonify({"error": "Task not found"}), 404

        created_at = now_iso()
        cursor = conn.execute(
            """
            INSERT INTO logs (task_id, content, log_time, duration, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                int(task_id),
                content,
                dt.replace(microsecond=0).isoformat(),
                duration_value,
                created_at,
            ),
        )
        # Reminder freshness tracks when the task was touched, not the backfilled log time.
        conn.execute(
            "UPDATE tasks SET last_log_time = ? WHERE id = ?",
            (created_at, int(task_id)),
        )
        conn.commit()

        row = conn.execute(
            """
            SELECT id, task_id, content, log_time, duration, created_at
            FROM logs
            WHERE id = ?
            """,
            (int(cursor.lastrowid),),
        ).fetchone()
        return jsonify({"log": serialize_log(row)}), 201


init_db()


if __name__ == "__main__":
    app.run(debug=False)
