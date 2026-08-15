import { Request, Response } from "express";
import { ziswafService } from "../services/ziswaf.service.js";
import { getSocketIO } from "../lib/socket.js";

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
    const result = await ziswafService.create(req.body);
    getSocketIO().emit("dataUpdate", { entity: "ziswaf" });
    res.status(201).json({ message: "Data ZISWAF berhasil ditambahkan", data: result });
  },

  async update(req: Request, res: Response) {
    const result = await ziswafService.update(req.params.id as string, req.body);
    if (!result) {
      res.status(404).json({ message: "Data ZISWAF tidak ditemukan" });
      return;
    }
    getSocketIO().emit("dataUpdate", { entity: "ziswaf" });
    res.json({ message: "Data ZISWAF berhasil diupdate", data: result });
  },

  async remove(req: Request, res: Response) {
    await ziswafService.remove(req.params.id as string);
    getSocketIO().emit("dataUpdate", { entity: "ziswaf" });
    res.json({ message: "Data ZISWAF berhasil dihapus" });
  }
};
