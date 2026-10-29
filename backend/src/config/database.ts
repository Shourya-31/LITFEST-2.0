import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PoolConfig } from "pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

function parseDatabaseUrl(value: string): URL {
  try {
    const url = new URL(value);
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      !url.hostname ||
      !url.pathname.slice(1)
    ) {
      throw new Error();
    }
    return url;
  } catch {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL URL with a hostname and database name",
    );
  }
}

const databaseUrl = parseDatabaseUrl(connectionString);
const targetHost = databaseUrl.hostname.replace(/^\[|\]$/g, "");
const targetPort = Number(databaseUrl.port || 5432);
const sslMode = databaseUrl.searchParams.get("sslmode");
const safeSslMode =
  sslMode && /^(disable|allow|prefer|require|verify-ca|verify-full)$/i.test(sslMode)
    ? sslMode.toLowerCase()
    : sslMode
      ? "custom"
      : "unspecified";

export const databaseTarget = {
  host: targetHost,
  port: targetPort,
  databaseConfigured: Boolean(databaseUrl.pathname.slice(1)),
  usernameConfigured: Boolean(databaseUrl.username),
  passwordConfigured: Boolean(databaseUrl.password),
  sslMode: safeSslMode,
  pooledHost: targetHost.includes("-pooler"),
};

export const runtimePoolSettings = {
  max: 5,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
  query_timeout: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
};

const poolConfig: PoolConfig = {
  connectionString,
  ...runtimePoolSettings,
};

const safeValue = (value: unknown, pattern: RegExp): string | undefined =>
  typeof value === "string" && pattern.test(value) ? value : undefined;

function readProperty(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  return Reflect.get(value, key);
}

function errorChain(error: unknown): unknown[] {
  const chain: unknown[] = [];
  let current: unknown = error;

  while (typeof current === "object" && current !== null && !chain.includes(current)) {
    chain.push(current);
    current = readProperty(current, "cause");
  }

  return chain;
}

export function isTransientDatabaseError(error: unknown): boolean {
  const transientCodes = new Set([
    "P1001",
    "P1002",
    "P1017",
    "P2024",
    "ECONNREFUSED",
    "ECONNRESET",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "EAI_AGAIN",
    "ENOTFOUND",
    "ETIMEDOUT",
    "EPIPE",
  ]);

  return errorChain(error).some((entry) => {
    const code =
      readProperty(entry, "code") ??
      readProperty(entry, "originalCode") ??
      readProperty(entry, "errno");
    if (typeof code === "string" && transientCodes.has(code)) {
      return true;
    }

    const message = readProperty(entry, "message");
    return (
      typeof message === "string" &&
      /timeout expired|connection (?:timed out|refused|reset|terminated unexpectedly)|network is unreachable|host is unreachable|socket hang up|connect ETIMEDOUT|connect ECONN(?:REFUSED|RESET)|getaddrinfo EAI_AGAIN/i.test(
        message,
      )
    );
  });
}

export function logDatabaseError(stage: string, error: unknown): void {
  const details: Record<string, string | number> = {
    stage,
    targetHost,
    targetPort,
  };
  const chain = errorChain(error);

  for (const key of ["code", "syscall", "hostname"] as const) {
    for (const entry of chain) {
      const value = safeValue(readProperty(entry, key), /^[A-Za-z0-9._:-]{1,255}$/);
      if (value) {
        details[key] = value;
        break;
      }
    }
  }

  for (const entry of chain) {
    const port = readProperty(entry, "port");
    if (typeof port === "number" && Number.isInteger(port) && port > 0 && port <= 65535) {
      details.port = port;
      break;
    }
  }

  if (isTransientDatabaseError(error)) {
    details.errorType = "transient_connection_failure";
  }

  console.error(`[database] ${JSON.stringify(details)}`);
}

console.info(`[database] ${JSON.stringify(databaseTarget)}`);
if (
  targetHost.endsWith(".neon.tech") &&
  !["require", "verify-ca", "verify-full"].includes(safeSslMode)
) {
  console.warn('[database] {"warning":"neon_sslmode_not_secure"}');
}

const adapter = new PrismaPg(poolConfig, {
  onPoolError: (error) => logDatabaseError("pool", error),
  onConnectionError: (error) => logDatabaseError("connection", error),
});

export const prisma = new PrismaClient({ adapter });
