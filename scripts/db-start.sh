#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA="$ROOT/.pgdata"
SOCKET="$PGDATA/socket"
PORT="${UZDFPRO_PG_PORT:-55432}"
DB_MAIN="uzdfpro"
DB_TEST="uzdfpro_test"

if [ ! -d "$PGDATA" ]; then
  echo "Lokal PostgreSQL klaster yaratilmoqda: $PGDATA"
  initdb -D "$PGDATA" -U postgres --auth=trust --encoding=UTF8 --locale=C >/dev/null
  mkdir -p "$SOCKET"
  {
    echo "port = $PORT"
    echo "unix_socket_directories = '$SOCKET'"
    echo "listen_addresses = '127.0.0.1'"
  } >> "$PGDATA/postgresql.conf"
fi

if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  echo "Postgres allaqachon ishlayapti (port $PORT)"
else
  pg_ctl -D "$PGDATA" -l "$PGDATA/postgres.log" -w start
fi

for db in "$DB_MAIN" "$DB_TEST"; do
  if ! psql -h 127.0.0.1 -p "$PORT" -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
    createdb -h 127.0.0.1 -p "$PORT" -U postgres "$db"
    echo "Baza yaratildi: $db"
  fi
done

echo "Tayyor: postgresql://postgres@127.0.0.1:$PORT/$DB_MAIN"
