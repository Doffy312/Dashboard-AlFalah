import { Router } from "express";
import { jadwalController } from "../controllers/jadwal.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import { createJadwalSchema } from "../validations/jadwal.validation.js";

const router = Router();

// All jadwal routes require authentication
router.use(requireAuth);

// Read access: All authenticated roles
router.get("/", jadwalController.getAll);
router.get("/:id", jadwalController.getById);

// Write access: Sekretaris + Ketua only
router.post("/", requireRole("Ketua", "Sekretaris"), sanitizeBody, validate(createJadwalSchema), jadwalController.create);
router.put("/:id", requireRole("Ketua", "Sekretaris"), sanitizeBody, validate(createJadwalSchema), jadwalController.update);
router.delete("/:id", requireRole("Ketua", "Sekretaris"), jadwalController.remove);

export default router;
