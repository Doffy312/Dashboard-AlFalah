import type { Request, Response } from "express";
import { usersService } from "../services/users.service.js";

export class UsersController {
  async findAll(req: Request, res: Response) {
    try {
      const result = await usersService.findAll();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Gagal mengambil data pengguna" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await usersService.create(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Gagal menambahkan pengguna" });
    }
  }

  async resendVerification(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await usersService.resendVerification(id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Gagal mengirim ulang email verifikasi" });
    }
  }

  async verifyAndSetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      const result = await usersService.verifyAndSetPassword({ token, password });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Gagal memverifikasi dan memperbarui kata sandi" });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ error: "Role is required" });
        return;
      }
      const result = await usersService.updateRole(id, role);
      res.json({ message: "User role updated successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Gagal memperbarui peran pengguna" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await usersService.delete(id);
      res.json({ message: "User deleted" });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Gagal menghapus pengguna" });
    }
  }
}

export const usersController = new UsersController();
