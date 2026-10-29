# Render and Neon PostgreSQL connectivity

## Render environment

Set `DATABASE_URL` to the canonical connection string copied from the intended Neon project and branch. Use Neon’s pooled (`-pooler`) endpoint for normal application traffic where appropriate, and retain Neon’s `sslmode=require` setting. Do not use a resolved IP address, a local/Docker hostname, or a connection string from another branch.

For Prisma Migrate, configure the optional Render environment variable `DIRECT_URL` with the canonical **direct, non-pooler** connection string for that same Neon project, branch, database, and user. Add it in the Render service’s **Environment** settings before deploying. `DIRECT_URL` is used only by the Prisma CLI migration configuration; runtime `PrismaPg` continues to use `DATABASE_URL`. If `DIRECT_URL` is not set, migrations retain the previous behavior and use `DATABASE_URL`.

The service’s Render health-check setting is external to this repository; verify it in the Render dashboard. Set the health-check path to `/health`, which reports process liveness and does not trigger a restart loop during a database outage. `/health/ready` performs `SELECT 1` and returns HTTP 503 when database access fails. Both paths are proxied by Nginx. Do not use readiness as the Render restart-oriented liveness check unless database outages are intended to restart the service.

## Safe one-shot diagnostic

Run this from the deployed service’s Shell (not as a public endpoint):

```sh
cd /app/backend && node scripts/diagnose-database.mjs
```

The script uses `DATABASE_URL` and the installed `pg` driver. It only performs DNS lookup, a TCP connect, PostgreSQL connection negotiation, and `SELECT 1`; it does not change data. Output includes the hostname, port, whether username/password/database are configured, SSL mode, pooler marker, connection stage, and safe network error fields. It never prints the connection URL, credentials, query parameters other than the allow-listed SSL mode, or resolved IP addresses. A successful migration does not prove that the application’s runtime adapter can connect.

Interpret `dns`, `tcp`, `postgres_connect_or_tls`, and `select_1` independently. DNS/TCP success followed by PostgreSQL/TLS failure indicates that the network path is reachable but PostgreSQL negotiation, TLS, authentication, or endpoint handling is failing; investigate the sanitized driver error fields and verify the Neon endpoint and SSL mode. The script cannot distinguish every server-side cause from client output alone.

Runtime logs report the same safe endpoint metadata and the connection stage plus available `code`, `syscall`, `hostname`, and `port` fields. They intentionally omit database error messages because driver messages can contain connection details.

After deployment, verify `/health` returns 200, `/health/ready` returns 200 with a working `SELECT 1`, and test login and registration using the intended production database. A code build or successful migration alone is not production verification.
