import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { inventarisController } from "../controllers/inventaris.controller.js";

const router = Router();

router.use(requireAuth);

// Read access: All roles
router.get("/", inventarisController.findAll);
router.get("/summary", inventarisController.getSummary);
router.get("/:id", inventarisController.findById);

// Write access: Ketua, Sekretaris, Bendahara (all roles per InventarisPage canEdit)
router.post(
  "/",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  inventarisController.create
);
router.put(
  "/:id",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  inventarisController.update
);
router.delete(
  "/:id",
  requireRole("Ketua", "Sekretaris", "Bendahara"),
  inventarisController.delete
);

export default router;
