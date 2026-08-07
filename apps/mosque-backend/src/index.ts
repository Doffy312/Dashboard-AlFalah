import express from "express";
import cors from "cors";
import { env, getCorsOrigins } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import apiRoutes from "./routes/index.js";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";
import { initBackupService } from "./services/backup.service.js";
import path from "path";
import fs from "fs";

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO Setup ───────────────────────────────────────────────────
initializeSocket(httpServer);

// ─── Global Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true, // Required for Better Auth cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ────────────────────────────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// ─── Root & Health Check ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send(`
    <html>
      <head><title>Al-Falah Backend</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: white;">
        <h2>🌙 Al-Falah Backend API</h2>
        <p>Server is running successfully!</p>
        <p>Check API health: <a href="/api/health" style="color: #38bdf8;">/api/health</a></p>
      </body>
    </html>
  `);
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Global Error Handler ────────────────────────────────────────────
app.use(errorHandler);

import { programService } from "./services/programs.service.js";

// ─── Start Server ────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
  initBackupService();
  programService.syncAllCompletedPrograms().catch((err) => {
    console.error("Failed to sync completed programs on startup:", err);
  });
  console.log(`
  🕌 Mosque Dashboard Backend
  ────────────────────────────
  ✅ Server running on http://localhost:${env.PORT}
  📦 Environment: ${env.NODE_ENV}
  🔗 Frontend: ${env.FRONTEND_URL}
  🔑 Auth: ${env.BETTER_AUTH_URL}/api/auth
  ⚡ Socket.IO is active
  `);
});

export default app;
