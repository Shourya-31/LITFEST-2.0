import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../config/database.js";

const router = Router();

const COOKIE_NAME = "litfest_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_MS,
};

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(20).optional().nullable(),
  college: z.string().trim().max(100).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
});

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }

  return secret;
}

function createSession(userId: bigint): string {
  return jwt.sign({ sub: userId.toString() }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

function publicUser(user: {
  id: bigint;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  college: string | null;
  bio: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    college: user.college,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid registration details",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const { name, email, password, phone, college, bio } = parsed.data;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone || null,
        college: college || null,
        bio: bio || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        college: true,
        bio: true,
        createdAt: true,
      },
    });

    const token = createSession(user.id);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user: publicUser(user) },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("Registration failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid email or password format",
    });
    return;
  }

  try {
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const token = createSession(user.id);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: publicUser(user),
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

router.get("/me", async (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !/^\d+$/.test(payload.sub)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid session",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        college: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      res.status(401).json({
        success: false,
        message: "User account no longer exists",
      });
      return;
    }

    res.json({
      success: true,
      data: { user: publicUser(user) },
    });
  } catch {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
});

export default router;
