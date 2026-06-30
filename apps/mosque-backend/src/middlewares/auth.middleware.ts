import type { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth.js";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request to carry the authenticated user & session
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
      session?: {
        id: string;
        userId: string;
        token: string;
        expiresAt: Date;
      };
    }
  }
}

/**
 * Middleware that verifies the Better Auth session from the request headers.
 * Attaches `req.user` and `req.session` if valid, otherwise returns 401.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData?.session || !sessionData?.user) {
      res.status(401).json({ error: "Unauthorized — session not found" });
      return;
    }

    req.user = {
      id: sessionData.user.id,
      name: sessionData.user.name,
      email: sessionData.user.email,
      role: (sessionData.user as any).role ?? "Ketua",
    };

    req.session = {
      id: sessionData.session.id,
      userId: sessionData.session.userId,
      token: sessionData.session.token,
      expiresAt: sessionData.session.expiresAt,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized — invalid session" });
  }
}
