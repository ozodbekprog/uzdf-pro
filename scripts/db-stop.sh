#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA="$ROOT/.pgdata"

if pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
  pg_ctl -D "$PGDATA" -w stop
else
  echo "Postgres ishlamayapti"
fi
