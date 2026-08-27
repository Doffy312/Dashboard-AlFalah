import { Router } from "express";
import { jadwalController } from "../controllers/jadwal.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createJadwalSchema } from "../validations/jadwal.validation.js";

const router = Router();

// Public read access for prayer & activity schedules
router.get("/", asyncHandler(jadwalController.getAll));
router.get("/:id", asyncHandler(jadwalController.getById));

// Protected write routes require authentication
router.use(requireAuth);

// Write access: Create by Ketua & Sekretaris, Edit & Delete by Ketua only
router.post("/", requireRole("Ketua", "Sekretaris"), sanitizeBody, validate(createJadwalSchema), asyncHandler(jadwalController.create));
router.put("/:id", requireRole("Ketua"), sanitizeBody, validate(createJadwalSchema), asyncHandler(jadwalController.update));
router.delete("/:id", requireRole("Ketua"), asyncHandler(jadwalController.remove));

export default router;
