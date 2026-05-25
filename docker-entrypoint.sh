#!/bin/sh
set -e

PGDATA=/var/lib/postgresql/data
PGPASS="${POSTGRES_PASSWORD:-fateshifter_secret}"

# Initialise postgres cluster on first run
if [ ! -f "$PGDATA/PG_VERSION" ]; then
  su-exec postgres initdb -D "$PGDATA" --encoding=UTF8 --locale=C
fi

# Start postgres (waits until ready)
su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses=127.0.0.1" -w start

# Create role/db on first run (safe to ignore if already exists)
su-exec postgres psql -h 127.0.0.1 -c "CREATE ROLE fateshifter LOGIN PASSWORD '$PGPASS';" 2>/dev/null || true
su-exec postgres psql -h 127.0.0.1 -c "CREATE DATABASE fateshifter OWNER fateshifter;" 2>/dev/null || true

export DATABASE_URL="postgres://fateshifter:${PGPASS}@127.0.0.1:5432/fateshifter"

exec node src/index.js
