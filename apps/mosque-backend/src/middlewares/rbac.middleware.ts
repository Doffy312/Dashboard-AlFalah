import type { Request, Response, NextFunction } from "express";

type Role = "Ketua" | "Sekretaris" | "Bendahara" | "Pengurus";

/**
 * Creates a middleware that restricts access to specific roles.
 * Must be used AFTER requireAuth middleware.
 *
 * @example
 * router.post("/", requireAuth, requireRole("Sekretaris", "Bendahara"), controller.create);
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as Role | undefined;

    if (!userRole) {
      res.status(401).json({ error: "Unauthorized — no user found" });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Forbidden — role '${userRole}' cannot access this resource`,
        requiredRoles: allowedRoles,
      });
      return;
    }

    next();
  };
}
