import { Request, Response } from "express";
import { jadwalService } from "../services/jadwal.service.js";

export const jadwalController = {
  async getAll(req: Request, res: Response) {
    const records = await jadwalService.findAll();
    res.json(records);
  },

  async getById(req: Request, res: Response) {
    const record = await jadwalService.findById(req.params.id as string);
    if (!record) return res.status(404).json({ message: "Data Jadwal tidak ditemukan" });
    res.json(record);
  },

  async create(req: Request, res: Response) {
    await jadwalService.create(req.body);
    res.status(201).json({ message: "Data Jadwal berhasil ditambahkan" });
  },

  async update(req: Request, res: Response) {
    await jadwalService.update(req.params.id as string, req.body);
    res.json({ message: "Data Jadwal berhasil diupdate" });
  },

  async remove(req: Request, res: Response) {
    await jadwalService.remove(req.params.id as string);
    res.json({ message: "Data Jadwal berhasil dihapus" });
  }
};
