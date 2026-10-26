import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { prisma } from "./config/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/users.routes.js";
import passwordResetRoutes from "./modules/auth/password-reset.routes.js";

const app = express();
const port = Number(process.env.PORT) || 8000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: "LitFest API is healthy", database: "connected" });
    } catch (error) {
    console.error("Database health check failed:", error);
    res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
});

app.get("/api/v1", (_req, res) => {
  res.json({ success: true, message: "LitFest 2.0 API" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", passwordResetRoutes);

app.listen(port, () => {
  console.log(`LitFest API running at http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
