import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { transactionController } from "../controllers/transactions.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createTransactionSchema, publicDonateSchema } from "../validations/transactions.validation.js";

const router = Router();

// Public financial kas summary for Landing Page transparency
router.get(
  "/summary",
  transactionController.getSummary
);

// Public donation endpoint for Landing Page (Scan QR Donasi Infaq)
router.post(
  "/public-donate",
  sanitizeBody,
  validate(publicDonateSchema),
  transactionController.publicDonate
);

// Protected transaction routes require authentication
router.use(requireAuth);

// Read access: Authenticated roles
router.get(
  "/",
  transactionController.findAll
);
router.get(
  "/:id",
  transactionController.findById
);

// Write access: Create by Ketua & Bendahara, Edit & Delete by Ketua only
router.post(
  "/",
  requireRole("Ketua", "Bendahara"),
  sanitizeBody,
  validate(createTransactionSchema),
  transactionController.create
);
router.put(
  "/:id",
  requireRole("Ketua"),
  sanitizeBody,
  validate(createTransactionSchema),
  transactionController.update
);
router.delete(
  "/:id",
  requireRole("Ketua"),
  transactionController.delete
);

export default router;
