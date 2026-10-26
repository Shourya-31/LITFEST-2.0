import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "litfest_session";

declare global {
  namespace Express {
    interface Request {
      userId?: bigint;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
      return;
    }

    const payload = jwt.verify(token, secret);

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

    req.userId = BigInt(payload.sub);
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session",
    });
  }
}
