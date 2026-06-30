import type { Request, Response } from "express";
import { jemaahService } from "../services/jemaah.service.js";
import { getSocketIO } from "../lib/socket.js";

export class JemaahController {
  async findAll(req: Request, res: Response) {
    try {
      const { search, category } = req.query;
      const result = await jemaahService.findAll({
        search: search as string,
        category: category as string,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jemaah" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await jemaahService.findById(id);
      if (!result) {
        res.status(404).json({ error: "Jemaah not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jemaah" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await jemaahService.create(req.body, req.user!.id);
      getSocketIO().emit("dataUpdate", { entity: "jemaah" });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create jemaah" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await jemaahService.update(id, req.body);
      if (!result) {
        res.status(404).json({ error: "Jemaah not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "jemaah" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update jemaah" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await jemaahService.delete(id);
      if (!result) {
        res.status(404).json({ error: "Jemaah not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "jemaah" });
      res.json({ message: "Jemaah deleted", data: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete jemaah" });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const result = await jemaahService.getSummary();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jemaah summary" });
    }
  }
}

export const jemaahController = new JemaahController();
