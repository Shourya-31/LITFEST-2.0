import { lookup } from "node:dns/promises";
import net from "node:net";
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not configured in this environment.");
  process.exit(1);
}

let url;
try {
  url = new URL(connectionString);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname ||
    !url.pathname.slice(1)
  ) {
    throw new Error();
  }
} catch {
  console.error("DATABASE_URL is not a valid PostgreSQL URL with a hostname and database.");
  process.exit(1);
}

const hostname = url.hostname.replace(/^\[|\]$/g, "");
const port = Number(url.port || 5432);
const sslmode = url.searchParams.get("sslmode");
const safeSslMode =
  sslmode && /^(disable|allow|prefer|require|verify-ca|verify-full)$/i.test(sslmode)
    ? sslmode.toLowerCase()
    : sslmode
      ? "custom"
      : "unspecified";

console.log(JSON.stringify({
  stage: "configuration",
  hostname,
  port,
  databaseConfigured: Boolean(url.pathname.slice(1)),
  usernameConfigured: Boolean(url.username),
  passwordConfigured: Boolean(url.password),
  sslMode: safeSslMode,
  pooledHost: hostname.includes("-pooler"),
}));
if (
  hostname.endsWith(".neon.tech") &&
  !["require", "verify-ca", "verify-full"].includes(safeSslMode)
) {
  console.warn(JSON.stringify({ warning: "neon_sslmode_not_secure" }));
}

function safeError(stage, error) {
  const details = { stage };
  for (const key of ["code", "syscall", "hostname"]) {
    const value = error && typeof error[key] === "string" ? error[key] : undefined;
    if (value && /^[A-Za-z0-9._:-]{1,255}$/.test(value)) {
      details[key] = value;
    }
  }
  if (
    error &&
    typeof error.port === "number" &&
    Number.isInteger(error.port) &&
    error.port > 0 &&
    error.port <= 65535
  ) {
    details.port = error.port;
  }
  if (
    error &&
    typeof error.message === "string" &&
    /timeout expired|connection (?:timed out|refused|reset|terminated unexpectedly)|network is unreachable|host is unreachable|socket hang up|connect ETIMEDOUT|connect ECONN(?:REFUSED|RESET)|getaddrinfo EAI_AGAIN/i.test(
      error.message,
    )
  ) {
    details.errorType = "transient_connection_failure";
  }
  console.error(JSON.stringify(details));
}

try {
  const addresses = await lookup(hostname, { all: true });
  console.log(JSON.stringify({
    stage: "dns",
    result: "ok",
    addressCount: addresses.length,
    addressFamilies: [...new Set(addresses.map(({ family }) => family))],
  }));
} catch (error) {
  safeError("dns", error);
  process.exit(1);
}

try {
  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: hostname, port });
    const timeout = setTimeout(() => {
      socket.destroy(Object.assign(new Error(), { code: "ETIMEDOUT", syscall: "connect", hostname, port }));
    }, 5_000);
    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve();
    });
    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
  console.log(JSON.stringify({ stage: "tcp", result: "ok", hostname, port }));
} catch (error) {
  safeError("tcp", error);
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 1_000,
  query_timeout: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

let client;
try {
  client = await pool.connect();
  console.log(JSON.stringify({
    stage: "postgres_connect",
    result: "ok",
    note: "PostgreSQL protocol negotiation, TLS if configured, and authentication succeeded",
  }));
} catch (error) {
  safeError("postgres_connect_or_tls", error);
  await pool.end();
  process.exit(1);
}

try {
  await client.query("SELECT 1");
  console.log(JSON.stringify({ stage: "select_1", result: "ok" }));
} catch (error) {
  safeError("select_1", error);
  client.release();
  await pool.end();
  process.exit(1);
}

client.release();
await pool.end();
