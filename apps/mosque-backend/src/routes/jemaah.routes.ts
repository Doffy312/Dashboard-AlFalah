import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { jemaahController } from "../controllers/jemaah.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createJemaahSchema, publicRegisterJemaahSchema } from "../validations/jemaah.validation.js";

const router = Router();

// Public aggregate jemaah category counts for Landing Page counter
router.get("/summary", jemaahController.getSummary);

// Public self-registration endpoint for landing page (Scan QR)
router.post(
  "/public-register",
  sanitizeBody,
  validate(publicRegisterJemaahSchema),
  jemaahController.publicRegister
);

// Protected routes require authentication (protects personal details)
router.use(requireAuth);

// Read access: All authenticated roles
router.get("/", jemaahController.findAll);
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
