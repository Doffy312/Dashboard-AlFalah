import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/**
 * Global error handler — catches unhandled errors and returns
 * a consistent JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("🔥 Unhandled error:", err.message);
  console.error(err.stack);

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validasi data gagal",
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    });
    return;
  }

  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
}
