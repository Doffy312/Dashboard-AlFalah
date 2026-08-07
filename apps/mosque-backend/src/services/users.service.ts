import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { db } from "../config/db.js";
import { user, verification } from "../db/schema/index.js";
import { auth } from "../config/auth.js";
import { emailService } from "./email.service.js";

export class UsersService {
  async findAll() {
    const data = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user);
    return data;
  }

  async create(data: { name: string; email: string; role?: string; password?: string }) {
    // 1. Buat password acak jika admin tidak menentukan password awal
    const tempPassword = data.password && data.password.length >= 8 
      ? data.password 
      : `P@ss-${crypto.randomBytes(6).toString("hex")}`;

    // 2. Buat akun menggunakan Better Auth (password di-hash otomatis)
    const result = await auth.api.signUpEmail({
      body: {
        email: data.email,
        password: tempPassword,
        name: data.name,
        role: data.role || "Pengurus",
      }
    });

    const createdUser = result.user;

    // 3. Pastikan emailVerified bernilai false (Unverified)
    await db
      .update(user)
      .set({ emailVerified: false })
      .where(eq(user.id, createdUser.id));

    // 4. Generate token verifikasi & simpan di tabel verification
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Masa berlaku 7 hari

    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: `reset-password:${token}`,
      value: createdUser.id,
      expiresAt,
    });

    // 5. Kirim email undangan & verifikasi
    await emailService.sendInvitationEmail({
      email: createdUser.email,
      name: createdUser.name,
      role: data.role || "Pengurus",
      token,
    });

    return {
      ...createdUser,
      emailVerified: false,
    };
  }

  async resendVerification(id: string) {
    // 1. Cari pengguna berdasarkan ID
    const targetUsers = await db.select().from(user).where(eq(user.id, id));
    if (!targetUsers.length) {
      throw new Error("Pengguna tidak ditemukan");
    }
    const targetUser = targetUsers[0];

    if (targetUser.emailVerified) {
      throw new Error("Email pengguna ini sudah terverifikasi");
    }

    // 2. Hapus token verifikasi lama untuk user ini jika ada
    await db
      .delete(verification)
      .where(eq(verification.value, targetUser.id));

    // 3. Buat token verifikasi baru
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(verification).values({
      id: crypto.randomUUID(),
      identifier: `reset-password:${token}`,
      value: targetUser.id,
      expiresAt,
    });

    // 4. Kirim email ulang
    await emailService.sendInvitationEmail({
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role || "Pengurus",
      token,
    });

    return { message: "Email verifikasi berhasil dikirim ulang!" };
  }

  async verifyAndSetPassword({ token, password }: { token: string; password: string }) {
    if (!token) {
      throw new Error("Token verifikasi tidak valid.");
    }
    if (!password || password.length < 8) {
      throw new Error("Kata sandi minimal 8 karakter.");
    }

    // 1. Cari token verifikasi di database
    const identifierKey = `reset-password:${token}`;
    const tokens = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, identifierKey));

    if (!tokens.length) {
      throw new Error("Token verifikasi tidak ditemukan atau sudah pernah digunakan.");
    }

    const tokenRecord = tokens[0];
    if (tokenRecord.expiresAt < new Date()) {
      throw new Error("Token verifikasi telah kedaluwarsa. Silakan minta tautan baru kepada Admin.");
    }

    const userId = tokenRecord.value;

    // 2. Gunakan Better Auth resetPassword API untuk meng-update kata sandi secara aman
    await auth.api.resetPassword({
      body: {
        token,
        newPassword: password,
      },
    });

    // 3. Set status emailVerified menjadi true
    await db
      .update(user)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(user.id, userId));

    return { message: "Email berhasil diverifikasi dan kata sandi telah diperbarui!" };
  }

  async updateRole(id: string, role: string) {
    const result = await db
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, id));
    return result[0];
  }

  async delete(id: string) {
    const result = await db.delete(user).where(eq(user.id, id));
    return result[0];
  }
}

export const usersService = new UsersService();
