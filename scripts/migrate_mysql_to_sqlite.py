#!/usr/bin/env python3
"""Copy data from MySQL into sqlite:///./career_compass.db."""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict

from dotenv import load_dotenv
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    MetaData,
    Numeric,
    String,
    Text,
    create_engine,
    select,
    text,
)
from sqlalchemy.engine import Engine


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate all tables from MySQL into SQLite."
    )
    parser.add_argument(
        "--source-url",
        default=os.getenv(
            "DATABASE_URL_DEV",
            "mysql+mysqlconnector://root:kali@localhost/career_compass",
        ),
        help="MySQL SQLAlchemy URL",
    )
    parser.add_argument(
        "--target-url",
        default="sqlite:///./career_compass.db",
        help="SQLite SQLAlchemy URL",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=1000,
        help="Rows per insert batch",
    )
    parser.add_argument(
        "--no-backup",
        action="store_true",
        help="Skip backup of existing SQLite DB file",
    )
    return parser.parse_args()


def sqlite_path_from_url(url: str) -> Path:
    prefix = "sqlite:///"
    if not url.startswith(prefix):
        raise ValueError(f"Target URL must be SQLite. Got: {url}")
    return Path(url[len(prefix) :]).resolve()


def make_backup(path: Path) -> Path | None:
    if not path.exists():
        return None
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = path.with_name(f"{path.stem}.backup_{stamp}{path.suffix}")
    shutil.copy2(path, backup_path)
    return backup_path


def import_backend_models() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    backend_path = repo_root / "backend"
    sys.path.insert(0, str(backend_path))
    import models  # noqa: F401  # pylint: disable=unused-import


def create_sqlite_schema(target_engine: Engine) -> None:
    from models.database import Base

    Base.metadata.create_all(bind=target_engine)


def reflect_metadata(engine: Engine) -> MetaData:
    metadata = MetaData()
    metadata.reflect(bind=engine)
    return metadata


def clear_target_tables(target_engine: Engine, target_meta: MetaData) -> None:
    with target_engine.begin() as conn:
        conn.execute(text("PRAGMA foreign_keys=OFF"))
        for table in reversed(target_meta.sorted_tables):
            conn.execute(table.delete())


def transfer_rows(
    source_engine: Engine,
    target_engine: Engine,
    source_meta: MetaData,
    target_meta: MetaData,
    batch_size: int,
) -> Dict[str, int]:
    counts: Dict[str, int] = {}

    with source_engine.connect() as source_conn, target_engine.begin() as target_conn:
        target_conn.execute(text("PRAGMA foreign_keys=OFF"))

        for source_table in source_meta.sorted_tables:
            table_name = source_table.name
            if table_name not in target_meta.tables:
                continue

            target_table = target_meta.tables[table_name]
            inserted = 0
            batch = []

            result = source_conn.execute(
                select(source_table).execution_options(stream_results=True)
            )
            for row in result.mappings():
                batch.append(sanitize_row(dict(row), target_table))
                if len(batch) >= batch_size:
                    target_conn.execute(target_table.insert(), batch)
                    inserted += len(batch)
                    batch.clear()

            if batch:
                target_conn.execute(target_table.insert(), batch)
                inserted += len(batch)

            counts[table_name] = inserted

    return counts


def sanitize_row(row: dict, target_table) -> dict:
    """Make source rows safe for SQLite constraints."""
    sanitized = {}
    columns = target_table.columns

    for column in columns:
        key = column.name
        if key not in row:
            continue

        value = row[key]
        if value is not None:
            sanitized[key] = value
            continue

        if column.nullable:
            sanitized[key] = None
            continue

        # Keep explicit PK values from source if present; if missing, let SQLite generate.
        if column.primary_key and column.autoincrement:
            continue

        if isinstance(column.type, DateTime):
            sanitized[key] = datetime.utcnow()
        elif isinstance(column.type, Boolean):
            sanitized[key] = False
        elif isinstance(column.type, Integer):
            sanitized[key] = 0
        elif isinstance(column.type, (Float, Numeric)):
            sanitized[key] = 0
        elif isinstance(column.type, (String, Text)):
            sanitized[key] = ""
        else:
            # Fallback: omit so SQLite can try column defaults.
            continue

    return sanitized


def main() -> int:
    load_dotenv()
    args = parse_args()

    source_url = args.source_url
    target_url = args.target_url

    if not source_url.startswith("mysql"):
        print(f"[ERROR] Source URL must be MySQL. Got: {source_url}")
        return 1
    if not target_url.startswith("sqlite"):
        print(f"[ERROR] Target URL must be SQLite. Got: {target_url}")
        return 1

    target_path = sqlite_path_from_url(target_url)
    target_path.parent.mkdir(parents=True, exist_ok=True)

    if not args.no_backup:
        backup = make_backup(target_path)
        if backup:
            print(f"[INFO] SQLite backup created: {backup}")
        else:
            print("[INFO] No existing SQLite file found. Skipping backup.")

    import_backend_models()

    source_engine = create_engine(source_url, pool_pre_ping=True)
    target_engine = create_engine(
        target_url, connect_args={"check_same_thread": False}
    )

    create_sqlite_schema(target_engine)
    source_meta = reflect_metadata(source_engine)
    target_meta = reflect_metadata(target_engine)

    clear_target_tables(target_engine, target_meta)
    counts = transfer_rows(
        source_engine=source_engine,
        target_engine=target_engine,
        source_meta=source_meta,
        target_meta=target_meta,
        batch_size=args.batch_size,
    )

    print("[OK] Migration complete.")
    total = 0
    for table_name, count in sorted(counts.items()):
        print(f"  - {table_name}: {count}")
        total += count
    print(f"[OK] Total rows inserted: {total}")
    print(f"[OK] SQLite DB: {target_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
