import { Router } from "express";
import { qurbanController } from "../controllers/qurban.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createQurbanSchema } from "../validations/qurban.validation.js";

const router = Router();

// All qurban routes require authentication
router.use(requireAuth);

// Read access: All authenticated roles
router.get("/", qurbanController.getAll);
router.get("/:id", qurbanController.getById);

// Write access: Sekretaris + Ketua only
router.post("/", requireRole("Ketua", "Sekretaris"), sanitizeBody, validate(createQurbanSchema), qurbanController.create);
router.put("/:id", requireRole("Ketua", "Sekretaris"), sanitizeBody, validate(createQurbanSchema), qurbanController.update);
router.delete("/:id", requireRole("Ketua", "Sekretaris"), qurbanController.remove);

export default router;
