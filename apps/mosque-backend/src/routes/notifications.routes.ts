import { Router } from "express";
import { notificationController } from "../controllers/notifications.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.use(requireAuth);

// All authenticated roles can view and mark notifications as read
router.get("/", asyncHandler(notificationController.getAll));
router.patch("/mark-all-read", asyncHandler(notificationController.markAllAsRead));
router.patch("/:id/read", asyncHandler(notificationController.markAsRead));

// Destructive deletion of global notifications requires Ketua or Sekretaris
router.delete("/clear-all", requireRole("Ketua", "Sekretaris"), asyncHandler(notificationController.deleteAll));
router.delete("/:id", requireRole("Ketua", "Sekretaris"), asyncHandler(notificationController.delete));

export default router;
