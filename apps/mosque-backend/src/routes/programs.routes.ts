import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { programController } from "../controllers/programs.controller.js";
import { uploadMiddleware } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(requireAuth);

// Read access: All roles
router.get("/", programController.findAll);
router.get("/summary", programController.getSummary);
router.get("/:id", programController.findById);

// Write access: Ketua, Sekretaris, Bendahara (all roles per ProgramKerjaPage canEdit)
router.post(
  "/",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  programController.create
);
router.put(
  "/:id",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  programController.update
);

// Status-only update (Kanban drag) — all roles
router.patch(
  "/:id/status",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  programController.updateStatus
);

router.patch(
  "/:id/complete",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  uploadMiddleware.fields([
    { name: 'report', maxCount: 1 },
    { name: 'photos', maxCount: 3 }
  ]),
  programController.completeProgram
);

router.delete(
  "/:id",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  programController.delete
);

export default router;
