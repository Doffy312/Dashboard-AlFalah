import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth.js";

const router = Router();

// Better Auth handles all routes under /api/auth/*
// This includes: sign-in, sign-up, sign-out, session, etc.
router.all("/*splat", toNodeHandler(auth));

export default router;
