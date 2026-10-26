import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "../../config/database.js";

const router = Router();

const resetRequestSchema = z.object({
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  newPassword: z.string().min(8).max(128),
});

const TOKEN_TTL_MS = 15 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Request a reset token.
// In development, the token is returned in the response for testing.
// In production, deliver it through a verified email service instead.
router.post("/forgot-password", async (req: Request, res: Response) => {
  const parsed = resetRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Enter a valid email address",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    // Avoid revealing whether an account exists.
    if (!user) {
      res.json({
        success: true,
        message: "If an account exists, reset instructions will be sent",
      });
      return;
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const response: {
      success: boolean;
      message: string;
      resetToken?: string;
    } = {
      success: true,
      message: "If an account exists, reset instructions will be sent",
    };

    if (process.env.NODE_ENV !== "production") {
      response.resetToken = rawToken;
    }

    res.json(response);
  } catch (error) {
    console.error("Password reset request failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to process password reset",
    });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid reset details",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const tokenHash = hashToken(parsed.data.token);

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() <= Date.now()
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    // Consume the token and change the password atomically.
    await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { usedAt: new Date() },
      });

      if (consumed.count !== 1) {
        throw new Error("RESET_TOKEN_ALREADY_USED");
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      });

      // Invalidate any other outstanding reset tokens for this user.
      await tx.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RESET_TOKEN_ALREADY_USED") {
      res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    console.error("Password reset failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
});

export default router;
