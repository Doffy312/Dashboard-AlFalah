import { Router } from "express";
import { notificationController } from "../controllers/notifications.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(notificationController.getAll));
router.patch("/mark-all-read", asyncHandler(notificationController.markAllAsRead));
router.patch("/:id/read", asyncHandler(notificationController.markAsRead));

export default router;
