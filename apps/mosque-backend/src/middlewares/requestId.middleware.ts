import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware untuk memastikan setiap request memiliki X-Request-Id unik
 * untuk penelusuran (tracing) end-to-end antara Frontend dan Backend.
 */
export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incomingId = (req.headers["x-request-id"] as string) || undefined;
  const requestId = incomingId || crypto.randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);

  next();
}
