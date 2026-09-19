import { Router } from "express";
import { z } from "zod";
import { validate } from "../middlewares/validate.middleware.js";
import { clientLogRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { errorLogService } from "../services/errorLog.service.js";

const router = Router();

const clientErrorSchema = z.object({
  errorName: z.string().min(1).max(150),
  errorMessage: z.string().min(1).max(2000),
  stackTrace: z.string().max(10000).optional(),
  currentPath: z.string().max(500).optional(),
  componentStack: z.string().max(5000).optional(),
  requestId: z.string().max(100).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * POST /api/logs/client
 * Endpoint telemetry untuk menerima laporan error dari browser frontend (React ErrorBoundary)
 */
router.post(
  "/client",
  clientLogRateLimiter,
  validate(clientErrorSchema),
  (req, res) => {
    const {
      errorName,
      errorMessage,
      stackTrace,
      currentPath,
      componentStack,
      requestId,
      metadata,
    } = req.body;

    // Non-blocking logging
    errorLogService.logError({
      level: "ERROR",
      source: "FRONTEND",
      requestId:
        requestId ||
        (req.headers["x-request-id"] as string) ||
        (req as any).id,
      error: {
        name: errorName,
        message: errorMessage,
        stack: stackTrace,
      },
      httpStatusCode: 500,
      req,
      context: {
        currentPath,
        componentStack,
        metadata,
      },
    });

    res.status(200).json({ success: true });
  }
);

export default router;
