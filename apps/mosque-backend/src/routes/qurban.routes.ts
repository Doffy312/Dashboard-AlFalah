import { Router } from "express";
import { qurbanController } from "../controllers/qurban.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";

const router = Router();

// All qurban routes require authentication
router.use(requireAuth);

// Summary stats & charts
router.get("/summary", asyncHandler(qurbanController.getSummary));

// Qurban Years
router.get("/tahun", asyncHandler(qurbanController.getAllTahun));
router.post("/tahun", requireRole("Ketua", "Sekretaris", "Bendahara", "Pengurus"), asyncHandler(qurbanController.createTahun));

// Qurban Groups
router.get("/kelompok", asyncHandler(qurbanController.getKelompok));
router.post("/kelompok", requireRole("Ketua", "Sekretaris", "Bendahara", "Pengurus"), asyncHandler(qurbanController.createKelompok));
router.delete("/kelompok/:id", requireRole("Ketua", "Sekretaris", "Bendahara", "Pengurus"), asyncHandler(qurbanController.deleteKelompok));

// Pequrban Data CRUD
router.get("/", asyncHandler(qurbanController.getAll));
router.get("/:id", asyncHandler(qurbanController.getById));
router.post("/", requireRole("Ketua", "Sekretaris", "Bendahara", "Pengurus"), asyncHandler(qurbanController.create));
router.put("/:id", requireRole("Ketua", "Sekretaris", "Bendahara", "Pengurus"), asyncHandler(qurbanController.update));
router.delete("/:id", requireRole("Ketua", "Sekretaris", "Bendahara", "Pengurus"), asyncHandler(qurbanController.remove));

export default router;
