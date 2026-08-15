import { Router } from "express";
import { auditLogController } from "../controllers/auditLog.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Rute ini dilindungi oleh otentikasi
router.get("/", requireAuth, auditLogController.findAll);

export default router;
