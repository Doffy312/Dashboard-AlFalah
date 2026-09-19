import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { errorLogService } from "../services/errorLog.service.js";

/**
 * Global error handler — catches unhandled errors, records them to the
 * error_logs table and structured stdout, and returns a consistent, safe JSON response.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validasi data gagal",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Catat error secara non-blocking ke database dan structured console
  errorLogService.logError({
    level: "ERROR",
    source: "BACKEND",
    error: err,
    httpStatusCode: 500,
    req,
  });

  res.status(500).json({
    error: "Internal Server Error",
    requestId: req.id,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Terjadi kesalahan pada server. Silakan hubungi pengurus dengan menyertakan Request ID.",
  });
}
