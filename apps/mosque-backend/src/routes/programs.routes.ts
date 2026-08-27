import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { programController } from "../controllers/programs.controller.js";
import { uploadMiddleware } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createProgramSchema } from "../validations/programs.validation.js";

const router = Router();

// Public Calendar Feed & Program Summary
router.get("/feed.ics", programController.getFeed);
router.get("/summary", programController.getSummary);

router.use(requireAuth);

// Read access: All authenticated roles
router.get("/", programController.findAll);
router.get("/:id", programController.findById);

// Write access: Create by Ketua & Sekretaris, Edit & Delete by Ketua only
router.post(
  "/",
  requireRole("Ketua", "Sekretaris"),
  sanitizeBody,
  validate(createProgramSchema),
  programController.create
);
router.put(
  "/:id",
  requireRole("Ketua"),
  sanitizeBody,
  validate(createProgramSchema),
  programController.update
);

// Status-only update (Kanban drag) — Ketua & Sekretaris
router.patch(
  "/:id/status",
  requireRole("Ketua", "Sekretaris"),
  programController.updateStatus
);

router.patch(
  "/:id/complete",
  requireRole("Ketua", "Sekretaris"),
  uploadMiddleware.fields([
    { name: 'report', maxCount: 1 },
    { name: 'photos', maxCount: 3 }
  ]),
  programController.completeProgram
);

router.delete(
  "/:id",
  requireRole("Ketua"),
  programController.delete
);

export default router;
