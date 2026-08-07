import { Request, Response } from "express";
import { ziswafService } from "../services/ziswaf.service.js";

export const ziswafController = {
  async getAll(req: Request, res: Response) {
    const records = await ziswafService.findAll();
    res.json(records);
  },

  async getById(req: Request, res: Response) {
    const record = await ziswafService.findById(req.params.id as string);
    if (!record) return res.status(404).json({ message: "Data ZISWAF tidak ditemukan" });
    res.json(record);
  },

  async create(req: Request, res: Response) {
    await ziswafService.create(req.body);
    res.status(201).json({ message: "Data ZISWAF berhasil ditambahkan" });
  },

  async update(req: Request, res: Response) {
    await ziswafService.update(req.params.id as string, req.body);
    res.json({ message: "Data ZISWAF berhasil diupdate" });
  },

  async remove(req: Request, res: Response) {
    await ziswafService.remove(req.params.id as string);
    res.json({ message: "Data ZISWAF berhasil dihapus" });
  }
};
