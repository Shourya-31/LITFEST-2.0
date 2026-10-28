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
const port = Number(process.env.BACKEND_PORT) || 8000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const checkDatabase = async (_req: express.Request, res: express.Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: "LitFest API is healthy", database: "connected" });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "unknown";
    console.error(`Database readiness check failed (code: ${code})`);
    res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
};

app.get("/health", checkDatabase);
app.get("/health/ready", checkDatabase);

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
