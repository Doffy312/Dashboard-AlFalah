import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env, getCorsOrigins, isLocalNetworkOrigin } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.middleware.js";
import { sanitizeBody, sanitizeQuery } from "./middlewares/sanitize.middleware.js";
import apiRoutes from "./routes/index.js";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";
import { initBackupService } from "./services/backup.service.js";
import { programService } from "./services/programs.service.js";
import { syncProgramTable } from "./db/sync-program-db.js";
import path from "path";
import fs from "fs";

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO Setup ───────────────────────────────────────────────────
initializeSocket(httpServer);

// ─── HTTP Security Headers (Helmet) ───────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Agar static files/uploads bisa dimuat frontend dari port berbeda
    contentSecurityPolicy: false, // Non-aktifkan CSP bawaan agar tidak memblokir Socket.IO/assets lokal
  })
);

// ─── Global Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = getCorsOrigins(origin);
      if (allowedOrigins.includes(origin) || isLocalNetworkOrigin(origin) || env.NODE_ENV === "development") {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true, // Required for Better Auth cookies
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Input Sanitization (Anti Stored XSS) ────────────────────────────
app.use(sanitizeBody);
app.use(sanitizeQuery);

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
        <p>Server is running successfully with Instant Security Hardening (Helmet & Rate Limiter)!</p>
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
    security: {
      rateLimiter: "active",
      helmetHeaders: "active",
      sanitizer: "active",
    },
  });
});

// ─── API Routes (Protected by Global Rate Limiter) ───────────────────
app.use("/api", globalRateLimiter, apiRoutes);

// ─── Global Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
  initBackupService();
  syncProgramTable().catch((err) => {
    console.error("Failed to sync program table schema on startup:", err);
  });
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
