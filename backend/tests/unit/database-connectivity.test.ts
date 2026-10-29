import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import pg from "pg";
import bcrypt from "bcryptjs";

process.env.DATABASE_URL =
  "postgresql://test:test@127.0.0.1:5432/litfest_test?sslmode=disable";
process.env.JWT_SECRET = "test-secret-with-at-least-thirty-two-characters";

const [{ app }, database] = await Promise.all([
  import("../../src/app.js"),
  import("../../src/config/database.js"),
]);
const { prisma } = database;

function replaceMethod(target: object, key: string, value: unknown): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, {
    configurable: true,
    writable: true,
    value,
  });
  return () => {
    if (descriptor) {
      Object.defineProperty(target, key, descriptor);
    } else {
      Reflect.deleteProperty(target, key);
    }
  };
}

async function withServer<T>(run: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = app.listen(0);
  await once(server, "listening");

  const address = server.address();
  assert.ok(address && typeof address !== "string");

  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("runtime pool has bounded Neon-friendly settings", () => {
  assert.deepEqual(
    {
      max: database.runtimePoolSettings.max,
      connectionTimeoutMillis: database.runtimePoolSettings.connectionTimeoutMillis,
      idleTimeoutMillis: database.runtimePoolSettings.idleTimeoutMillis,
      query_timeout: database.runtimePoolSettings.query_timeout,
      keepAlive: database.runtimePoolSettings.keepAlive,
      keepAliveInitialDelayMillis: database.runtimePoolSettings.keepAliveInitialDelayMillis,
    },
    {
      max: 5,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      query_timeout: 10_000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
    },
  );
});

test("wrapped PostgreSQL timeout errors are classified as transient", () => {
  assert.equal(
    database.isTransientDatabaseError({
      cause: new Error("timeout expired"),
    }),
    true,
  );
  assert.equal(
    database.isTransientDatabaseError({
      code: "P2002",
      message: "Unique constraint failed",
    }),
    false,
  );
});

test("pg connection timeout is bounded when the endpoint is unreachable", async () => {
  const pool = new pg.Pool({
    host: "203.0.113.1",
    port: 5432,
    user: "test",
    password: "test",
    database: "test",
    connectionTimeoutMillis: 250,
    max: 1,
  });
  const startedAt = Date.now();

  try {
    await assert.rejects(pool.connect());
    assert.ok(Date.now() - startedAt < 1_500);
  } finally {
    await pool.end();
  }
});

test("health distinguishes liveness from database readiness and recovers on a later check", async (t) => {
  let attempts = 0;
  t.after(replaceMethod(prisma, "$queryRaw", async (query: TemplateStringsArray) => {
    assert.equal(query.join(""), "SELECT 1");
    attempts += 1;
    if (attempts === 1) {
      throw Object.assign(new Error("network timeout"), { code: "ETIMEDOUT" });
    }
    return 1;
  }));

  await withServer(async (baseUrl) => {
    const live = await fetch(`${baseUrl}/health`);
    assert.equal(live.status, 200);

    const failedReady = await fetch(`${baseUrl}/health/ready`);
    assert.equal(failedReady.status, 503);
    assert.deepEqual(await failedReady.json(), {
      success: false,
      message: "Database unavailable",
    });

    const recoveredReady = await fetch(`${baseUrl}/health/ready`);
    assert.equal(recoveredReady.status, 200);
    assert.equal(attempts, 2);
  });
});

test("login succeeds with a database user result", async (t) => {
  const passwordHash = await bcrypt.hash("correct-password", 4);
  t.after(replaceMethod(prisma.user, "findUnique", async () => ({
    id: 502n,
    name: "Test User",
    email: "person@example.com",
    passwordHash,
    role: "USER",
    phone: null,
    college: null,
    bio: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  })));

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "person@example.com", password: "correct-password" }),
    });

    assert.equal(response.status, 200);
    assert.equal((await response.json()).message, "Login successful");
  });
});

test("login returns temporary-service error on database timeout, not invalid credentials", async (t) => {
  t.after(replaceMethod(prisma.user, "findUnique", async () => {
    throw Object.assign(new Error("network timeout"), { code: "ETIMEDOUT" });
  }));

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "person@example.com", password: "long-password" }),
    });

    assert.equal(response.status, 503);
    assert.match((await response.json()).message, /temporarily unavailable/i);
  });
});

test("registration succeeds with an available database and handles a transient failure without retrying", async (t) => {
  let successfulCreateCalls = 0;
  const restoreCreate = replaceMethod(prisma.user, "create", async ({ data }: {
    data: {
      name: string;
      email: string;
      phone?: string | null;
      college?: string | null;
      bio?: string | null;
    };
  }) => {
    successfulCreateCalls += 1;
    return {
    id: 501n,
    name: data.name,
    email: data.email,
    role: "USER",
    phone: data.phone ?? null,
    college: data.college ?? null,
    bio: data.bio ?? null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    };
  });
  t.after(restoreCreate);

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "long-password",
      }),
    });
    assert.equal(response.status, 201);
  });
  assert.equal(successfulCreateCalls, 1);
  restoreCreate();

  let failedCreateCalls = 0;
  const restoreFailedCreate = replaceMethod(prisma.user, "create", async () => {
    failedCreateCalls += 1;
    throw Object.assign(new Error("network timeout"), { code: "ETIMEDOUT" });
  });
  t.after(restoreFailedCreate);

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Another User",
        email: "another@example.com",
        password: "long-password",
      }),
    });
    assert.equal(response.status, 503);
  });
  assert.equal(failedCreateCalls, 1);
});

test("duplicate registration remains a conflict without a second create attempt", async (t) => {
  let createCalls = 0;
  t.after(replaceMethod(prisma.user, "create", async () => {
    createCalls += 1;
    throw Object.assign(new Error("unique constraint"), { code: "P2002" });
  }));

  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Existing User",
        email: "existing@example.com",
        password: "long-password",
      }),
    });
    assert.equal(response.status, 409);
  });
  assert.equal(createCalls, 1);
});
