import { Router } from "express";
import { settingsController } from "../controllers/settings.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";

const router = Router();

// Public endpoints to read settings (for Landing Page & App initialization)
router.get("/", settingsController.getAll);
router.get("/:key", settingsController.getByKey);

// Protected endpoints: Updating settings requires auth & manager roles
router.put("/:key", requireAuth, requireRole("Ketua", "Bendahara", "Sekretaris", "Pengurus"), sanitizeBody, settingsController.update);

export default router;
