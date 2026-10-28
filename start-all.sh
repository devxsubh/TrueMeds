#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if [[ ! -d "$ROOT/api/.venv" ]]; then
  echo "Creating API venv…"
  python3 -m venv "$ROOT/api/.venv"
  "$ROOT/api/.venv/bin/pip" install -U pip
  "$ROOT/api/.venv/bin/pip" install -r "$ROOT/api/requirements.txt"
fi

if [[ ! -d "$ROOT/client/node_modules" ]]; then
  echo "Installing client deps…"
  (cd "$ROOT/client" && npm install)
fi

echo "Starting TrueMeds API on :8000"
(cd "$ROOT/api" && .venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000) &

echo "Starting TrueMeds client on :3000"
(cd "$ROOT/client" && NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev) &

wait
