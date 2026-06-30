import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";

export class DashboardController {
  async getSummary(_req: Request, res: Response) {
    try {
      const result = await dashboardService.getSummary();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  }

  async getCashflow(req: Request, res: Response) {
    try {
      const year = req.query.year
        ? Number(req.query.year)
        : new Date().getFullYear();
      const result = await dashboardService.getCashflow(year);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cashflow data" });
    }
  }

  async getAllocation(_req: Request, res: Response) {
    try {
      const result = await dashboardService.getAllocation();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch allocation data" });
    }
  }

  async getRecentActivity(_req: Request, res: Response) {
    try {
      const result = await dashboardService.getRecentActivity();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  }

  async getUpcomingPrograms(_req: Request, res: Response) {
    try {
      const result = await dashboardService.getUpcomingPrograms();
      res.json(result);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to fetch upcoming programs" });
    }
  }
}

export const dashboardController = new DashboardController();
