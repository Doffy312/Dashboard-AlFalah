import { Router } from "express";
import authRoutes from "./auth.routes.js";
import transactionRoutes from "./transactions.routes.js";
import programRoutes from "./programs.routes.js";
import jemaahRoutes from "./jemaah.routes.js";
import inventarisRoutes from "./inventaris.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import notificationRoutes from "./notifications.routes.js";

const router = Router();

// Mount all route modules
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/programs", programRoutes);
router.use("/jemaah", jemaahRoutes);
router.use("/inventaris", inventarisRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);

export default router;
