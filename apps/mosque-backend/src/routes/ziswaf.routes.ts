import { Router } from "express";
import { ziswafController } from "../controllers/ziswaf.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createZiswafSchema } from "../validations/ziswaf.validation.js";

const router = Router();

// All ziswaf routes require authentication
router.use(requireAuth);

// Read access: All authenticated roles
router.get("/", asyncHandler(ziswafController.getAll));
router.get("/:id", asyncHandler(ziswafController.getById));

// Write access: Bendahara + Ketua only
router.post("/", requireRole("Ketua", "Bendahara"), sanitizeBody, validate(createZiswafSchema), asyncHandler(ziswafController.create));
router.put("/:id", requireRole("Ketua", "Bendahara"), sanitizeBody, validate(createZiswafSchema), asyncHandler(ziswafController.update));
router.delete("/:id", requireRole("Ketua", "Bendahara"), asyncHandler(ziswafController.remove));

export default router;
