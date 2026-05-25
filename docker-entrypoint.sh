#!/bin/sh
set -e

PGDATA=/var/lib/postgresql/data
PGPASS="${POSTGRES_PASSWORD:-fateshifter_secret}"

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  su-exec postgres initdb -D "$PGDATA" --encoding=UTF8 --locale=C
fi

su-exec postgres pg_ctl -D "$PGDATA" -o "-c listen_addresses=127.0.0.1" start -w

su-exec postgres psql -h 127.0.0.1 -c "CREATE ROLE fateshifter LOGIN PASSWORD '$PGPASS';" 2>/dev/null || true
su-exec postgres psql -h 127.0.0.1 -c "CREATE DATABASE fateshifter OWNER fateshifter;" 2>/dev/null || true

export DATABASE_URL="postgres://fateshifter:${PGPASS}@127.0.0.1:5432/fateshifter"

_shutdown() {
  su-exec postgres pg_ctl -D "$PGDATA" stop -m fast
  kill "$NODE_PID" 2>/dev/null
  wait "$NODE_PID" 2>/dev/null
}
trap _shutdown TERM INT

node src/index.js &
NODE_PID=$!
wait "$NODE_PID"
