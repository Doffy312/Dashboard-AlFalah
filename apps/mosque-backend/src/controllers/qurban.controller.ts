import { Request, Response } from "express";
import { qurbanService } from "../services/qurban.service.js";

export const qurbanController = {
  async getAll(req: Request, res: Response) {
    const records = await qurbanService.findAll();
    res.json(records);
  },

  async getById(req: Request, res: Response) {
    const record = await qurbanService.findById(req.params.id as string);
    if (!record) return res.status(404).json({ message: "Data Qurban tidak ditemukan" });
    res.json(record);
  },

  async create(req: Request, res: Response) {
    await qurbanService.create(req.body);
    res.status(201).json({ message: "Data Qurban berhasil ditambahkan" });
  },

  async update(req: Request, res: Response) {
    await qurbanService.update(req.params.id as string, req.body);
    res.json({ message: "Data Qurban berhasil diupdate" });
  },

  async remove(req: Request, res: Response) {
    await qurbanService.remove(req.params.id as string);
    res.json({ message: "Data Qurban berhasil dihapus" });
  }
};
