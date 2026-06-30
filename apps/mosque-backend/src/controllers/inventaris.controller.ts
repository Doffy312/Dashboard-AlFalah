import type { Request, Response } from "express";
import { inventarisService } from "../services/inventaris.service.js";
import { getSocketIO } from "../lib/socket.js";

export class InventarisController {
  async findAll(req: Request, res: Response) {
    try {
      const { search, condition, location } = req.query;
      const result = await inventarisService.findAll({
        search: search as string,
        condition: condition as string,
        location: location as string,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventaris" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await inventarisService.findById(id);
      if (!result) {
        res.status(404).json({ error: "Inventaris not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventaris" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await inventarisService.create(req.body, req.user!.id);
      getSocketIO().emit("dataUpdate", { entity: "inventaris" });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create inventaris" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await inventarisService.update(id, req.body);
      if (!result) {
        res.status(404).json({ error: "Inventaris not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "inventaris" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventaris" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await inventarisService.delete(id);
      if (!result) {
        res.status(404).json({ error: "Inventaris not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "inventaris" });
      res.json({ message: "Inventaris deleted", data: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inventaris" });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const result = await inventarisService.getSummary();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventaris summary" });
    }
  }
}

export const inventarisController = new InventarisController();
