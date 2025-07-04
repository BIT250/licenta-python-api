import sqlite3
from flask import g, current_app

DB_PATH = "app.db"  # or read from current_app.config if you like

def get_db():
    """
    Opens a SQLite connection (cached in Flask’s `g`) and
    returns it. Row results behave like dicts.
    """
    if "db" not in g:
        g.db = sqlite3.connect(
            DB_PATH,
            detect_types=sqlite3.PARSE_DECLTYPES,
            check_same_thread=False
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    """
    Closes the DB at the end of the request, if it exists.
    """
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    """
    On a fresh install, runs schema.sql to create tables.
    """
    db = sqlite3.connect(DB_PATH)
    with current_app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf8"))
    db.commit()
    db.close()

def migrate():
    """
    (Optional) place here any in-place PRAGMA migrations,
    e.g. bumping user_version and doing ALTER TABLE adds.
    """
    db = sqlite3.connect(DB_PATH)
    cur = db.cursor()
    old_v = cur.execute("PRAGMA user_version").fetchone()[0]
    # example: if you later add columns in version 2:
    if old_v < 2:
        cur.execute("ALTER TABLE user ADD COLUMN last_login TEXT")
        cur.execute("PRAGMA user_version = 2")
    db.commit()
    db.close()
