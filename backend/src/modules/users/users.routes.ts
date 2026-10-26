import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../config/database.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const router = Router();

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  college: z.string().trim().max(150).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
}).refine(
  (data) => Object.values(data).some((value) => value !== undefined),
  { message: "Provide at least one field to update" },
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
}).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must differ from the current password",
    path: ["newPassword"],
  },
);

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  college: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
} as const;

function publicUser(user: {
  id: bigint;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  college: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...user,
    id: user.id.toString(),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

router.use(requireAuth);

router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: userSelect,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { user: publicUser(user) },
    });
  } catch (error) {
    console.error("Fetch profile failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
});

router.patch("/me", async (req: Request, res: Response) => {
  const parsed = profileSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid profile details",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: parsed.data,
      select: userSelect,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: publicUser(user) },
    });
  } catch (error) {
    console.error("Update profile failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
});

router.patch("/me/password", async (req: Request, res: Response) => {
  const parsed = changePasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid password details",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const matches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );

    if (!matches) {
      res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
});

export default router;
