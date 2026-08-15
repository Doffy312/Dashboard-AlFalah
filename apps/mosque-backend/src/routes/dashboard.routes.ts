import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";

const router = Router();

// Public endpoints for Landing Page & transparency
router.get("/summary", asyncHandler(dashboardController.getSummary));
router.get("/cashflow", asyncHandler(dashboardController.getCashflow));
router.get("/upcoming-programs", asyncHandler(dashboardController.getUpcomingPrograms));
router.get("/completed-programs", asyncHandler(dashboardController.getCompletedPrograms));

// Protected dashboard routes require authentication
router.use(requireAuth);

router.get("/allocation", asyncHandler(dashboardController.getAllocation));
router.get("/recent-activity", asyncHandler(dashboardController.getRecentActivity));

export default router;
