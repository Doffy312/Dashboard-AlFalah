import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { transactionController } from "../controllers/transactions.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createTransactionSchema } from "../validations/transactions.validation.js";

const router = Router();

// All transaction routes require authentication
router.use(requireAuth);

// Read access: Ketua + Bendahara
router.get(
  "/",
  transactionController.findAll
);
router.get(
  "/summary",
  transactionController.getSummary
);
router.get(
  "/:id",
  transactionController.findById
);

// Write access: Bendahara only (Ketua is read-only per PRD)
router.post(
  "/",
  requireRole("Ketua", "Bendahara"),
  sanitizeBody,
  validate(createTransactionSchema),
  transactionController.create
);
router.put(
  "/:id",
  requireRole("Ketua", "Bendahara"),
  sanitizeBody,
  validate(createTransactionSchema),
  transactionController.update
);
router.delete(
  "/:id",
  requireRole("Ketua", "Bendahara"),
  transactionController.delete
);

export default router;
