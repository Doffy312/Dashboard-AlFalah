import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth.js";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Pasang rate limiter ketat untuk semua rute otentikasi (/api/auth/*)
router.use(authRateLimiter);

// Better Auth handles all routes under /api/auth/*
// This includes: sign-in, sign-up, sign-out, session, etc.
router.all("/*splat", toNodeHandler(auth));

export default router;

