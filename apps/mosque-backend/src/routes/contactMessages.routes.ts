import { Router } from "express";
import { contactMessagesController } from "../controllers/contactMessages.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

// Public endpoint for Landing Page contact form
router.post("/", asyncHandler(contactMessagesController.create));

// Protected endpoints for Dashboard Takmir Admins
router.get("/", requireAuth, asyncHandler(contactMessagesController.getAll));
router.get("/:id", requireAuth, asyncHandler(contactMessagesController.getById));
router.patch("/:id/status", requireAuth, asyncHandler(contactMessagesController.updateStatus));
router.delete("/:id", requireAuth, requireRole("Ketua"), asyncHandler(contactMessagesController.delete));

export default router;
