import { Request, Response } from "express";
import { qurbanService } from "../services/qurban.service.js";

export const qurbanController = {
  async getSummary(req: Request, res: Response) {
    const year = typeof req.query.year === "string" ? req.query.year : undefined;
    const summary = await qurbanService.getSummaryStats(year);
    res.json(summary);
  },

  async getAllTahun(_req: Request, res: Response) {
    const tahunList = await qurbanService.getAllTahun();
    res.json(tahunList);
  },

  async createTahun(req: Request, res: Response) {
    const { tahun, statusAktif } = req.body;
    const newTahun = await qurbanService.createTahun(Number(tahun), statusAktif);
    res.status(201).json(newTahun);
  },

  async getKelompok(req: Request, res: Response) {
    const qurbanTahunId = typeof req.query.qurbanTahunId === "string" ? req.query.qurbanTahunId : undefined;
    if (!qurbanTahunId) {
      res.status(400).json({ message: "qurbanTahunId wajib diisi" });
      return;
    }
    const kelompok = await qurbanService.getKelompokByTahun(qurbanTahunId);
    res.json(kelompok);
  },

  async createKelompok(req: Request, res: Response) {
    const kelompok = await qurbanService.createKelompok(req.body);
    res.status(201).json(kelompok);
  },

  async deleteKelompok(req: Request, res: Response) {
    const id = req.params.id as string;
    await qurbanService.deleteKelompok(id);
    res.json({ message: "Kelompok berhasil dihapus" });
  },

  async getAll(req: Request, res: Response) {
    const filters = {
      qurbanTahunId: typeof req.query.qurbanTahunId === "string" ? req.query.qurbanTahunId : undefined,
      tahun: req.query.tahun ? Number(req.query.tahun) : undefined,
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      jenisHewan: typeof req.query.jenisHewan === "string" ? req.query.jenisHewan : undefined,
    };
    const pequrbanList = await qurbanService.getAllPequrban(filters);
    res.json(pequrbanList);
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const item = await qurbanService.getPequrbanById(id);
    if (!item) {
      res.status(404).json({ message: "Data pequrban tidak ditemukan" });
      return;
    }
    res.json(item);
  },

  async create(req: Request, res: Response) {
    try {
      const created = await qurbanService.createPequrban(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Gagal menambahkan pequrban" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const updated = await qurbanService.updatePequrban(id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Gagal memperbarui pequrban" });
    }
  },

  async remove(req: Request, res: Response) {
    const id = req.params.id as string;
    await qurbanService.removePequrban(id);
    res.json({ message: "Data pequrban berhasil dihapus" });
  },
};
