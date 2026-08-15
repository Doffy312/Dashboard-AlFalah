import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler so that any thrown error
 * is forwarded to the global error handler via next().
 *
 * This eliminates the need for try-catch in every controller method
 * and prevents Unhandled Promise Rejections from crashing the server.
 *
 * @example
 * router.get("/", asyncHandler(controller.getAll));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
