import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { inventarisController } from "../controllers/inventaris.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createInventarisSchema } from "../validations/inventaris.validation.js";

const router = Router();

router.use(requireAuth);

// Read access: All roles
router.get("/", inventarisController.findAll);
router.get("/summary", inventarisController.getSummary);
router.get("/:id", inventarisController.findById);

// Write access: Ketua, Sekretaris, Bendahara (all roles per InventarisPage canEdit)
router.post(
  "/",
  requireRole("Ketua", "Sekretaris"),
  sanitizeBody,
  validate(createInventarisSchema),
  inventarisController.create
);
router.put(
  "/:id",
  requireRole("Ketua", "Sekretaris"),
  sanitizeBody,
  validate(createInventarisSchema),
  inventarisController.update
);
router.delete(
  "/:id",
  requireRole("Ketua", "Sekretaris"),
  inventarisController.delete
);

export default router;
