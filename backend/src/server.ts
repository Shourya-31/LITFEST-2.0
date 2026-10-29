import "dotenv/config";
import { prisma } from "./config/database.js";
import { app } from "./app.js";

const port = Number(process.env.BACKEND_PORT) || 8000;

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
