import { Request, Response } from "express";
import { settingsService } from "../services/settings.service.js";

export const settingsController = {
  async getAll(req: Request, res: Response) {
    try {
      const data = await settingsService.getAll();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Gagal mengambil pengaturan" });
    }
  },

  async getByKey(req: Request, res: Response) {
    try {
      const key = req.params.key as string;
      const data = await settingsService.getByKey(key);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Gagal mengambil pengaturan" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const key = req.params.key as string;
      const value = req.body;
      const updated = await settingsService.update(key, value);
      res.json({ message: "Pengaturan berhasil diperbarui", data: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Gagal mengupdate pengaturan" });
    }
  }

};
