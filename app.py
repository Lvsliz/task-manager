from __future__ import annotations

import os
import json
import re
import sqlite3
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import quote

from flask import Flask, Response, jsonify, render_template, request


BASE_DIR = Path(__file__).resolve().parent
RESOURCE_DIR = Path(getattr(sys, "_MEIPASS", BASE_DIR))
DB_PATH = Path(os.environ.get("WORKLOG_DB_PATH", BASE_DIR / "worklog_v3.db"))
DATA_DIR = DB_PATH.parent if os.environ.get("WORKLOG_DB_PATH") else BASE_DIR / "data"
AI_SETTINGS_PATH = Path(os.environ.get("WORKLOG_AI_SETTINGS_PATH", DATA_DIR / "ai_settings.json"))
BOARD_SYNC_SETTINGS_PATH = Path(
    os.environ.get("WORKLOG_BOARD_SYNC_SETTINGS_PATH", DATA_DIR / "board_sync_settings.json")
)

app = Flask(
    __name__,
    template_folder=str(RESOURCE_DIR / "templates"),
    static_folder=str(RESOURCE_DIR / "static"),
)

CURRENT_SCHEMA_VERSION = 7
DEFAULT_PROJECT_NAME = "General"
INBOX_TASK_NAME = "Inbox"
DEFAULT_CATEGORY_NAME = "Misc"
DEFAULT_REMIND_AFTER_DAYS = 3
INBOX_REMIND_AFTER_DAYS = 30
DEFAULT_PROGRESS_PERCENT = 0
DEFAULT_PROGRESS_STEP = 25
DEFAULT_ESTIMATED_DAYS = 3.0
VALID_TASK_STATUSES = {"active", "completed"}
VALID_REMINDER_WINDOWS = {3, 7, 14, 30}
LOG_EDIT_WINDOW = timedelta(hours=1)
BOARD_SYNC_LOG_SCOPES = {"all", "recent_30"}
DEFAULT_AI_BASE_URL = "https://api.siliconflow.cn/v1"
DEFAULT_AI_MODEL = "deepseek-ai/DeepSeek-V3"
DEFAULT_TASK_ANALYSIS_PROMPT = """你是一个务实的工作日志分析助手。请基于任务信息和日志分析当前任务的进展。
要求：
- 使用中文。
- 只基于日志内容判断，不要编造事实。
- 输出 Markdown。
- 重点帮助用户快速恢复任务上下文、识别遗漏和确定下一步。
- 如果日志信息不足，请明确说明信息不足。

请按以下结构输出：
## 当前进展
## 已完成内容
## 可能遗漏
## 风险提醒
## 下一步建议"""
DEFAULT_WEEKLY_SUMMARY_PROMPT = """你是一个务实的工作阶段总结助手。请基于本周工作日志生成阶段总结。
要求：
- 使用中文。
- 只基于日志内容判断，不要编造事实。
- 输出 Markdown。
- 聚焦本周完成了什么、推进到哪里、有哪些风险和下周建议。

请按以下结构输出：
## 本周概览
## 主要进展
## 关键风险
## 可能遗漏
## 下周建议"""
DEFAULT_MONTHLY_SUMMARY_PROMPT = """你是一个务实的月度工作复盘助手。请基于本月工作日志生成月度总结。
要求：
- 使用中文。
- 只基于日志内容判断，不要编造事实。
- 输出 Markdown。
- 聚焦项目推进、任务结构、反复出现的问题和下月建议。

请按以下结构输出：
## 本月概览
## 主要成果
## 项目推进
## 风险与问题
## 下月建议"""
DEFAULT_HALF_MONTH_SUMMARY_PROMPT = """你是一个务实的半月工作复盘助手。请基于半月内的工作日志生成阶段总结。
要求：
- 使用中文。
- 只基于日志内容判断，不要编造事实。
- 输出 Markdown。
- 聚焦半月内的关键推进、阻塞、风险和后续建议。

请按以下结构输出：
## 半月概览
## 主要进展
## 阻塞与风险
## 可能遗漏
## 后续建议"""
DEFAULT_HALF_YEAR_SUMMARY_PROMPT = """你是一个务实的半年工作复盘助手。请基于半年内的工作日志生成阶段总结。
要求：
- 使用中文。
- 只基于日志内容判断，不要编造事实。
- 输出 Markdown。
- 聚焦半年内的主要成果、项目变化、长期风险、重复问题和下半年建议。

请按以下结构输出：
## 半年概览
## 主要成果
## 项目与任务推进
## 长期风险与反复问题
## 下半年建议"""
DEFAULT_YEAR_SUMMARY_PROMPT = """你是一个务实的年度工作复盘助手。请基于一年内的工作日志生成年度总结。
要求：
- 使用中文。
- 只基于日志内容判断，不要编造事实。
- 输出 Markdown。
- 聚焦年度成果、关键项目、能力/流程问题、长期风险和下一年度建议。

请按以下结构输出：
## 年度概览
## 关键成果
## 重要项目回顾
## 风险、问题与经验
## 下一年度建议"""
DEFAULT_RANGE_SUMMARY_PROMPT = """你是一个务实的工作日志阶段复盘助手。请基于所选时间范围内的日志生成总结。
要求：
- 使用中文。
- 只基于日志内容判断，不要编造事实。
- 输出 Markdown。
- 聚焦该阶段的主要工作、完成情况、风险、遗漏和后续建议。

请按以下结构输出：
## 阶段概览
## 主要进展
## 风险与遗漏
## 后续建议"""
PROMPT_DEFAULTS = {
    "task": DEFAULT_TASK_ANALYSIS_PROMPT,
    "week": DEFAULT_WEEKLY_SUMMARY_PROMPT,
    "month": DEFAULT_MONTHLY_SUMMARY_PROMPT,
    "half_month": DEFAULT_HALF_MONTH_SUMMARY_PROMPT,
    "half_year": DEFAULT_HALF_YEAR_SUMMARY_PROMPT,
    "year": DEFAULT_YEAR_SUMMARY_PROMPT,
    "range": DEFAULT_RANGE_SUMMARY_PROMPT,
}
PROMPT_SETTING_FIELDS = {
    "task": "task_analysis_prompt",
    "week": "weekly_summary_prompt",
    "month": "monthly_summary_prompt",
    "half_month": "half_month_summary_prompt",
    "half_year": "half_year_summary_prompt",
    "year": "year_summary_prompt",
    "range": "range_summary_prompt",
}
PROMPT_PRESET_FIELDS = {
    "task": "task_analysis_prompt_preset",
    "week": "weekly_summary_prompt_preset",
    "month": "monthly_summary_prompt_preset",
    "half_month": "half_month_summary_prompt_preset",
    "half_year": "half_year_summary_prompt_preset",
    "year": "year_summary_prompt_preset",
    "range": "range_summary_prompt_preset",
}
PROMPT_PRESET_LABELS = {
    "custom": "自定义",
    "pragmatic": "务实复盘",
    "brief": "简约总结",
    "manager": "管理汇报",
    "risk": "风险排查",
    "action": "行动计划",
    "four_f": "4F 复盘",
}

BOARD_SYNC_STATUS_LOCK = threading.Lock()
BOARD_SYNC_STATUS: dict[str, Any] = {
    "status": "idle",
    "started_at": None,
    "completed_at": None,
    "person_name": "",
    "output_dir": "",
    "task_count": 0,
    "log_count": 0,
    "duration_seconds": None,
    "error": "",
}
BOARD_SYNC_SCHEDULER_STARTED = False
BOARD_SYNC_SCHEDULER_LOCK = threading.Lock()


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
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    progress_step INTEGER NOT NULL DEFAULT 25 CHECK (progress_step >= 1 AND progress_step <= 100),
    estimated_days REAL NOT NULL DEFAULT 3 CHECK (estimated_days >= 0.5),
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
    is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
    pinned_at TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_last_log_time ON tasks(last_log_time);
CREATE INDEX IF NOT EXISTS idx_logs_task_time ON logs(task_id, log_time DESC, id DESC);

CREATE TABLE IF NOT EXISTS analysis_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scope_type TEXT NOT NULL,
    task_id INTEGER,
    title TEXT NOT NULL,
    result_markdown TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    error_message TEXT,
    prompt_preset TEXT,
    prompt_preset_label TEXT,
    prompt_snapshot TEXT,
    model TEXT NOT NULL,
    base_url TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_scope_created
ON analysis_runs(scope_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_task_created
ON analysis_runs(task_id, created_at DESC);
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


def format_datetime_zh(value: str | None) -> str:
    dt = parse_iso(value)
    if not dt:
        return "未记录"
    return f"{dt.year}年{dt.month}月{dt.day}日 {dt:%H:%M}"


def format_date_zh(value: str | None) -> str:
    dt = parse_iso(value)
    if not dt:
        return "未记录日期"
    return f"{dt.year}年{dt.month}月{dt.day}日"


def parse_export_datetime_zh(value: str | None) -> datetime | None:
    text = str(value or "").strip()
    if not text or text == "未记录":
        return None
    match = re.search(
        r"(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日(?:\s+(\d{1,2}):(\d{2}))?",
        text,
    )
    if not match:
        return None
    year, month, day, hour, minute = match.groups()
    try:
        return datetime(
            int(year),
            int(month),
            int(day),
            int(hour or 0),
            int(minute or 0),
        )
    except ValueError:
        return None


def safe_export_filename(name: str, suffix: str = ".md") -> str:
    cleaned = re.sub(r'[\\/:*?"<>|\r\n]+', "_", name).strip(" ._")
    if not cleaned:
        cleaned = "task"
    return f"{cleaned[:80]}{suffix}"


def markdown_escape_inline(value: Any) -> str:
    text = str(value or "")
    return text.replace("\n", " ").strip()


def normalize_prompt_preset(value: Any) -> str:
    preset = str(value or "custom").strip()
    return preset if preset in PROMPT_PRESET_LABELS else "custom"


def prompt_preset_display_label(preset: Any) -> str:
    return PROMPT_PRESET_LABELS[normalize_prompt_preset(preset)]


def prompt_metadata(settings: dict[str, Any], prompt_type: str) -> dict[str, str]:
    prompt_field = PROMPT_SETTING_FIELDS.get(prompt_type, "range_summary_prompt")
    preset_field = PROMPT_PRESET_FIELDS.get(prompt_type, "range_summary_prompt_preset")
    preset = normalize_prompt_preset(settings.get(preset_field))
    return {
        "prompt_preset": preset,
        "prompt_preset_label": prompt_preset_display_label(preset),
        "prompt_snapshot": str(settings.get(prompt_field) or "").strip(),
    }


def load_ai_settings(include_secret: bool = False) -> dict[str, Any]:
    defaults = {
        "provider": "openai_compatible",
        "base_url": DEFAULT_AI_BASE_URL,
        "model": DEFAULT_AI_MODEL,
        "api_key": "",
        "task_analysis_prompt": DEFAULT_TASK_ANALYSIS_PROMPT,
        "weekly_summary_prompt": DEFAULT_WEEKLY_SUMMARY_PROMPT,
        "monthly_summary_prompt": DEFAULT_MONTHLY_SUMMARY_PROMPT,
        "half_month_summary_prompt": DEFAULT_HALF_MONTH_SUMMARY_PROMPT,
        "half_year_summary_prompt": DEFAULT_HALF_YEAR_SUMMARY_PROMPT,
        "year_summary_prompt": DEFAULT_YEAR_SUMMARY_PROMPT,
        "range_summary_prompt": DEFAULT_RANGE_SUMMARY_PROMPT,
    }
    for preset_field in PROMPT_PRESET_FIELDS.values():
        defaults[preset_field] = "custom"
    if AI_SETTINGS_PATH.exists():
        try:
            stored = json.loads(AI_SETTINGS_PATH.read_text(encoding="utf-8"))
            if isinstance(stored, dict):
                defaults.update(
                    {
                        "provider": stored.get("provider") or defaults["provider"],
                        "base_url": stored.get("base_url") or defaults["base_url"],
                        "model": stored.get("model") or defaults["model"],
                        "api_key": stored.get("api_key") or "",
                        "task_analysis_prompt": stored.get("task_analysis_prompt")
                        or defaults["task_analysis_prompt"],
                        "weekly_summary_prompt": stored.get("weekly_summary_prompt")
                        or defaults["weekly_summary_prompt"],
                        "monthly_summary_prompt": stored.get("monthly_summary_prompt")
                        or defaults["monthly_summary_prompt"],
                        "half_month_summary_prompt": stored.get("half_month_summary_prompt")
                        or defaults["half_month_summary_prompt"],
                        "half_year_summary_prompt": stored.get("half_year_summary_prompt")
                        or defaults["half_year_summary_prompt"],
                        "year_summary_prompt": stored.get("year_summary_prompt")
                        or defaults["year_summary_prompt"],
                        "range_summary_prompt": stored.get("range_summary_prompt")
                        or defaults["range_summary_prompt"],
                    }
                )
                for preset_field in PROMPT_PRESET_FIELDS.values():
                    defaults[preset_field] = normalize_prompt_preset(
                        stored.get(preset_field) or defaults[preset_field]
                    )
        except (OSError, json.JSONDecodeError):
            pass

    api_key = defaults.get("api_key") or ""
    result = {
        "provider": defaults["provider"],
        "base_url": defaults["base_url"],
        "model": defaults["model"],
        "has_api_key": bool(api_key),
        "api_key_preview": f"...{api_key[-4:]}" if api_key else "",
        "task_analysis_prompt": defaults["task_analysis_prompt"],
        "weekly_summary_prompt": defaults["weekly_summary_prompt"],
        "monthly_summary_prompt": defaults["monthly_summary_prompt"],
        "half_month_summary_prompt": defaults["half_month_summary_prompt"],
        "half_year_summary_prompt": defaults["half_year_summary_prompt"],
        "year_summary_prompt": defaults["year_summary_prompt"],
        "range_summary_prompt": defaults["range_summary_prompt"],
    }
    for preset_field in PROMPT_PRESET_FIELDS.values():
        result[preset_field] = normalize_prompt_preset(defaults[preset_field])
    if include_secret:
        result["api_key"] = api_key
    return result


def save_ai_settings(settings: dict[str, Any]) -> None:
    AI_SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    AI_SETTINGS_PATH.write_text(
        json.dumps(settings, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def load_board_sync_settings() -> dict[str, Any]:
    defaults = {
        "person_name": os.environ.get("USERNAME") or "",
        "sync_dir": "",
        "log_scope": "all",
        "auto_sync_enabled": False,
        "auto_sync_time": "18:00",
        "last_auto_sync_date": "",
    }
    if BOARD_SYNC_SETTINGS_PATH.exists():
        try:
            stored = json.loads(BOARD_SYNC_SETTINGS_PATH.read_text(encoding="utf-8"))
            if isinstance(stored, dict):
                defaults.update(
                    {
                        "person_name": str(stored.get("person_name") or defaults["person_name"]),
                        "sync_dir": str(stored.get("sync_dir") or ""),
                        "log_scope": str(stored.get("log_scope") or defaults["log_scope"]),
                        "auto_sync_enabled": bool(stored.get("auto_sync_enabled")),
                        "auto_sync_time": str(
                            stored.get("auto_sync_time") or defaults["auto_sync_time"]
                        ),
                        "last_auto_sync_date": str(stored.get("last_auto_sync_date") or ""),
                    }
                )
        except (OSError, json.JSONDecodeError):
            pass
    if defaults["log_scope"] not in BOARD_SYNC_LOG_SCOPES:
        defaults["log_scope"] = "all"
    if not re.match(r"^\d{2}:\d{2}$", defaults["auto_sync_time"]):
        defaults["auto_sync_time"] = "18:00"
    return defaults


def save_board_sync_settings(settings: dict[str, Any]) -> None:
    BOARD_SYNC_SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    BOARD_SYNC_SETTINGS_PATH.write_text(
        json.dumps(settings, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def normalize_board_sync_time(value: Any) -> str:
    text = str(value or "").strip()
    if not re.match(r"^\d{2}:\d{2}$", text):
        raise ValueError("Invalid auto sync time")
    hour, minute = [int(part) for part in text.split(":", 1)]
    if hour > 23 or minute > 59:
        raise ValueError("Invalid auto sync time")
    return f"{hour:02d}:{minute:02d}"


def should_run_auto_board_sync(settings: dict[str, Any], now: datetime | None = None) -> bool:
    if not settings.get("auto_sync_enabled"):
        return False
    person_name = str(settings.get("person_name") or "").strip()
    sync_dir = str(settings.get("sync_dir") or "").strip()
    if not person_name or not sync_dir:
        return False

    now = now or datetime.now()
    try:
        hour, minute = [int(part) for part in str(settings.get("auto_sync_time")).split(":", 1)]
    except (TypeError, ValueError):
        return False
    scheduled = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    today_key = now.date().isoformat()
    return now >= scheduled and settings.get("last_auto_sync_date") != today_key


def mark_auto_board_sync_started(settings: dict[str, Any], now: datetime | None = None) -> dict[str, Any]:
    now = now or datetime.now()
    updated = dict(settings)
    updated["last_auto_sync_date"] = now.date().isoformat()
    save_board_sync_settings(updated)
    return updated


def board_sync_status_snapshot() -> dict[str, Any]:
    with BOARD_SYNC_STATUS_LOCK:
        return dict(BOARD_SYNC_STATUS)


def update_board_sync_status(**values: Any) -> dict[str, Any]:
    with BOARD_SYNC_STATUS_LOCK:
        BOARD_SYNC_STATUS.update(values)
        return dict(BOARD_SYNC_STATUS)


def safe_directory_name(name: str) -> str:
    cleaned = re.sub(r'[\\/:*?"<>|\r\n]+', "_", name).strip(" ._")
    return cleaned[:80] or "person"


def atomic_write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_name(f"{path.name}.tmp")
    tmp_path.write_text(content, encoding="utf-8")
    tmp_path.replace(path)


def atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    atomic_write_text(path, json.dumps(payload, ensure_ascii=False, indent=2))


def board_display_project_name(name: str | None) -> str:
    project_name = (name or DEFAULT_PROJECT_NAME).strip() or DEFAULT_PROJECT_NAME
    return "常用分组" if project_name == DEFAULT_PROJECT_NAME else project_name


def board_display_category_name(name: str | None) -> str:
    category_name = (name or DEFAULT_CATEGORY_NAME).strip() or DEFAULT_CATEGORY_NAME
    return "未分类" if category_name == DEFAULT_CATEGORY_NAME else category_name


def openai_compatible_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


def call_openai_compatible_chat(
    settings: dict[str, Any],
    messages: list[dict[str, str]],
    max_tokens: int = 900,
    require_content: bool = True,
    return_metadata: bool = False,
) -> str | dict[str, str | None]:
    api_key = settings.get("api_key") or ""
    if not api_key:
        raise ValueError("API Key is not configured")

    url = openai_compatible_url(settings["base_url"], "chat/completions")
    body = json.dumps(
        {
            "model": settings["model"],
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.2,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"HTTP {exc.code}: {detail}") from exc
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(str(exc)) from exc

    choice = (payload.get("choices") or [{}])[0] if isinstance(payload, dict) else {}
    content = ((choice.get("message") or {}).get("content")) if isinstance(choice, dict) else None
    finish_reason = choice.get("finish_reason") if isinstance(choice, dict) else None
    if not content and require_content:
        raise RuntimeError("AI response did not include content")
    if return_metadata:
        return {
            "content": str(content or "").strip(),
            "finish_reason": str(finish_reason or "") or None,
        }
    return str(content or "").strip()


def analyze_with_continuation(
    settings: dict[str, Any],
    messages: list[dict[str, str]],
    *,
    initial_max_tokens: int = 2600,
    continuation_max_tokens: int = 1400,
) -> tuple[str, bool]:
    response = call_openai_compatible_chat(
        settings,
        messages,
        max_tokens=initial_max_tokens,
        return_metadata=True,
    )
    result = str(response.get("content") or "")
    was_truncated = response.get("finish_reason") == "length"

    if was_truncated and result:
        continuation_messages = [
            *messages,
            {"role": "assistant", "content": result},
            {
                "role": "user",
                "content": "上面的任务分析回答被截断了。请从截断处继续完成剩余内容，不要重复已经输出过的内容。",
            },
        ]
        continuation = call_openai_compatible_chat(
            settings,
            continuation_messages,
            max_tokens=continuation_max_tokens,
            return_metadata=True,
        )
        continuation_content = str(continuation.get("content") or "").strip()
        if continuation_content:
            result = f"{result.rstrip()}\n\n{continuation_content}"
        was_truncated = continuation.get("finish_reason") == "length"

    return result.strip(), was_truncated


def init_db() -> None:
    with get_db() as conn:
        conn.executescript(SCHEMA)
        migrate_db(conn)
        recover_interrupted_analysis_runs(conn)
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
        version = 2

    if version < 3:
        columns = {
            row["name"] for row in conn.execute("PRAGMA table_info(logs)").fetchall()
        }
        if "is_pinned" not in columns:
            conn.execute(
                "ALTER TABLE logs ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0"
            )
        if "pinned_at" not in columns:
            conn.execute("ALTER TABLE logs ADD COLUMN pinned_at TEXT")
        conn.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_logs_task_pin_time
            ON logs(task_id, is_pinned DESC, pinned_at DESC, log_time DESC, id DESC)
            """
        )
        set_schema_version(conn, 3)
        version = 3

    if version < 4:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS analysis_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scope_type TEXT NOT NULL,
                task_id INTEGER,
                title TEXT NOT NULL,
                result_markdown TEXT NOT NULL,
                model TEXT NOT NULL,
                base_url TEXT NOT NULL,
                start_time TEXT,
                end_time TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
            );

            CREATE INDEX IF NOT EXISTS idx_analysis_runs_scope_created
            ON analysis_runs(scope_type, created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_analysis_runs_task_created
            ON analysis_runs(task_id, created_at DESC);
            """
        )
        set_schema_version(conn, 4)
        version = 4

    if version < 5:
        columns = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(analysis_runs)").fetchall()
        }
        if "status" not in columns:
            conn.execute(
                """
                ALTER TABLE analysis_runs
                ADD COLUMN status TEXT NOT NULL DEFAULT 'completed'
                CHECK (status IN ('pending', 'running', 'completed', 'failed'))
                """
            )
        if "error_message" not in columns:
            conn.execute("ALTER TABLE analysis_runs ADD COLUMN error_message TEXT")
        if "completed_at" not in columns:
            conn.execute("ALTER TABLE analysis_runs ADD COLUMN completed_at TEXT")
        conn.executescript(
            """
            CREATE INDEX IF NOT EXISTS idx_analysis_runs_status_created
            ON analysis_runs(status, created_at DESC);
            """
        )
        set_schema_version(conn, 5)
        version = 5

    if version < 6:
        columns = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(analysis_runs)").fetchall()
        }
        if "prompt_preset" not in columns:
            conn.execute("ALTER TABLE analysis_runs ADD COLUMN prompt_preset TEXT")
        if "prompt_preset_label" not in columns:
            conn.execute("ALTER TABLE analysis_runs ADD COLUMN prompt_preset_label TEXT")
        if "prompt_snapshot" not in columns:
            conn.execute("ALTER TABLE analysis_runs ADD COLUMN prompt_snapshot TEXT")
        set_schema_version(conn, 6)
        version = 6

    if version < 7:
        columns = {
            row["name"] for row in conn.execute("PRAGMA table_info(tasks)").fetchall()
        }
        if "progress_percent" not in columns:
            conn.execute(
                "ALTER TABLE tasks ADD COLUMN progress_percent INTEGER NOT NULL DEFAULT 0"
            )
        if "progress_step" not in columns:
            conn.execute(
                "ALTER TABLE tasks ADD COLUMN progress_step INTEGER NOT NULL DEFAULT 25"
            )
        if "estimated_days" not in columns:
            conn.execute(
                "ALTER TABLE tasks ADD COLUMN estimated_days REAL NOT NULL DEFAULT 3"
            )
        set_schema_version(conn, 7)
        version = 7

    normalize_task_progress_data(conn)


def normalize_task_progress_data(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        UPDATE tasks
        SET progress_percent = 100
        WHERE status = 'completed' AND progress_percent < 100
        """
    )


def recover_interrupted_analysis_runs(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        UPDATE analysis_runs
        SET status = 'failed',
            error_message = '应用重启后，之前未完成的分析任务已中断。请重新分析。',
            completed_at = COALESCE(completed_at, ?)
        WHERE status IN ('pending', 'running')
        """,
        (now_iso(),),
    )


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
            tasks.progress_percent,
            tasks.progress_step,
            tasks.estimated_days,
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
    progress_percent = parse_progress_percent(row["progress_percent"], DEFAULT_PROGRESS_PERCENT)
    progress_step = parse_progress_step(row["progress_step"], DEFAULT_PROGRESS_STEP)
    estimated_days = parse_estimated_days(row["estimated_days"], DEFAULT_ESTIMATED_DAYS)
    if status == "completed":
        progress_percent = 100
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
        "progress_percent": progress_percent,
        "progress_step": progress_step,
        "estimated_days": estimated_days,
        "remaining_days": remaining_days(estimated_days, progress_percent),
        "folder_path": row["folder_path"],
        "stale_level": stale_level,
        "stale_days": stale_days,
        "is_inbox": task_name == INBOX_TASK_NAME and project_name == DEFAULT_PROJECT_NAME,
    }


def serialize_log(row: sqlite3.Row) -> dict[str, Any]:
    log_time = row["log_time"] or now_iso()
    dt = parse_iso(log_time) or datetime.now()
    created_at = row["created_at"]
    created_dt = parse_iso(created_at)
    editable_until = created_dt + LOG_EDIT_WINDOW if created_dt else None
    can_edit = bool(editable_until and datetime.now() <= editable_until)
    return {
        "id": int(row["id"]),
        "task_id": int(row["task_id"]),
        "content": row["content"] or "",
        "log_time": log_time,
        "time_label": dt.strftime("%H:%M"),
        "date_label": label_for_date(dt),
        "duration": row["duration"],
        "created_at": created_at,
        "can_edit": can_edit,
        "editable_until": editable_until.replace(microsecond=0).isoformat()
        if editable_until
        else None,
        "is_pinned": bool(row["is_pinned"]) if "is_pinned" in row.keys() else False,
        "pinned_at": row["pinned_at"] if "pinned_at" in row.keys() else None,
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
        SELECT id, task_id, content, log_time, duration, created_at, is_pinned, pinned_at
        FROM logs
        WHERE task_id = ?
        ORDER BY is_pinned DESC, pinned_at DESC, log_time DESC, id DESC
        """,
        (task_id,),
    ).fetchall()
    return [serialize_log(row) for row in rows]


def fetch_logs_for_board_sync(
    conn: sqlite3.Connection,
    task_id: int,
    log_scope: str,
) -> list[dict[str, Any]]:
    params: list[Any] = [task_id]
    where = "WHERE task_id = ?"
    if log_scope == "recent_30":
        cutoff = (datetime.now() - timedelta(days=30)).replace(microsecond=0).isoformat()
        where += " AND log_time >= ?"
        params.append(cutoff)
    rows = conn.execute(
        f"""
        SELECT id, task_id, content, log_time, duration, created_at, is_pinned, pinned_at
        FROM logs
        {where}
        ORDER BY log_time ASC, id ASC
        """,
        params,
    ).fetchall()
    logs = []
    for row in rows:
        logs.append(
            {
                "id": int(row["id"]),
                "task_id": int(row["task_id"]),
                "content": row["content"] or "",
                "log_time": row["log_time"],
                "duration": row["duration"],
                "created_at": row["created_at"],
                "is_pinned": bool(row["is_pinned"]),
                "pinned_at": row["pinned_at"],
            }
        )
    return logs


def build_board_sync_snapshot(settings: dict[str, Any]) -> dict[str, Any]:
    person_name = str(settings.get("person_name") or "").strip()
    log_scope = str(settings.get("log_scope") or "all")
    if log_scope not in BOARD_SYNC_LOG_SCOPES:
        log_scope = "all"

    with get_db() as conn:
        ensure_seed_data(conn)
        conn.commit()
        projects = fetch_projects(conn)
        categories = fetch_categories(conn)
        tasks = [task for task in fetch_tasks(conn) if not task["is_inbox"]]
        logs_by_task: dict[int, list[dict[str, Any]]] = {}
        log_count = 0
        for task in tasks:
            task_logs = fetch_logs_for_board_sync(conn, int(task["id"]), log_scope)
            logs_by_task[int(task["id"])] = task_logs
            log_count += len(task_logs)

    project_items = []
    for project in projects:
        project_tasks = []
        for task in tasks:
            if task["project_id"] != project["id"]:
                continue
            project_tasks.append(
                {
                    "id": task["id"],
                    "name": task["name"],
                    "status": task["status"],
                    "category_name": board_display_category_name(task["category_name"]),
                    "category_color": task["category_color"],
                    "created_at": task["created_at"],
                    "last_log_time": task["last_log_time"],
                    "remind_after_days": task["remind_after_days"],
                    "progress_percent": task["progress_percent"],
                    "progress_step": task["progress_step"],
                    "estimated_days": task["estimated_days"],
                    "remaining_days": task["remaining_days"],
                    "folder_path": task["folder_path"],
                    "is_inbox": task["is_inbox"],
                    "logs": logs_by_task.get(int(task["id"]), []),
                }
            )
        if not project_tasks:
            continue
        project_items.append(
            {
                "id": project["id"],
                "name": board_display_project_name(project["name"]),
                "created_at": project["created_at"],
                "tasks": project_tasks,
            }
        )

    return {
        "schema": "personal_worklog_snapshot_v1",
        "app": "Personal Task-Based Work Log",
        "app_version": read_version(),
        "exported_at": now_iso(),
        "person": {
            "name": person_name,
            "folder_name": safe_directory_name(person_name),
        },
        "export_options": {
            "log_scope": log_scope,
        },
        "counts": {
            "project_count": len(project_items),
            "task_count": len(tasks),
            "log_count": log_count,
        },
        "categories": [
            {
                **category,
                "name": board_display_category_name(category["name"]),
            }
            for category in categories
        ],
        "projects": project_items,
    }


def board_sync_snapshot_markdown(snapshot: dict[str, Any]) -> str:
    person = snapshot.get("person") or {}
    counts = snapshot.get("counts") or {}
    lines = [
        "# 工作日志原始快照",
        "",
        f"- 人员：{markdown_escape_inline(person.get('name'))}",
        f"- 导出时间：{format_datetime_zh(snapshot.get('exported_at'))}",
        f"- 工具版本：{markdown_escape_inline(snapshot.get('app_version'))}",
        f"- 项目数：{counts.get('project_count', 0)}",
        f"- 任务数：{counts.get('task_count', 0)}",
        f"- 日志数：{counts.get('log_count', 0)}",
        "",
        "说明：本文件为看板端 AI 分析准备的原始任务快照，个人端不在此处生成 AI 总结。",
        "",
    ]
    for project in snapshot.get("projects") or []:
        lines.extend([f"## 项目：{project.get('name') or DEFAULT_PROJECT_NAME}", ""])
        tasks = project.get("tasks") or []
        if not tasks:
            lines.extend(["暂无任务。", ""])
            continue
        for task in tasks:
            lines.extend(
                [
                    f"### 任务：{task.get('name')}",
                    "",
                    f"- 状态：{'已完成' if task.get('status') == 'completed' else '进行中'}",
                    f"- 分类：{markdown_escape_inline(task.get('category_name'))}",
                    f"- 创建时间：{format_datetime_zh(task.get('created_at'))}",
                    f"- 最后记录：{format_datetime_zh(task.get('last_log_time'))}",
                    f"- 提醒周期：{task.get('remind_after_days')} 天",
                    f"- 当前进度：{task.get('progress_percent')}%",
                    f"- 进度步进：{task.get('progress_step')}%",
                    f"- 预计耗时：{task.get('estimated_days')} 天",
                    f"- 剩余耗时：{task.get('remaining_days')} 天",
                    "",
                    "#### 日志",
                    "",
                ]
            )
            logs = task.get("logs") or []
            if not logs:
                lines.extend(["暂无日志。", ""])
                continue
            for log in logs:
                pinned = "；置顶" if log.get("is_pinned") else ""
                duration = f"；耗时 {log.get('duration')}h" if log.get("duration") else ""
                lines.extend(
                    [
                        f"- {format_datetime_zh(log.get('log_time'))}{duration}{pinned}",
                        "",
                        str(log.get("content") or "").strip(),
                        "",
                    ]
                )
    return "\n".join(lines)


def read_version() -> str:
    try:
        return (BASE_DIR / "VERSION").read_text(encoding="utf-8").strip()
    except OSError:
        return "dev"


def task_export_markdown(task: dict[str, Any], logs: list[dict[str, Any]]) -> str:
    display_name = "快速记录" if task["is_inbox"] else task["name"]
    status_text = "已完成" if task["status"] == "completed" else "进行中"
    pinned_logs = [log for log in logs if log.get("is_pinned")]
    lines = [
        f"# 任务：{display_name}",
        "",
        f"- 项目：{markdown_escape_inline(task['project_name'])}",
        f"- 状态：{status_text}",
        f"- 提醒周期：{task['remind_after_days']} 天",
        f"- 创建时间：{format_datetime_zh(task['created_at'])}",
        f"- 最后记录：{format_datetime_zh(task['last_log_time'])}",
        f"- 是否置顶：{'是' if pinned_logs else '否'}",
    ]
    if task.get("folder_path"):
        lines.append(f"- 相关文件夹路径：{markdown_escape_inline(task['folder_path'])}")
    lines.append("")

    if pinned_logs:
        pinned = pinned_logs[0]
        lines.extend(
            [
                "## 置顶日志",
                "",
                f"**{format_datetime_zh(pinned['log_time'])}**",
                "",
                pinned["content"].strip(),
                "",
            ]
        )

    lines.extend(["## 日志记录", ""])
    if not logs:
        lines.extend(["暂无日志", ""])
        return "\n".join(lines)

    normal_order_logs = sorted(
        logs,
        key=lambda log: (
            parse_iso(log.get("log_time")) or datetime.min,
            int(log.get("id") or 0),
        ),
        reverse=True,
    )
    current_date = None
    for log in normal_order_logs:
        date_label = format_date_zh(log.get("log_time"))
        if date_label != current_date:
            current_date = date_label
            lines.extend([f"### {date_label}", ""])

        lines.extend(
            [
                f"**{log.get('time_label') or '--:--'}**",
                "",
                log["content"].strip(),
                "",
            ]
        )

    return "\n".join(lines)


def analysis_export_markdown(analysis: dict[str, Any]) -> str:
    status_map = {
        "pending": "等待中",
        "running": "分析中",
        "completed": "已完成",
        "failed": "失败",
    }
    lines = [
        f"# 分析日志：{analysis.get('title') or '任务分析'}",
        "",
        f"- 类型：{analysis.get('scope_type') or 'task'}",
        f"- 状态：{status_map.get(analysis.get('status'), analysis.get('status') or '')}",
        f"- 创建时间：{format_datetime_zh(analysis.get('created_at'))}",
        f"- 完成时间：{format_datetime_zh(analysis.get('completed_at'))}",
    ]
    if analysis.get("task_name"):
        lines.append(f"- 任务：{markdown_escape_inline(analysis.get('task_name'))}")
    if analysis.get("project_name"):
        lines.append(f"- 项目：{markdown_escape_inline(analysis.get('project_name'))}")
    if analysis.get("prompt_preset_label"):
        lines.append(f"- 风格预设：{markdown_escape_inline(analysis.get('prompt_preset_label'))}")
    lines.extend(["", "## 分析结果", ""])
    if analysis.get("status") == "failed":
        lines.append(analysis.get("error_message") or "分析失败。")
    else:
        lines.append((analysis.get("result_markdown") or "暂无分析结果。").strip())
    lines.append("")
    return "\n".join(lines)


def analysis_runs_export_markdown(analyses: list[dict[str, Any]]) -> str:
    lines = [
        "# 分析日志导出",
        "",
        f"- 导出时间：{format_datetime_zh(now_iso())}",
        f"- 导出数量：{len(analyses)}",
        "",
    ]
    for index, analysis in enumerate(analyses, 1):
        if index > 1:
            lines.extend(["---", ""])
        lines.append(analysis_export_markdown(analysis).strip())
        lines.append("")
    return "\n".join(lines)


def parse_task_import_markdown(content: str) -> dict[str, Any]:
    text = str(content or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    if not text:
        raise ValueError("导入文件为空")
    if len(text) > 1_000_000:
        raise ValueError("导入文件过大")

    title_match = re.search(r"^#\s*任务[：:]\s*(.+?)\s*$", text, re.MULTILINE)
    if not title_match:
        raise ValueError("没有找到任务标题")
    task_name = title_match.group(1).strip()
    if not task_name or task_name == "快速记录":
        raise ValueError("不能导入默认快速记录任务")

    metadata: dict[str, str] = {}
    for match in re.finditer(r"^-\s*([^：:\n]+)[：:]\s*(.*?)\s*$", text, re.MULTILINE):
        metadata[match.group(1).strip()] = match.group(2).strip()

    project_name = metadata.get("项目") or DEFAULT_PROJECT_NAME
    status_text = metadata.get("状态") or "进行中"
    status = "completed" if "完成" in status_text else "active"
    reminder_match = re.search(r"\d+", metadata.get("提醒周期", ""))
    remind_after_days = parse_reminder_window(
        int(reminder_match.group(0)) if reminder_match else DEFAULT_REMIND_AFTER_DAYS
    )
    created_at = parse_export_datetime_zh(metadata.get("创建时间")) or datetime.now()
    folder_path = metadata.get("相关文件夹路径") or ""

    pinned_time: datetime | None = None
    pinned_content = ""
    pinned_section = re.search(
        r"##\s*置顶日志\s*\n+(.*?)(?=\n##\s*日志记录|\Z)",
        text,
        re.DOTALL,
    )
    if pinned_section:
        pinned_body = pinned_section.group(1).strip()
        pinned_time_match = re.search(r"\*\*(.+?)\*\*", pinned_body)
        if pinned_time_match:
            pinned_time = parse_export_datetime_zh(pinned_time_match.group(1))
            pinned_content = re.sub(r"\*\*.+?\*\*", "", pinned_body, count=1).strip()

    logs: list[dict[str, Any]] = []
    logs_section = re.search(r"##\s*日志记录\s*\n+(.*)\Z", text, re.DOTALL)
    if logs_section:
        current_date: datetime | None = None
        current_time: str | None = None
        content_lines: list[str] = []

        def flush_log() -> None:
            nonlocal current_time, content_lines
            body = "\n".join(content_lines).strip()
            if current_date and current_time and body and body != "暂无日志":
                hour, minute = [int(part) for part in current_time.split(":", 1)]
                log_dt = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                logs.append({"content": body, "log_time": log_dt, "is_pinned": False})
            current_time = None
            content_lines = []

        for raw_line in logs_section.group(1).split("\n"):
            line = raw_line.rstrip()
            date_match = re.match(r"^###\s*(.+?)\s*$", line)
            time_match = re.match(r"^\*\*(\d{1,2}:\d{2})\*\*\s*$", line)
            if date_match:
                flush_log()
                current_date = parse_export_datetime_zh(date_match.group(1))
                continue
            if time_match:
                flush_log()
                current_time = time_match.group(1)
                continue
            if current_time:
                content_lines.append(line)
        flush_log()

    if pinned_time and pinned_content:
        for log in logs:
            same_time = abs((log["log_time"] - pinned_time).total_seconds()) < 60
            same_content = log["content"].strip() == pinned_content.strip()
            if same_time and same_content:
                log["is_pinned"] = True
                break

    return {
        "name": task_name,
        "project_name": project_name,
        "status": status,
        "remind_after_days": remind_after_days,
        "created_at": created_at.replace(microsecond=0).isoformat(),
        "folder_path": folder_path,
        "logs": logs,
    }


def unique_import_task_name(conn: sqlite3.Connection, project_id: int, base_name: str) -> str:
    base = base_name.strip() or "导入任务"
    existing = {
        (row["name"] or "").lower()
        for row in conn.execute(
            "SELECT name FROM tasks WHERE project_id = ?",
            (project_id,),
        ).fetchall()
    }
    if base.lower() not in existing:
        return base
    candidate = f"{base}（导入）"
    if candidate.lower() not in existing:
        return candidate
    for index in range(2, 1000):
        candidate = f"{base}（导入）{index}"
        if candidate.lower() not in existing:
            return candidate
    raise ValueError("无法生成不重复的任务名称")


def build_task_analysis_prompt(
    task: dict[str, Any],
    logs: list[dict[str, Any]],
    analysis_prompt: str | None = None,
) -> str:
    exported = task_export_markdown(task, logs)
    if len(exported) > 24000:
        exported = exported[:24000] + "\n\n[内容过长，后续日志已截断]"
    instructions = (analysis_prompt or DEFAULT_TASK_ANALYSIS_PROMPT).strip()
    return f"""
{instructions}

任务数据：

{exported}
""".strip()


def fetch_logs_for_period(
    conn: sqlite3.Connection,
    start_dt: datetime,
    end_dt: datetime,
) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
            logs.id,
            logs.task_id,
            logs.content,
            logs.log_time,
            logs.duration,
            logs.created_at,
            tasks.name AS task_name,
            tasks.status AS task_status,
            tasks.created_at AS task_created_at,
            tasks.last_log_time AS task_last_log_time,
            tasks.remind_after_days AS task_remind_after_days,
            projects.name AS project_name
        FROM logs
        JOIN tasks ON tasks.id = logs.task_id
        JOIN projects ON projects.id = tasks.project_id
        WHERE logs.log_time >= ? AND logs.log_time <= ?
        ORDER BY logs.log_time ASC, logs.id ASC
        """,
        (start_dt.isoformat(), end_dt.isoformat()),
    ).fetchall()
    return [
        {
            "id": int(row["id"]),
            "task_id": int(row["task_id"]),
            "task_name": row["task_name"] or "Untitled Task",
            "task_status": row["task_status"] or "active",
            "task_created_at": row["task_created_at"],
            "task_last_log_time": row["task_last_log_time"],
            "task_remind_after_days": row["task_remind_after_days"],
            "project_name": row["project_name"] or DEFAULT_PROJECT_NAME,
            "content": row["content"] or "",
            "log_time": row["log_time"],
            "duration": row["duration"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


def period_logs_markdown(
    logs: list[dict[str, Any]],
    start_dt: datetime,
    end_dt: datetime,
) -> str:
    grouped: dict[int, dict[str, Any]] = {}
    for log in logs:
        task_id = int(log["task_id"])
        if task_id not in grouped:
            grouped[task_id] = {
                "task_id": task_id,
                "task_name": log["task_name"],
                "task_status": log["task_status"],
                "task_created_at": log.get("task_created_at"),
                "task_last_log_time": log.get("task_last_log_time"),
                "task_remind_after_days": log.get("task_remind_after_days"),
                "project_name": log["project_name"],
                "logs": [],
            }
        grouped[task_id]["logs"].append(log)

    tasks = sorted(
        grouped.values(),
        key=lambda item: max(
            parse_iso(log["log_time"]) or start_dt for log in item["logs"]
        ),
        reverse=True,
    )
    lines = [
        f"# 阶段日志：{format_date_zh(start_dt.isoformat())} 至 {format_date_zh(end_dt.isoformat())}",
        "",
        f"- 时间范围：{format_date_zh(start_dt.isoformat())} 至 {format_date_zh(end_dt.isoformat())}",
        f"- 范围内涉及任务数：{len(tasks)}",
        f"- 范围内日志数：{len(logs)}",
        "",
        "说明：本数据包只包含所选时间范围内发生过日志更新的任务；每个任务只附带范围内日志，不包含范围外历史日志。",
        "",
    ]

    for task in tasks:
        task_logs = task["logs"]
        first_log_dt = parse_iso(task_logs[0]["log_time"])
        last_log_dt = parse_iso(task_logs[-1]["log_time"])
        task_name = "快速记录" if task["task_name"] == INBOX_TASK_NAME else task["task_name"]
        project_name = display_project_name_for_export(task["project_name"])
        status_text = "已完成" if task["task_status"] == "completed" else "进行中"

        lines.extend(
            [
                f"## {project_name} / {task_name}",
                "",
                f"- 当前状态：{status_text}",
                f"- 任务创建时间：{format_datetime_zh(task.get('task_created_at'))}",
                f"- 任务最后记录时间：{format_datetime_zh(task.get('task_last_log_time'))}",
                f"- 范围内日志数：{len(task_logs)}",
                f"- 范围内第一条日志：{format_datetime_zh(first_log_dt.isoformat() if first_log_dt else None)}",
                f"- 范围内最后一条日志：{format_datetime_zh(last_log_dt.isoformat() if last_log_dt else None)}",
                "",
                "### 范围内日志",
                "",
            ]
        )

        for log in task_logs:
            dt = parse_iso(log["log_time"])
            time_label = dt.strftime("%Y-%m-%d %H:%M") if dt else "--:--"
            content = log["content"].strip()
            if content:
                lines.extend([f"- **{time_label}**：{content}", ""])

    return "\n".join(lines)


def display_project_name_for_export(name: str | None) -> str:
    return "常用分组" if name == DEFAULT_PROJECT_NAME else (name or DEFAULT_PROJECT_NAME)


def build_period_analysis_prompt(
    logs: list[dict[str, Any]],
    start_dt: datetime,
    end_dt: datetime,
    summary_prompt: str | None,
) -> str:
    exported = period_logs_markdown(logs, start_dt, end_dt)
    if len(exported) > 30000:
        exported = exported[:30000] + "\n\n[内容过长，后续日志已截断]"
    instructions = (summary_prompt or DEFAULT_RANGE_SUMMARY_PROMPT).strip()
    return f"""
{instructions}

阶段分析边界：
- 只总结所选时间范围内的日志内容。
- 不要把范围外历史日志、任务创建时间或任务全生命周期当作本阶段成果。
- 一个任务只要在范围内有日志，就应纳入分析；如果范围内没有日志，则不应被提及。
- 对持续进行中的长期任务，只分析它在本阶段的推进、阻塞和下一步，不要重述整个任务历史。

阶段日志数据：

{exported}
""".strip()


def save_analysis_run(
    conn: sqlite3.Connection,
    *,
    scope_type: str,
    task_id: int | None,
    title: str,
    result_markdown: str,
    model: str,
    base_url: str,
    status: str = "completed",
    error_message: str | None = None,
    start_time: str | None = None,
    end_time: str | None = None,
    prompt_preset: str | None = None,
    prompt_preset_label: str | None = None,
    prompt_snapshot: str | None = None,
) -> dict[str, Any]:
    created_at = now_iso()
    normalized_preset = normalize_prompt_preset(prompt_preset)
    cursor = conn.execute(
        """
        INSERT INTO analysis_runs
            (scope_type, task_id, title, result_markdown, status, error_message, prompt_preset, prompt_preset_label, prompt_snapshot, model, base_url, start_time, end_time, completed_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            scope_type,
            task_id,
            title,
            result_markdown,
            status,
            error_message,
            normalized_preset,
            prompt_preset_label or prompt_preset_display_label(normalized_preset),
            prompt_snapshot or "",
            model,
            base_url,
            start_time,
            end_time,
            now_iso() if status in {"completed", "failed"} else None,
            created_at,
        ),
    )
    return fetch_analysis_run(conn, int(cursor.lastrowid)) or {
        "id": int(cursor.lastrowid),
        "scope_type": scope_type,
        "task_id": task_id,
        "title": title,
        "result_markdown": result_markdown,
        "status": status,
        "error_message": error_message,
        "prompt_preset": normalized_preset,
        "prompt_preset_label": prompt_preset_label or prompt_preset_display_label(normalized_preset),
        "prompt_snapshot": prompt_snapshot or "",
        "model": model,
        "base_url": base_url,
        "start_time": start_time,
        "end_time": end_time,
        "completed_at": None,
        "created_at": created_at,
    }


def serialize_analysis_run(row: sqlite3.Row) -> dict[str, Any]:
    raw_prompt_preset = row["prompt_preset"]
    raw_prompt_preset_label = row["prompt_preset_label"]
    return {
        "id": int(row["id"]),
        "scope_type": row["scope_type"],
        "task_id": int(row["task_id"]) if row["task_id"] is not None else None,
        "title": row["title"] or "任务分析",
        "result_markdown": row["result_markdown"] or "",
        "status": row["status"] or "completed",
        "error_message": row["error_message"],
        "prompt_preset": normalize_prompt_preset(raw_prompt_preset)
        if raw_prompt_preset
        else "",
        "prompt_preset_label": raw_prompt_preset_label
        or (prompt_preset_display_label(raw_prompt_preset) if raw_prompt_preset else ""),
        "prompt_snapshot": row["prompt_snapshot"] or "",
        "model": row["model"] or "",
        "base_url": row["base_url"] or "",
        "start_time": row["start_time"],
        "end_time": row["end_time"],
        "completed_at": row["completed_at"],
        "created_at": row["created_at"],
    }


def fetch_analysis_run(conn: sqlite3.Connection, analysis_id: int) -> dict[str, Any] | None:
    row = conn.execute(
        "SELECT * FROM analysis_runs WHERE id = ?",
        (analysis_id,),
    ).fetchone()
    return serialize_analysis_run(row) if row else None


def fetch_latest_task_analysis(
    conn: sqlite3.Connection,
    task_id: int,
    statuses: tuple[str, ...] | None = None,
) -> dict[str, Any] | None:
    params: list[Any] = ["task", task_id]
    status_sql = ""
    if statuses:
        status_sql = f" AND status IN ({','.join('?' for _ in statuses)})"
        params.extend(statuses)
    row = conn.execute(
        f"""
        SELECT *
        FROM analysis_runs
        WHERE scope_type = ? AND task_id = ?{status_sql}
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """,
        params,
    ).fetchone()
    return serialize_analysis_run(row) if row else None


def fetch_recent_analysis_runs(
    conn: sqlite3.Connection,
    limit: int = 30,
) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
            analysis_runs.*,
            tasks.name AS task_name,
            tasks.project_id AS project_id,
            projects.name AS project_name
        FROM analysis_runs
        LEFT JOIN tasks ON tasks.id = analysis_runs.task_id
        LEFT JOIN projects ON projects.id = tasks.project_id
        ORDER BY analysis_runs.created_at DESC, analysis_runs.id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    result = []
    for row in rows:
        item = serialize_analysis_run(row)
        item["task_name"] = row["task_name"] or item["title"] or "任务分析"
        item["project_id"] = int(row["project_id"]) if row["project_id"] is not None else None
        item["project_name"] = row["project_name"] or ""
        result.append(item)
    return result


def fetch_analysis_runs_for_export(
    conn: sqlite3.Connection,
    ids: list[int] | None = None,
) -> list[dict[str, Any]]:
    where = ""
    params: list[Any] = []
    if ids:
        placeholders = ",".join("?" for _ in ids)
        where = f"WHERE analysis_runs.id IN ({placeholders})"
        params.extend(ids)
    rows = conn.execute(
        f"""
        SELECT
            analysis_runs.*,
            tasks.name AS task_name,
            tasks.project_id AS project_id,
            projects.name AS project_name
        FROM analysis_runs
        LEFT JOIN tasks ON tasks.id = analysis_runs.task_id
        LEFT JOIN projects ON projects.id = tasks.project_id
        {where}
        ORDER BY analysis_runs.created_at DESC, analysis_runs.id DESC
        """,
        params,
    ).fetchall()
    result = []
    for row in rows:
        item = serialize_analysis_run(row)
        item["task_name"] = row["task_name"] or item["title"] or "任务分析"
        item["project_id"] = int(row["project_id"]) if row["project_id"] is not None else None
        item["project_name"] = row["project_name"] or ""
        result.append(item)
    return result


def mark_analysis_running(conn: sqlite3.Connection, analysis_id: int) -> None:
    now = now_iso()
    conn.execute(
        """
        UPDATE analysis_runs
        SET status = 'running',
            start_time = COALESCE(start_time, ?),
            error_message = NULL
        WHERE id = ?
        """,
        (now, analysis_id),
    )


def complete_analysis_run(
    conn: sqlite3.Connection,
    analysis_id: int,
    *,
    result_markdown: str,
    failed: bool = False,
    error_message: str | None = None,
) -> None:
    now = now_iso()
    conn.execute(
        """
        UPDATE analysis_runs
        SET status = ?,
            result_markdown = ?,
            error_message = ?,
            end_time = COALESCE(end_time, ?),
            completed_at = ?
        WHERE id = ?
        """,
        (
            "failed" if failed else "completed",
            result_markdown,
            error_message,
            now,
            now,
            analysis_id,
        ),
    )


def parse_reminder_window(value: Any, default: int = DEFAULT_REMIND_AFTER_DAYS) -> int:
    parsed = parse_positive_int(value, default)
    if parsed not in VALID_REMINDER_WINDOWS:
        raise ValueError("Invalid reminder window")
    return parsed


def parse_progress_percent(value: Any, default: int = DEFAULT_PROGRESS_PERCENT) -> int:
    if value in (None, ""):
        return default
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValueError("Invalid progress percent")
    if parsed < 0 or parsed > 100:
        raise ValueError("Invalid progress percent")
    return parsed


def parse_progress_step(value: Any, default: int = DEFAULT_PROGRESS_STEP) -> int:
    if value in (None, ""):
        return default
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        raise ValueError("Invalid progress step")
    if parsed < 1 or parsed > 100:
        raise ValueError("Invalid progress step")
    return parsed


def parse_estimated_days(value: Any, default: float = DEFAULT_ESTIMATED_DAYS) -> float:
    if value in (None, ""):
        return default
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        raise ValueError("Invalid estimated days")
    if parsed < 0.5:
        raise ValueError("Invalid estimated days")
    # Normalize to 0.5 day increments.
    return round(parsed * 2) / 2


def remaining_days(estimated_days: float, progress_percent: int) -> float:
    return round(max(estimated_days * (1 - progress_percent / 100), 0), 2)


def normalize_folder_path(value: Any) -> str | None:
    if value in (None, ""):
        return None
    path = str(value).strip().strip('"')
    return path or None


def task_analysis_title(task: dict[str, Any]) -> str:
    display_name = "快速记录" if task["is_inbox"] else task["name"]
    return f"{display_name} - 当前任务分析"


def parse_date_boundary(value: Any, *, end_of_day: bool = False) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value))
    except ValueError:
        try:
            dt = datetime.strptime(str(value), "%Y-%m-%d")
        except ValueError:
            return None
    if len(str(value)) <= 10:
        if end_of_day:
            return dt.replace(hour=23, minute=59, second=59, microsecond=0)
        return dt.replace(hour=0, minute=0, second=0, microsecond=0)
    return dt.replace(microsecond=0)


def period_analysis_title(range_type: str, start_dt: datetime, end_dt: datetime) -> str:
    labels = {
        "week": "周报",
        "half_month": "半月总结",
        "month": "月报",
        "half_year": "半年总结",
        "year": "年度总结",
        "range": "阶段总结",
    }
    return (
        f"{labels.get(range_type, '自定义总结')}："
        f"{format_date_zh(start_dt.isoformat())} - {format_date_zh(end_dt.isoformat())}"
    )


def run_task_analysis_background(analysis_id: int, task_id: int) -> None:
    try:
        settings = load_ai_settings(include_secret=True)
        with get_db() as conn:
            mark_analysis_running(conn, analysis_id)
            analysis = fetch_analysis_run(conn, analysis_id)
            task = fetch_task(conn, task_id)
            logs = fetch_logs(conn, task_id) if task else []
            conn.commit()

        if not task:
            raise RuntimeError("Task not found")
        if not logs:
            raise RuntimeError("当前任务还没有日志，无法分析")

        prompt = build_task_analysis_prompt(
            task,
            logs,
            (analysis or {}).get("prompt_snapshot") or settings.get("task_analysis_prompt"),
        )
        result, was_truncated = analyze_with_continuation(
            settings,
            [
                {
                    "role": "system",
                    "content": "你是一个帮助用户复盘个人工作日志的中文助手。",
                },
                {"role": "user", "content": prompt},
            ],
        )

        if was_truncated:
            result = f"{result.rstrip()}\n\n> 注：AI 返回内容仍然触发了长度截断。建议减少本次日志范围，或稍后改用更长上下文/更高输出上限的模型。"

        with get_db() as conn:
            complete_analysis_run(conn, analysis_id, result_markdown=result)
            conn.commit()
    except Exception as exc:  # Background jobs need to persist failures for the UI.
        with get_db() as conn:
            complete_analysis_run(
                conn,
                analysis_id,
                result_markdown="",
                failed=True,
                error_message=str(exc),
            )
            conn.commit()


def start_task_analysis_thread(analysis_id: int, task_id: int) -> None:
    thread = threading.Thread(
        target=run_task_analysis_background,
        args=(analysis_id, task_id),
        daemon=True,
    )
    thread.start()


def run_period_analysis_background(
    analysis_id: int,
    range_type: str,
    start_iso: str,
    end_iso: str,
) -> None:
    try:
        settings = load_ai_settings(include_secret=True)
        start_dt = parse_iso(start_iso)
        end_dt = parse_iso(end_iso)
        if not start_dt or not end_dt:
            raise RuntimeError("Invalid summary date range")

        with get_db() as conn:
            mark_analysis_running(conn, analysis_id)
            analysis = fetch_analysis_run(conn, analysis_id)
            logs = fetch_logs_for_period(conn, start_dt, end_dt)
            conn.commit()

        if not logs:
            raise RuntimeError("所选时间范围内还没有日志，无法总结")

        prompt_field = PROMPT_SETTING_FIELDS.get(range_type, "range_summary_prompt")
        prompt = build_period_analysis_prompt(
            logs,
            start_dt,
            end_dt,
            (analysis or {}).get("prompt_snapshot") or settings.get(prompt_field),
        )
        result, was_truncated = analyze_with_continuation(
            settings,
            [
                {
                    "role": "system",
                    "content": "你是一个帮助用户复盘工作日志和生成阶段总结的中文助手。",
                },
                {"role": "user", "content": prompt},
            ],
            initial_max_tokens=3000,
            continuation_max_tokens=1600,
        )

        if was_truncated:
            result = f"{result.rstrip()}\n\n> 注：AI 返回内容仍然触发了长度截断。建议缩短时间范围，或使用更高输出上限的模型。"

        with get_db() as conn:
            complete_analysis_run(conn, analysis_id, result_markdown=result)
            conn.commit()
    except Exception as exc:
        with get_db() as conn:
            complete_analysis_run(
                conn,
                analysis_id,
                result_markdown="",
                failed=True,
                error_message=str(exc),
            )
            conn.commit()


def start_period_analysis_thread(
    analysis_id: int,
    range_type: str,
    start_iso: str,
    end_iso: str,
) -> None:
    thread = threading.Thread(
        target=run_period_analysis_background,
        args=(analysis_id, range_type, start_iso, end_iso),
        daemon=True,
    )
    thread.start()


def run_board_sync_export_background(settings: dict[str, Any]) -> None:
    started = datetime.now()
    person_name = str(settings.get("person_name") or "").strip()
    sync_dir = str(settings.get("sync_dir") or "").strip()
    output_dir = ""
    try:
        if not person_name:
            raise RuntimeError("请先设置人员名称")
        if not sync_dir:
            raise RuntimeError("请先设置看板同步目录")

        root = Path(sync_dir).expanduser()
        root.mkdir(parents=True, exist_ok=True)
        output_path = root / safe_directory_name(person_name)
        output_path.mkdir(parents=True, exist_ok=True)
        output_dir = str(output_path)

        update_board_sync_status(output_dir=output_dir)
        snapshot = build_board_sync_snapshot(settings)
        markdown = board_sync_snapshot_markdown(snapshot)

        status_payload = {
            "person": person_name,
            "status": "success",
            "started_at": started.replace(microsecond=0).isoformat(),
            "completed_at": now_iso(),
            "output_dir": output_dir,
            "task_count": snapshot["counts"]["task_count"],
            "log_count": snapshot["counts"]["log_count"],
            "error": "",
        }

        atomic_write_json(output_path / "worklog.json", snapshot)
        atomic_write_text(output_path / "worklog.md", markdown)
        atomic_write_json(output_path / "sync_status.json", status_payload)

        completed = datetime.now()
        update_board_sync_status(
            status="success",
            completed_at=completed.replace(microsecond=0).isoformat(),
            output_dir=output_dir,
            task_count=snapshot["counts"]["task_count"],
            log_count=snapshot["counts"]["log_count"],
            duration_seconds=round((completed - started).total_seconds(), 2),
            error="",
        )
    except Exception as exc:
        completed = datetime.now()
        update_board_sync_status(
            status="failed",
            completed_at=completed.replace(microsecond=0).isoformat(),
            output_dir=output_dir,
            duration_seconds=round((completed - started).total_seconds(), 2),
            error=str(exc),
        )


def start_board_sync_export_thread(settings: dict[str, Any]) -> dict[str, Any]:
    current = board_sync_status_snapshot()
    if current.get("status") == "running":
        return current

    started_at = now_iso()
    status = update_board_sync_status(
        status="running",
        started_at=started_at,
        completed_at=None,
        person_name=str(settings.get("person_name") or "").strip(),
        output_dir="",
        task_count=0,
        log_count=0,
        duration_seconds=None,
        error="",
    )
    thread = threading.Thread(
        target=run_board_sync_export_background,
        args=(dict(settings),),
        daemon=True,
    )
    thread.start()
    return status


def board_sync_scheduler_loop() -> None:
    while True:
        try:
            settings = load_board_sync_settings()
            if should_run_auto_board_sync(settings):
                updated = mark_auto_board_sync_started(settings)
                start_board_sync_export_thread(updated)
        except Exception as exc:
            update_board_sync_status(
                status="failed",
                completed_at=now_iso(),
                error=f"自动同步检查失败：{exc}",
            )
        time.sleep(60)


def start_board_sync_scheduler() -> None:
    global BOARD_SYNC_SCHEDULER_STARTED
    with BOARD_SYNC_SCHEDULER_LOCK:
        if BOARD_SYNC_SCHEDULER_STARTED:
            return
        BOARD_SYNC_SCHEDULER_STARTED = True
    thread = threading.Thread(target=board_sync_scheduler_loop, daemon=True)
    thread.start()


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


@app.get("/api/settings/ai")
def get_ai_settings() -> Any:
    return jsonify(load_ai_settings(include_secret=False))


@app.get("/api/settings/board-sync")
def get_board_sync_settings() -> Any:
    return jsonify(load_board_sync_settings())


@app.patch("/api/settings/board-sync")
def update_board_sync_settings() -> Any:
    payload = request.get_json(silent=True) or {}
    current = load_board_sync_settings()
    person_name = str(payload.get("person_name") or "").strip()
    sync_dir = str(payload.get("sync_dir") or "").strip().strip('"')
    log_scope = str(payload.get("log_scope") or "all").strip()
    if log_scope not in BOARD_SYNC_LOG_SCOPES:
        return jsonify({"error": "Invalid log scope"}), 400
    try:
        auto_sync_time = normalize_board_sync_time(
            payload.get("auto_sync_time") or current.get("auto_sync_time") or "18:00"
        )
    except ValueError:
        return jsonify({"error": "Invalid auto sync time"}), 400

    settings = {
        "person_name": person_name,
        "sync_dir": sync_dir,
        "log_scope": log_scope,
        "auto_sync_enabled": bool(payload.get("auto_sync_enabled")),
        "auto_sync_time": auto_sync_time,
        "last_auto_sync_date": current.get("last_auto_sync_date") or "",
    }
    save_board_sync_settings(settings)
    return jsonify(settings)


@app.get("/api/board-sync/status")
def get_board_sync_status() -> Any:
    return jsonify(board_sync_status_snapshot())


@app.post("/api/board-sync/export")
def export_board_sync_snapshot() -> Any:
    settings = load_board_sync_settings()
    status = start_board_sync_export_thread(settings)
    return jsonify(status)


@app.patch("/api/settings/ai")
def update_ai_settings() -> Any:
    payload = request.get_json(silent=True) or {}
    current = load_ai_settings(include_secret=True)
    base_url = (payload.get("base_url") or current["base_url"]).strip()
    model = (payload.get("model") or current["model"]).strip()
    task_analysis_prompt = (
        payload.get("task_analysis_prompt")
        if payload.get("task_analysis_prompt") is not None
        else current["task_analysis_prompt"]
    )
    task_analysis_prompt = str(task_analysis_prompt).strip() or DEFAULT_TASK_ANALYSIS_PROMPT
    weekly_summary_prompt = (
        payload.get("weekly_summary_prompt")
        if payload.get("weekly_summary_prompt") is not None
        else current["weekly_summary_prompt"]
    )
    weekly_summary_prompt = str(weekly_summary_prompt).strip() or DEFAULT_WEEKLY_SUMMARY_PROMPT
    monthly_summary_prompt = (
        payload.get("monthly_summary_prompt")
        if payload.get("monthly_summary_prompt") is not None
        else current["monthly_summary_prompt"]
    )
    monthly_summary_prompt = str(monthly_summary_prompt).strip() or DEFAULT_MONTHLY_SUMMARY_PROMPT
    half_month_summary_prompt = (
        payload.get("half_month_summary_prompt")
        if payload.get("half_month_summary_prompt") is not None
        else current["half_month_summary_prompt"]
    )
    half_month_summary_prompt = (
        str(half_month_summary_prompt).strip() or DEFAULT_HALF_MONTH_SUMMARY_PROMPT
    )
    half_year_summary_prompt = (
        payload.get("half_year_summary_prompt")
        if payload.get("half_year_summary_prompt") is not None
        else current["half_year_summary_prompt"]
    )
    half_year_summary_prompt = (
        str(half_year_summary_prompt).strip() or DEFAULT_HALF_YEAR_SUMMARY_PROMPT
    )
    year_summary_prompt = (
        payload.get("year_summary_prompt")
        if payload.get("year_summary_prompt") is not None
        else current["year_summary_prompt"]
    )
    year_summary_prompt = str(year_summary_prompt).strip() or DEFAULT_YEAR_SUMMARY_PROMPT
    range_summary_prompt = (
        payload.get("range_summary_prompt")
        if payload.get("range_summary_prompt") is not None
        else current["range_summary_prompt"]
    )
    range_summary_prompt = str(range_summary_prompt).strip() or DEFAULT_RANGE_SUMMARY_PROMPT

    if not base_url:
        return jsonify({"error": "Base URL is required"}), 400
    if not model:
        return jsonify({"error": "Model is required"}), 400

    api_key = current.get("api_key") or ""
    if payload.get("clear_api_key"):
        api_key = ""
    elif payload.get("api_key"):
        api_key = str(payload.get("api_key")).strip()

    settings_to_save = {
        "provider": "openai_compatible",
        "base_url": base_url,
        "model": model,
        "api_key": api_key,
        "task_analysis_prompt": task_analysis_prompt,
        "weekly_summary_prompt": weekly_summary_prompt,
        "monthly_summary_prompt": monthly_summary_prompt,
        "half_month_summary_prompt": half_month_summary_prompt,
        "half_year_summary_prompt": half_year_summary_prompt,
        "year_summary_prompt": year_summary_prompt,
        "range_summary_prompt": range_summary_prompt,
    }
    for prompt_type, preset_field in PROMPT_PRESET_FIELDS.items():
        if preset_field in payload:
            preset = payload.get(preset_field)
        elif payload.get("prompt_type") == prompt_type and "prompt_preset" in payload:
            preset = payload.get("prompt_preset")
        else:
            preset = current.get(preset_field)
        settings_to_save[preset_field] = normalize_prompt_preset(preset)

    save_ai_settings(settings_to_save)
    return jsonify(load_ai_settings(include_secret=False))


@app.post("/api/settings/ai/prompts/<prompt_type>/reset")
def reset_analysis_prompt(prompt_type: str) -> Any:
    if prompt_type not in PROMPT_SETTING_FIELDS:
        return jsonify({"error": "Invalid prompt type"}), 400
    current = load_ai_settings(include_secret=True)
    field = PROMPT_SETTING_FIELDS[prompt_type]
    current[field] = PROMPT_DEFAULTS[prompt_type]
    settings_to_save = {
        "provider": current["provider"],
        "base_url": current["base_url"],
        "model": current["model"],
        "api_key": current.get("api_key") or "",
        "task_analysis_prompt": current["task_analysis_prompt"],
        "weekly_summary_prompt": current["weekly_summary_prompt"],
        "monthly_summary_prompt": current["monthly_summary_prompt"],
        "half_month_summary_prompt": current["half_month_summary_prompt"],
        "half_year_summary_prompt": current["half_year_summary_prompt"],
        "year_summary_prompt": current["year_summary_prompt"],
        "range_summary_prompt": current["range_summary_prompt"],
    }
    for item_type, preset_field in PROMPT_PRESET_FIELDS.items():
        settings_to_save[preset_field] = (
            "custom"
            if item_type == prompt_type
            else normalize_prompt_preset(current.get(preset_field))
        )
    save_ai_settings(settings_to_save)
    return jsonify(load_ai_settings(include_secret=False))


@app.post("/api/settings/ai/task-analysis-prompt/reset")
def reset_task_analysis_prompt() -> Any:
    return reset_analysis_prompt("task")


@app.post("/api/settings/ai/test")
def test_ai_settings() -> Any:
    settings = load_ai_settings(include_secret=True)
    api_key = settings.get("api_key") or ""
    if not api_key:
        return jsonify({"ok": False, "error": "API Key is not configured"}), 400

    try:
        content = call_openai_compatible_chat(
            settings,
            [{"role": "user", "content": "Reply with OK."}],
            max_tokens=8,
            require_content=False,
        )
    except (ValueError, RuntimeError) as exc:
        return jsonify({"ok": False, "error": str(exc)}), 400

    return jsonify({"ok": True, "message": (content or "连接成功，接口可用").strip()})


@app.post("/api/analysis/tasks/<int:task_id>")
def analyze_task(task_id: int) -> Any:
    settings = load_ai_settings(include_secret=True)
    if not settings.get("api_key"):
        return jsonify({"error": "请先在设置中配置 AI API Key"}), 400

    with get_db() as conn:
        task = fetch_task(conn, task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        logs = fetch_logs(conn, task_id)
        if not logs:
            return jsonify({"error": "当前任务还没有日志，无法分析"}), 400
        running = fetch_latest_task_analysis(conn, task_id, ("pending", "running"))
        if running:
            return jsonify({"analysis": running})
        analysis = save_analysis_run(
            conn,
            scope_type="task",
            task_id=task_id,
            title=task_analysis_title(task),
            result_markdown="",
            status="pending",
            model=settings["model"],
            base_url=settings["base_url"],
            **prompt_metadata(settings, "task"),
        )
        conn.commit()

    start_task_analysis_thread(analysis["id"], task_id)
    return jsonify({"analysis": analysis})


@app.get("/api/analysis/tasks/<int:task_id>/latest")
def latest_task_analysis(task_id: int) -> Any:
    with get_db() as conn:
        if not fetch_task(conn, task_id):
            return jsonify({"error": "Task not found"}), 404
        analysis = fetch_latest_task_analysis(conn, task_id)
    return jsonify({"analysis": analysis})


@app.post("/api/analysis/periods")
def analyze_period() -> Any:
    settings = load_ai_settings(include_secret=True)
    if not settings.get("api_key"):
        return jsonify({"error": "请先在设置中配置 AI API Key"}), 400

    payload = request.get_json(silent=True) or {}
    range_type = str(payload.get("range_type") or "range").strip()
    if range_type not in {"week", "half_month", "month", "half_year", "year", "range"}:
        return jsonify({"error": "Invalid summary type"}), 400

    start_dt = parse_date_boundary(payload.get("start_date"), end_of_day=False)
    end_dt = parse_date_boundary(payload.get("end_date"), end_of_day=True)
    if not start_dt or not end_dt or end_dt < start_dt:
        return jsonify({"error": "请选择有效的总结时间范围"}), 400

    title = period_analysis_title(range_type, start_dt, end_dt)
    scope_type = f"period_{range_type}"
    with get_db() as conn:
        logs = fetch_logs_for_period(conn, start_dt, end_dt)
        if not logs:
            return jsonify({"error": "所选时间范围内还没有日志，无法总结"}), 400
        existing = conn.execute(
            """
            SELECT *
            FROM analysis_runs
            WHERE scope_type = ? AND title = ? AND status IN ('pending', 'running')
            ORDER BY created_at DESC, id DESC
            LIMIT 1
            """,
            (scope_type, title),
        ).fetchone()
        if existing:
            return jsonify({"analysis": serialize_analysis_run(existing)})
        analysis = save_analysis_run(
            conn,
            scope_type=scope_type,
            task_id=None,
            title=title,
            result_markdown="",
            status="pending",
            model=settings["model"],
            base_url=settings["base_url"],
            **prompt_metadata(settings, range_type),
        )
        conn.commit()

    start_period_analysis_thread(
        analysis["id"],
        range_type,
        start_dt.isoformat(),
        end_dt.isoformat(),
    )
    return jsonify({"analysis": analysis})


@app.get("/api/analysis/runs/<int:analysis_id>")
def get_analysis_run(analysis_id: int) -> Any:
    with get_db() as conn:
        analysis = fetch_analysis_run(conn, analysis_id)
    if not analysis:
        return jsonify({"error": "Analysis not found"}), 404
    return jsonify({"analysis": analysis})


@app.get("/api/analysis/runs")
def list_analysis_runs() -> Any:
    limit = parse_positive_int(request.args.get("limit"), 30) or 30
    limit = min(max(limit, 1), 100)
    with get_db() as conn:
        runs = fetch_recent_analysis_runs(conn, limit)
    return jsonify({"analyses": runs})


@app.get("/api/analysis/runs/<int:analysis_id>/export.md")
def export_analysis_run(analysis_id: int) -> Response:
    with get_db() as conn:
        runs = fetch_analysis_runs_for_export(conn, [analysis_id])
    if not runs:
        return jsonify({"error": "Analysis not found"}), 404

    markdown = analysis_export_markdown(runs[0])
    filename = safe_export_filename(runs[0].get("title") or "analysis")
    response = Response(markdown, content_type="text/markdown; charset=utf-8")
    response.headers["Content-Disposition"] = (
        f"attachment; filename*=UTF-8''{quote(filename)}"
    )
    return response


@app.post("/api/analysis/runs/export.md")
def export_analysis_runs() -> Response:
    payload = request.get_json(silent=True) or {}
    ids = payload.get("ids")
    export_all = bool(payload.get("all"))
    parsed_ids: list[int] = []
    if isinstance(ids, list):
        for value in ids:
            parsed = parse_positive_int(value)
            if parsed and parsed not in parsed_ids:
                parsed_ids.append(parsed)

    if not export_all and not parsed_ids:
        return jsonify({"error": "请选择要导出的分析日志"}), 400

    with get_db() as conn:
        runs = fetch_analysis_runs_for_export(conn, None if export_all else parsed_ids)
    if not runs:
        return jsonify({"error": "没有可导出的分析日志"}), 404

    markdown = analysis_runs_export_markdown(runs)
    filename = safe_export_filename(
        "analysis-runs" if export_all else f"analysis-runs-{len(runs)}"
    )
    response = Response(markdown, content_type="text/markdown; charset=utf-8")
    response.headers["Content-Disposition"] = (
        f"attachment; filename*=UTF-8''{quote(filename)}"
    )
    return response


@app.get("/api/tasks/<int:task_id>/logs")
def task_logs(task_id: int) -> Any:
    with get_db() as conn:
        if not fetch_task_row(conn, task_id):
            return jsonify({"error": "Task not found"}), 404
        return jsonify({"logs": fetch_logs(conn, task_id)})


@app.get("/api/tasks/<int:task_id>/export.md")
def export_task_markdown(task_id: int) -> Response:
    with get_db() as conn:
        task = fetch_task(conn, task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        logs = fetch_logs(conn, task_id)

    markdown = task_export_markdown(task, logs)
    filename_name = "快速记录" if task["is_inbox"] else task["name"]
    filename = safe_export_filename(filename_name)
    response = Response(markdown, content_type="text/markdown; charset=utf-8")
    response.headers["Content-Disposition"] = (
        f"attachment; filename*=UTF-8''{quote(filename)}"
    )
    return response


@app.post("/api/tasks/import")
def import_task_markdown() -> Any:
    upload = request.files.get("file")
    if not upload:
        return jsonify({"error": "请选择要导入的任务文件"}), 400
    filename = upload.filename or ""
    if filename and not filename.lower().endswith(".md"):
        return jsonify({"error": "目前只支持导入 Markdown 任务文件"}), 400

    raw = upload.read()
    try:
        text = raw.decode("utf-8-sig")
        imported = parse_task_import_markdown(text)
    except UnicodeDecodeError:
        return jsonify({"error": "文件编码不是 UTF-8，无法导入"}), 400
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    with get_db() as conn:
        ensure_seed_data(conn)
        project_id = get_or_create_project(conn, imported["project_name"])
        category_id = get_default_category_id(conn)
        task_name = unique_import_task_name(conn, project_id, imported["name"])
        logs = imported["logs"]
        last_log_time = (
            max((log["log_time"] for log in logs), default=None).isoformat()
            if logs
            else None
        )

        cursor = conn.execute(
            """
            INSERT INTO tasks
                (name, project_id, category_id, status, created_at, last_log_time, remind_after_days, folder_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                task_name,
                project_id,
                category_id,
                imported["status"],
                imported["created_at"],
                last_log_time,
                imported["remind_after_days"],
                imported["folder_path"] or None,
            ),
        )
        task_id = int(cursor.lastrowid)
        for log in logs:
            log_time = log["log_time"].replace(microsecond=0).isoformat()
            conn.execute(
                """
                INSERT INTO logs
                    (task_id, content, log_time, duration, created_at, is_pinned, pinned_at)
                VALUES (?, ?, ?, NULL, ?, ?, ?)
                """,
                (
                    task_id,
                    log["content"],
                    log_time,
                    log_time,
                    1 if log.get("is_pinned") else 0,
                    log_time if log.get("is_pinned") else None,
                ),
            )
        conn.commit()
        task = fetch_task(conn, task_id)

    return jsonify({"task": task, "imported_log_count": len(logs)}), 201


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
        progress_percent = parse_progress_percent(
            payload.get("progress_percent", DEFAULT_PROGRESS_PERCENT)
        )
        progress_step = parse_progress_step(
            payload.get("progress_step", DEFAULT_PROGRESS_STEP)
        )
        estimated_days = parse_estimated_days(
            payload.get("estimated_days", DEFAULT_ESTIMATED_DAYS)
        )
    except ValueError:
        return jsonify({"error": "Invalid task progress settings"}), 400

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
                    (name, project_id, category_id, status, created_at, last_log_time,
                     remind_after_days, progress_percent, progress_step, estimated_days)
                VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)
                """,
                (
                    name,
                    project_id,
                    int(category["id"]),
                    "completed" if progress_percent >= 100 else "active",
                    now_iso(),
                    remind_after_days,
                    progress_percent,
                    progress_step,
                    estimated_days,
                ),
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
            progress_percent = parse_progress_percent(
                payload.get("progress_percent", existing["progress_percent"])
            )
            progress_step = parse_progress_step(
                payload.get("progress_step", existing["progress_step"])
            )
            estimated_days = parse_estimated_days(
                payload.get("estimated_days", existing["estimated_days"])
            )
        except ValueError:
            return jsonify({"error": "Invalid task progress settings"}), 400

        if status == "completed":
            progress_percent = 100
        elif progress_percent >= 100:
            status = "completed"
        elif "progress_percent" in payload:
            status = "active"

        name = (payload.get("name") or existing["name"]).strip()
        if not name:
            return jsonify({"error": "Task name is required"}), 400

        project_name = payload.get("project_name") or existing["project_name"]
        is_inbox = bool(existing["is_inbox"])
        if is_inbox and (
            name != existing["name"]
            or project_name != existing["project_name"]
            or status != existing["status"]
            or progress_percent != existing["progress_percent"]
            or progress_step != existing["progress_step"]
            or estimated_days != existing["estimated_days"]
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
                    progress_percent = ?,
                    progress_step = ?,
                    estimated_days = ?,
                    folder_path = ?
                WHERE id = ?
                """,
                (
                    name,
                    project_id,
                    int(category_id),
                    status,
                    remind_after_days,
                    progress_percent,
                    progress_step,
                    estimated_days,
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
            SELECT id, task_id, content, log_time, duration, created_at, is_pinned, pinned_at
            FROM logs
            WHERE id = ?
            """,
            (int(cursor.lastrowid),),
        ).fetchone()
        return jsonify({"log": serialize_log(row)}), 201


@app.patch("/api/logs/<int:log_id>")
def update_log(log_id: int) -> Any:
    payload = request.get_json(silent=True) or {}
    can_update_content = "content" in payload
    can_update_pin = "is_pinned" in payload
    if not can_update_content and not can_update_pin:
        return jsonify({"error": "Nothing to update"}), 400

    content = (payload.get("content") or "").strip() if can_update_content else None
    if can_update_content and not content:
        return jsonify({"error": "Log content is required"}), 400
    should_pin = bool(payload.get("is_pinned")) if can_update_pin else None

    with get_db() as conn:
        row = conn.execute(
            """
            SELECT id, task_id, content, log_time, duration, created_at, is_pinned, pinned_at
            FROM logs
            WHERE id = ?
            """,
            (log_id,),
        ).fetchone()
        if not row:
            return jsonify({"error": "Log not found"}), 404

        task_id = int(row["task_id"])
        if can_update_content:
            created_dt = parse_iso(row["created_at"])
            if not created_dt or datetime.now() > created_dt + LOG_EDIT_WINDOW:
                return jsonify({"error": "日志创建超过 1 小时，已锁定不可修改"}), 403
            conn.execute("UPDATE logs SET content = ? WHERE id = ?", (content, log_id))

        if can_update_pin and should_pin:
            pinned_at = now_iso()
            # Only one pinned log is allowed inside a task in this version.
            conn.execute(
                "UPDATE logs SET is_pinned = 0, pinned_at = NULL WHERE task_id = ?",
                (task_id,),
            )
            conn.execute(
                "UPDATE logs SET is_pinned = 1, pinned_at = ? WHERE id = ?",
                (pinned_at, log_id),
            )
        elif can_update_pin:
            conn.execute(
                "UPDATE logs SET is_pinned = 0, pinned_at = NULL WHERE id = ?",
                (log_id,),
            )
        conn.commit()

        updated = conn.execute(
            """
            SELECT id, task_id, content, log_time, duration, created_at, is_pinned, pinned_at
            FROM logs
            WHERE id = ?
            """,
            (log_id,),
        ).fetchone()
        return jsonify({"log": serialize_log(updated)})


init_db()
start_board_sync_scheduler()


if __name__ == "__main__":
    app.run(debug=False)
