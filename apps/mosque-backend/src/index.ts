import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import apiRoutes from "./routes/index.js";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";
import path from "path";
import fs from "fs";

const app = express();
const httpServer = createServer(app);

// ─── Socket.IO Setup ───────────────────────────────────────────────────
initializeSocket(httpServer);

// ─── Global Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: env.FRONTEND_URL,
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

// ─── Health Check ────────────────────────────────────────────────────
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

// ─── Start Server ────────────────────────────────────────────────────
httpServer.listen(env.PORT, () => {
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
