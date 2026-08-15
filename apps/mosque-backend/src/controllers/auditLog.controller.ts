import type { Request, Response } from "express";
import { auditLogService } from "../services/auditLog.service.js";

export class AuditLogController {
  async findAll(req: Request, res: Response) {
    try {
      const { page, limit, search, entity, action } = req.query;
      const result = await auditLogService.getAuditLogs({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        entity: entity as string,
        action: action as string,
      });
      res.json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message || "Failed to fetch audit logs",
      });
    }
  }
}

export const auditLogController = new AuditLogController();
