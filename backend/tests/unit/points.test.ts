import assert from "node:assert/strict";
import { once } from "node:events";
import jwt from "jsonwebtoken";
import test from "node:test";
import {
  adjustmentSchema,
  rankParticipants,
  signedDelta,
} from "../../src/modules/points/points.validation.js";

process.env.DATABASE_URL =
  "postgresql://test:test@127.0.0.1:5432/litfest_test?sslmode=disable";
process.env.JWT_SECRET = "points-route-test-secret-with-at-least-32-chars";

const [{ app }, { prisma }] = await Promise.all([
  import("../../src/app.js"),
  import("../../src/config/database.js"),
]);

function replaceMethod(target: object, key: string, value: unknown): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(target, key, {
    configurable: true,
    writable: true,
    value,
  });
  return () => {
    if (descriptor) Object.defineProperty(target, key, descriptor);
    else Reflect.deleteProperty(target, key);
  };
}

async function withServer(run: (baseUrl: string) => Promise<void>): Promise<void> {
  const server = app.listen(0);
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("adjustment validation trims required event and reason values", () => {
  const parsed = adjustmentSchema.safeParse({
    action: "ADD",
    points: 12,
    eventName: "  Poetry Slam ",
    reason: "  First place ",
    idempotencyKey: "55bc02fe-b369-4a14-90d3-28730ece8d56",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.eventName, "Poetry Slam");
    assert.equal(parsed.data.reason, "First place");
  }
});

test("adjustment validation rejects invalid amounts and missing details", () => {
  for (const points of [0, -2, 1.5, Number.MAX_SAFE_INTEGER]) {
    assert.equal(
      adjustmentSchema.safeParse({
        action: "ADD",
        points,
        eventName: "Debate",
        reason: "Award",
        idempotencyKey: "55bc02fe-b369-4a14-90d3-28730ece8d56",
      }).success,
      false,
    );
  }

  assert.equal(
    adjustmentSchema.safeParse({
      action: "ADD",
      points: 10,
      eventName: " ",
      reason: "",
      idempotencyKey: "55bc02fe-b369-4a14-90d3-28730ece8d56",
    }).success,
    false,
  );
});

test("point action creates a signed ledger delta", () => {
  assert.equal(signedDelta("ADD", 20), 20);
  assert.equal(signedDelta("DEDUCT", 5), -5);
});

test("leaderboard ranking is score-first with stable name and ID ties", () => {
  const ranked = rankParticipants([
    { id: "3", name: "Riya", totalPoints: 10 },
    { id: "2", name: "Aman", totalPoints: 10 },
    { id: "1", name: "Aman", totalPoints: 10 },
    { id: "4", name: "Zoya", totalPoints: -2 },
  ]);

  assert.deepEqual(
    ranked.map(({ id, rank }) => [id, rank]),
    [
      ["1", 1],
      ["2", 2],
      ["3", 3],
      ["4", 4],
    ],
  );
});

test("points profile and mutation endpoints reject non-admin identities from the database", async (t) => {
  t.after(
    replaceMethod(prisma.user, "findUnique", async () => ({ role: "USER" })),
  );
  const token = jwt.sign(
    { sub: "501", role: "ADMIN" },
    process.env.JWT_SECRET!,
  );

  await withServer(async (baseUrl) => {
    const unauthenticated = await fetch(
      `${baseUrl}/api/v1/points/admin/participants/502`,
    );
    assert.equal(unauthenticated.status, 401);

    const profile = await fetch(
      `${baseUrl}/api/v1/points/admin/participants/502`,
      { headers: { Cookie: `litfest_session=${token}` } },
    );
    assert.equal(profile.status, 403);

    const mutation = await fetch(
      `${baseUrl}/api/v1/points/admin/participants/502/adjustments`,
      {
        method: "POST",
        headers: {
          Cookie: `litfest_session=${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "ADD",
          points: 10,
          eventName: "Test event",
          reason: "Test reason",
          idempotencyKey: "55bc02fe-b369-4a14-90d3-28730ece8d56",
        }),
      },
    );
    assert.equal(mutation.status, 403);
  });
});
