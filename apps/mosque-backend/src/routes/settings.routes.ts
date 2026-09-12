import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { validateSettingBody } from "../validations/settings.validation.js";

const router = Router();

// Public endpoints to read settings (for Landing Page & App initialization)
router.get("/", settingsController.getAll);
router.get("/:key", settingsController.getByKey);

// Protected endpoints: Updating settings requires auth & manager roles + Zod validation
router.put(
  "/:key",
  requireAuth,
  requireRole("Ketua", "Bendahara", "Sekretaris", "Pengurus"),
  sanitizeBody,
  validateSettingBody,
  settingsController.update
);

export default router;
