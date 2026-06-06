<img width="2700" height="1485" alt="image" src="https://github.com/user-attachments/assets/90e1c3c4-8506-4eab-9c25-8f5afdb5a997" />

# Personal Task-Based Work Log

A lightweight personal task-driven work log system.

## Stack

- Backend: Python + Flask
- Database: SQLite
- Frontend: single-page HTML + vanilla JavaScript
- Styling: CSS

## Run Locally

```powershell
python run_app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Portable Build

Build a Windows portable folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build_portable.ps1
```

Output:

```text
dist/PersonalWorkLog/Worklog.exe
```

The portable build stores runtime data in:

```text
dist/PersonalWorkLog/data/worklog_v3.db
```

## Notes

Runtime databases, backups, release archives, and build artifacts are intentionally ignored by git.
