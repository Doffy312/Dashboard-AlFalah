import { Router } from "express";
import authRoutes from "./auth.routes.js";
import transactionRoutes from "./transactions.routes.js";
import programRoutes from "./programs.routes.js";
import jemaahRoutes from "./jemaah.routes.js";
import inventarisRoutes from "./inventaris.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import notificationRoutes from "./notifications.routes.js";
import usersRoutes from "./users.routes.js";
import ziswafRoutes from "./ziswaf.routes.js";
import qurbanRoutes from "./qurban.routes.js";
import jadwalRoutes from "./jadwal.routes.js";
import settingsRoutes from "./settings.routes.js";
import articlesRoutes from "./articles.routes.js";

const router = Router();

// Mount all route modules
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/programs", programRoutes);
router.use("/jemaah", jemaahRoutes);
router.use("/inventaris", inventarisRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/users", usersRoutes);
router.use("/ziswaf", ziswafRoutes);
router.use("/qurban", qurbanRoutes);
router.use("/jadwal", jadwalRoutes);
router.use("/settings", settingsRoutes);
router.use("/articles", articlesRoutes);

export default router;

