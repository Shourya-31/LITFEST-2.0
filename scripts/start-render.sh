#!/bin/bash
set -eu

cd /app/backend

echo "Running Litfest database migrations..."
npx prisma migrate deploy --config prisma7.config.ts

echo "Starting Litfest API..."
node dist/server.js &
backend_pid=$!

echo "Starting Nginx..."
nginx -g "daemon off;" &
nginx_pid=$!

cleanup() {
  if [ -n "${backend_pid:-}" ]; then
    kill "$backend_pid" 2>/dev/null || true
    wait "$backend_pid" 2>/dev/null || true
  fi
  if [ -n "${nginx_pid:-}" ]; then
    kill "$nginx_pid" 2>/dev/null || true
    wait "$nginx_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT
trap 'exit 0' TERM INT

set +e
wait -n "$backend_pid" "$nginx_pid"
status=$?
set -e

echo "Backend or Nginx exited unexpectedly (status: $status)." >&2
exit 1
