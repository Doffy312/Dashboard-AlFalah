import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { jemaahController } from "../controllers/jemaah.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createJemaahSchema } from "../validations/jemaah.validation.js";

const router = Router();

router.use(requireAuth);

// Read access: All roles
router.get("/", jemaahController.findAll);
router.get("/summary", jemaahController.getSummary);
router.get("/:id", jemaahController.findById);

// Write access: Ketua + Sekretaris only (per JemaahPage canEdit)
router.post(
  "/",
  requireRole("Ketua", "Sekretaris"),
  sanitizeBody,
  validate(createJemaahSchema),
  jemaahController.create
);
router.put(
  "/:id",
  requireRole("Ketua", "Sekretaris"),
  sanitizeBody,
  validate(createJemaahSchema),
  jemaahController.update
);
router.delete(
  "/:id",
  requireRole("Ketua", "Sekretaris"),
  jemaahController.delete
);

export default router;
