import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/rbac.middleware.js";
import { usersController } from "../controllers/users.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { sanitizeBody } from "../middlewares/sanitize.middleware.js";
import {
  createUserSchema,
  updateUserRoleSchema,
  verifyAndSetPasswordSchema,
} from "../validations/users.validation.js";

const router = Router();

// Rute publik untuk verifikasi email & pembuatan kata sandi (tanpa otentikasi)
router.post(
  "/verify-and-set-password",
  validate(verifyAndSetPasswordSchema),
  usersController.verifyAndSetPassword
);

// Semua rute user management berikutnya memerlukan otentikasi
router.use(requireAuth);

// Hanya "Ketua" yang berhak mengelola pengguna (menambah, mengirim email verifikasi, merubah peran, menghapus)
router.use(requireRole("Ketua"));

router.get("/", usersController.findAll);
router.post(
  "/",
  sanitizeBody,
  validate(createUserSchema),
  usersController.create
);
router.post("/:id/resend-verification", usersController.resendVerification);
router.patch(
  "/:id/role",
  sanitizeBody,
  validate(updateUserRoleSchema),
  usersController.updateRole
);
router.delete("/:id", usersController.delete);

export default router;
