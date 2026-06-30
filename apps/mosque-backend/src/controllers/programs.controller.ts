import type { Request, Response } from "express";
import { programService } from "../services/programs.service.js";
import { getSocketIO } from "../lib/socket.js";

export class ProgramController {
  async findAll(req: Request, res: Response) {
    try {
      const { search, status } = req.query;
      const result = await programService.findAll({
        search: search as string,
        status: status as string,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await programService.findById(id);
      if (!result) {
        res.status(404).json({ error: "Program not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch program" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const result = await programService.create(req.body, req.user!.id);
      getSocketIO().emit("dataUpdate", { entity: "programs" });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create program" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await programService.update(id, req.body);
      if (!result) {
        res.status(404).json({ error: "Program not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "programs" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update program" });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ error: "Status is required" });
        return;
      }
      const id = req.params.id as string;
      const result = await programService.updateStatus(id, status);
      if (!result) {
        res.status(404).json({ error: "Program not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "programs" });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update program status" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await programService.delete(id);
      if (!result) {
        res.status(404).json({ error: "Program not found" });
        return;
      }
      getSocketIO().emit("dataUpdate", { entity: "programs" });
      res.json({ message: "Program deleted", data: result });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete program" });
    }
  }

  async getSummary(req: Request, res: Response) {
    try {
      const result = await programService.getSummary();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch program summary" });
    }
  }
}

export const programController = new ProgramController();
