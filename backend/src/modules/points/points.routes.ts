import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import {
  adjustmentSchema,
  rankParticipants,
  signedDelta,
} from "./points.validation.js";

const router = Router();
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

const MAX_DATABASE_ID = 9_223_372_036_854_775_807n;
const databaseIdSchema = z
  .string()
  .regex(/^[1-9]\d{0,18}$/)
  .refine((value) => BigInt(value) <= MAX_DATABASE_ID);
const pageSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  cursor: databaseIdSchema.optional(),
});
function isPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

async function getLeaderboard() {
  const [users, totals] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, name: true },
    }),
    prisma.pointTransaction.groupBy({
      by: ["userId"],
      _sum: { delta: true },
    }),
  ]);
  const pointsByUser = new Map(
    totals.map(({ userId, _sum }) => [userId.toString(), _sum.delta ?? 0]),
  );
  const entries = users.map((user) => ({
    id: user.id.toString(),
    name: user.name,
    totalPoints: pointsByUser.get(user.id.toString()) ?? 0,
  }));

  return rankParticipants(entries);
}

async function getParticipantProfile(
  userId: bigint,
  limit: number,
  cursor?: string,
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "USER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      college: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  if (cursor) {
    const cursorTransaction = await prisma.pointTransaction.findFirst({
      where: { id: BigInt(cursor), userId },
      select: { id: true },
    });
    if (!cursorTransaction) return undefined;
  }

  const [total, transactions, leaderboard] = await Promise.all([
    prisma.pointTransaction.aggregate({
      where: { userId },
      _sum: { delta: true },
    }),
    prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      ...(cursor ? { cursor: { id: BigInt(cursor) }, skip: 1 } : {}),
      include: {
        administrator: {
          select: { id: true, name: true },
        },
      },
    }),
    getLeaderboard(),
  ]);

  const hasMore = transactions.length === limit;
  return {
    participant: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      college: user.college,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
      totalPoints: total._sum.delta ?? 0,
      rank:
        leaderboard.findIndex((entry) => entry.id === user.id.toString()) + 1,
    },
    transactions: transactions.map((transaction) => ({
      id: transaction.id.toString(),
      eventName: transaction.eventName,
      delta: transaction.delta,
      reason: transaction.reason,
      createdAt: transaction.createdAt.toISOString(),
      administrator: {
        id: transaction.administrator.id.toString(),
        name: transaction.administrator.name,
      },
    })),
    nextCursor: hasMore
      ? transactions[transactions.length - 1]!.id.toString()
      : null,
  };
}

async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      res
        .status(403)
        .json({ success: false, message: "Administrator access required" });
      return;
    }
    next();
  } catch (error) {
    console.error("Points authorization failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to verify administrator access",
    });
  }
}

router.use(requireAuth);

router.get("/leaderboard", async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, data: { leaderboard: await getLeaderboard() } });
  } catch (error) {
    console.error("Fetch points leaderboard failed:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch leaderboard" });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  const query = pageSchema.safeParse(req.query);
  if (!query.success) {
    res
      .status(400)
      .json({ success: false, message: "Invalid points history pagination" });
    return;
  }

  try {
    const result = await getParticipantProfile(
      req.userId!,
      query.data.limit,
      query.data.cursor,
    );
    if (result === null) {
      res
        .status(404)
        .json({ success: false, message: "Participant not found" });
      return;
    }
    if (result === undefined) {
      res
        .status(400)
        .json({ success: false, message: "Invalid points history cursor" });
      return;
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Fetch own points profile failed:", error);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch points profile" });
  }
});

router.get(
  "/admin/participants/:userId",
  requireAdmin,
  async (req: Request, res: Response) => {
    const parsedId = databaseIdSchema.safeParse(req.params.userId);
    const query = pageSchema.safeParse(req.query);
    if (!parsedId.success || !query.success) {
      res.status(400).json({
        success: false,
        message: "Invalid participant or pagination details",
      });
      return;
    }

    try {
      const result = await getParticipantProfile(
        BigInt(parsedId.data),
        query.data.limit,
        query.data.cursor,
      );
      if (result === null) {
        res
          .status(404)
          .json({ success: false, message: "Participant not found" });
        return;
      }
      if (result === undefined) {
        res
          .status(400)
          .json({ success: false, message: "Invalid points history cursor" });
        return;
      }
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Fetch participant points profile failed:", error);
      res.status(500).json({
        success: false,
        message: "Unable to fetch participant points profile",
      });
    }
  },
);

router.post(
  "/admin/participants/:userId/adjustments",
  requireAdmin,
  async (req: Request, res: Response) => {
    const parsedId = databaseIdSchema.safeParse(req.params.userId);
    const parsedBody = adjustmentSchema.safeParse(req.body);
    if (!parsedId.success || !parsedBody.success) {
      res.status(400).json({
        success: false,
        message: "Invalid points adjustment",
        errors: parsedBody.success
          ? undefined
          : parsedBody.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = BigInt(parsedId.data);
    const administratorId = req.userId!;
    const { action, points, eventName, reason, idempotencyKey } =
      parsedBody.data;
    const delta = signedDelta(action, points);

    try {
      const participant = await prisma.user.findFirst({
        where: { id: userId, role: "USER" },
        select: { id: true },
      });
      if (!participant) {
        res
          .status(404)
          .json({ success: false, message: "Participant not found" });
        return;
      }

      const existing = await prisma.pointTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        if (
          existing.userId !== userId ||
          existing.administratorId !== administratorId ||
          existing.delta !== delta ||
          existing.eventName !== eventName ||
          existing.reason !== reason
        ) {
          res.status(409).json({
            success: false,
            message: "Idempotency key was already used",
          });
          return;
        }
        res.json({
          success: true,
          data: { transactionId: existing.id.toString(), duplicate: true },
        });
        return;
      }

      const transaction = await prisma.pointTransaction.create({
        data: {
          userId,
          administratorId,
          eventName,
          delta,
          reason,
          idempotencyKey,
        },
      });
      res.status(201).json({
        success: true,
        message: "Points adjustment recorded",
        data: { transactionId: transaction.id.toString(), duplicate: false },
      });
    } catch (error) {
      if (isPrismaCode(error, "P2002")) {
        try {
          const existing = await prisma.pointTransaction.findUnique({
            where: { idempotencyKey },
          });
          if (
            existing &&
            existing.userId === userId &&
            existing.administratorId === administratorId &&
            existing.delta === delta &&
            existing.eventName === eventName &&
            existing.reason === reason
          ) {
            res.json({
              success: true,
              data: { transactionId: existing.id.toString(), duplicate: true },
            });
            return;
          }
        } catch (lookupError) {
          console.error(
            "Idempotent points adjustment lookup failed:",
            lookupError,
          );
        }
        res.status(409).json({
          success: false,
          message: "Idempotency key was already used",
        });
        return;
      }
      console.error("Create points adjustment failed:", error);
      res.status(500).json({
        success: false,
        message: "Unable to record points adjustment",
      });
    }
  },
);

export default router;
