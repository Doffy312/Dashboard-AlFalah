import { Router } from "express";
import { contactMessagesController } from "../controllers/contactMessages.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import {
  createContactMessageSchema,
  updateContactMessageStatusSchema,
} from "../validations/contactMessages.validation.js";

const router = Router();

// Public endpoint for Landing Page contact form (sanitized and validated)
router.post(
  "/",
  sanitizeBody,
  validate(createContactMessageSchema),
  asyncHandler(contactMessagesController.create)
);

// Protected endpoints for Dashboard Takmir Admins
router.get("/", requireAuth, asyncHandler(contactMessagesController.getAll));
router.get("/:id", requireAuth, asyncHandler(contactMessagesController.getById));
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("Ketua", "Sekretaris"),
  sanitizeBody,
  validate(updateContactMessageStatusSchema),
  asyncHandler(contactMessagesController.updateStatus)
);
router.delete("/:id", requireAuth, requireRole("Ketua"), asyncHandler(contactMessagesController.delete));

export default router;
