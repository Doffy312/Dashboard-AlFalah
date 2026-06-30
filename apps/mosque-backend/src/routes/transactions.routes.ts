import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { transactionController } from "../controllers/transactions.controller.js";

const router = Router();

// All transaction routes require authentication
router.use(requireAuth);

// Read access: Ketua + Bendahara
router.get(
  "/",
  requireRole("Ketua", "Bendahara"),
  transactionController.findAll
);
router.get(
  "/summary",
  requireRole("Ketua", "Bendahara"),
  transactionController.getSummary
);
router.get(
  "/:id",
  requireRole("Ketua", "Bendahara"),
  transactionController.findById
);

// Write access: Bendahara only (Ketua is read-only per PRD)
router.post(
  "/",
  requireRole("Ketua", "Bendahara"),
  transactionController.create
);
router.put(
  "/:id",
  requireRole("Ketua", "Bendahara"),
  transactionController.update
);
router.delete(
  "/:id",
  requireRole("Ketua", "Bendahara"),
  transactionController.delete
);

export default router;
