#!/bin/sh
set -eu

cd /app/backend

echo "Running Litfest database migrations..."
npx prisma migrate deploy --config prisma7.config.ts

echo "Starting Litfest API..."
node dist/server.js &

echo "Starting Nginx..."
exec nginx -g "daemon off;"
