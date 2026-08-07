import type { Request, Response } from "express";
import { programService } from "../services/programs.service.js";
import { getSocketIO } from "../lib/socket.js";
import { calendarService } from "../services/calendar.service.js";

export class ProgramController {
  async findAll(req: Request, res: Response) {
    const { search, status } = req.query;
    const result = await programService.findAll({
      search: search as string,
      status: status as string,
    });
    res.json(result);
  }

  async findById(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await programService.findById(id);
    if (!result) {
      res.status(404).json({ error: "Program not found" });
      return;
    }
    res.json(result);
  }

  async create(req: Request, res: Response) {
    const result = await programService.create(req.body, req.user!.id);
    getSocketIO().emit("dataUpdate", { entity: "programs" });
    getSocketIO().emit("dataUpdate", { entity: "transactions" });
    res.status(201).json(result);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await programService.update(id, req.body);
    if (!result) {
      res.status(404).json({ error: "Program not found" });
      return;
    }
    getSocketIO().emit("dataUpdate", { entity: "programs" });
    getSocketIO().emit("dataUpdate", { entity: "transactions" });
    res.json(result);
  }

  async updateStatus(req: Request, res: Response) {
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
    getSocketIO().emit("dataUpdate", { entity: "transactions" });
    res.json(result);
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await programService.delete(id);
    if (!result) {
      res.status(404).json({ error: "Program not found" });
      return;
    }
    getSocketIO().emit("dataUpdate", { entity: "programs" });
    getSocketIO().emit("dataUpdate", { entity: "transactions" });
    res.json({ message: "Program deleted", data: result });
  }

  async getSummary(req: Request, res: Response) {
    const result = await programService.getSummary();
    res.json(result);
  }

  async completeProgram(req: Request, res: Response) {
    const id = req.params.id as string;
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let reportDocUrl: string | null = null;
    let documentationUrls: string[] = [];

    if (files?.report && files.report.length > 0) {
      reportDocUrl = `/uploads/${files.report[0].filename}`;
    }

    if (files?.photos && files.photos.length > 0) {
      documentationUrls = files.photos.map(file => `/uploads/${file.filename}`);
    }

    const result = await programService.completeProgram(id, reportDocUrl, documentationUrls);
    if (!result) {
      res.status(404).json({ error: "Program not found" });
      return;
    }
    
    getSocketIO().emit("dataUpdate", { entity: "programs" });
    getSocketIO().emit("dataUpdate", { entity: "transactions" });
    res.json(result);
  }

  async getFeed(req: Request, res: Response) {
    const programs = await programService.findAll();
    const icsData = await calendarService.createProgramsFeed(programs);
    
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="programs-feed.ics"');
    res.send(icsData);
  }
}

export const programController = new ProgramController();
