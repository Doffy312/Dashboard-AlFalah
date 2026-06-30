import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { dashboardController } from "../controllers/dashboard.controller.js";

const router = Router();

// All dashboard routes require authentication, all roles can view
router.use(requireAuth);

router.get("/summary", dashboardController.getSummary);
router.get("/cashflow", dashboardController.getCashflow);
router.get("/allocation", dashboardController.getAllocation);
router.get("/recent-activity", dashboardController.getRecentActivity);
router.get("/upcoming-programs", dashboardController.getUpcomingPrograms);

export default router;
