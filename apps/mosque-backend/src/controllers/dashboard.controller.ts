import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";

export class DashboardController {
  async getSummary(_req: Request, res: Response) {
    const result = await dashboardService.getSummary();
    res.json(result);
  }

  async getCashflow(req: Request, res: Response) {
    const year = req.query.year
      ? Number(req.query.year)
      : new Date().getFullYear();
    const result = await dashboardService.getCashflow(year);
    res.json(result);
  }

  async getAllocation(req: Request, res: Response) {
    const type = (req.query.type as string) || "Pengeluaran";
    const result = await dashboardService.getAllocation(type);
    res.json(result);
  }

  async getRecentActivity(_req: Request, res: Response) {
    const result = await dashboardService.getRecentActivity();
    res.json(result);
  }

  async getUpcomingPrograms(_req: Request, res: Response) {
    const result = await dashboardService.getUpcomingPrograms();
    res.json(result);
  }

  async getCompletedPrograms(_req: Request, res: Response) {
    const result = await dashboardService.getCompletedPrograms();
    res.json(result);
  }
}

export const dashboardController = new DashboardController();
