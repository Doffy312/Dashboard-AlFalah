import { Request, Response } from "express";
import { ziswafService } from "../services/ziswaf.service.js";
import { getSocketIO } from "../lib/socket.js";

export const ziswafController = {
  async getAll(req: Request, res: Response) {
    const { limit, status } = req.query;
    const records = await ziswafService.findAll({
      limit: limit ? Number(limit) : undefined,
      status: status ? String(status) : undefined,
    });
    res.json(records);
  },

  async getById(req: Request, res: Response) {
    const record = await ziswafService.findById(req.params.id as string);
    if (!record) return res.status(404).json({ message: "Data ZISWAF tidak ditemukan" });
    res.json(record);
  },

  async create(req: Request, res: Response) {
    const result = await ziswafService.create(req.body);
    try {
      getSocketIO().emit("dataUpdate", { entity: "ziswaf" });
    } catch (e) {}
    res.status(201).json({ message: "Data ZISWAF berhasil ditambahkan", data: result });
  },

  async update(req: Request, res: Response) {
    const result = await ziswafService.update(req.params.id as string, req.body);
    if (!result) {
      res.status(404).json({ message: "Data ZISWAF tidak ditemukan" });
      return;
    }
    try {
      getSocketIO().emit("dataUpdate", { entity: "ziswaf" });
    } catch (e) {}
    res.json({ message: "Data ZISWAF berhasil diupdate", data: result });
  },

  async remove(req: Request, res: Response) {
    await ziswafService.remove(req.params.id as string);
    try {
      const io = getSocketIO();
      io.emit("dataUpdate", { entity: "ziswaf" });
      io.emit("dataUpdate", { entity: "transactions" });
    } catch (e) {}
    res.json({ message: "Data ZISWAF berhasil dihapus" });
  },

  async verify(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).session?.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Pengguna tidak terautentikasi" });
      return;
    }
    const result = await ziswafService.verifyDonation(req.params.id as string, userId);

    try {
      const io = getSocketIO();
      io.emit("dataUpdate", { entity: "ziswaf" });
      io.emit("dataUpdate", { entity: "transactions" });
      io.emit("notificationUpdated");
    } catch (e) {}

    res.json({ message: "Donasi ZISWAF berhasil diverifikasi dan dibukukan ke Kas", data: result });
  },

  async reject(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).session?.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Pengguna tidak terautentikasi" });
      return;
    }
    const { reason } = req.body || {};
    const result = await ziswafService.rejectDonation(req.params.id as string, userId, reason);

    try {
      const io = getSocketIO();
      io.emit("dataUpdate", { entity: "ziswaf" });
      io.emit("dataUpdate", { entity: "transactions" });
      io.emit("notificationUpdated");
    } catch (e) {}

    res.json({ message: "Transaksi donasi berhasil ditandai ditolak/fiktif", data: result });
  }
};

