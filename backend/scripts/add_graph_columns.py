"""One-time manual script: add the graph columns `tags` and `connections` to
the `posts` table.

Posts are nodes in the Plexive graph: `tags` holds taxonomy slugs and
`connections` holds cross-post links ({format, ref, featured}). They are stored as
JSONB columns parallel to feed_card/sections. create_all only adds missing TABLES,
never missing COLUMNS (see the note in app/models.py), so the live Supabase
database needs these columns added by hand. Run manually from backend/ -- never
imported or called by the app:

    venv\\Scripts\\python.exe scripts\\add_graph_columns.py

Idempotent: ADD COLUMN IF NOT EXISTS with a default of '[]', so it is safe to
re-run and existing rows get empty arrays.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

from sqlalchemy import create_engine, text  # noqa: E402

ADD_COLUMNS = [
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb",
    "ALTER TABLE posts ADD COLUMN IF NOT EXISTS connections JSONB NOT NULL DEFAULT '[]'::jsonb",
]


def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL is not set (expected in backend/.env)")
    engine = create_engine(url)
    with engine.begin() as conn:
        for stmt in ADD_COLUMNS:
            print(stmt)
            conn.execute(text(stmt))
    print("done")


if __name__ == "__main__":
    main()
