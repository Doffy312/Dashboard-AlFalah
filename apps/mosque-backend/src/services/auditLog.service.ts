import { db } from "../config/db.js";
import { auditLog } from "../db/schema/auditLogs.js";
import { desc, eq, like, and, sql } from "drizzle-orm";
import type { Request } from "express";

export interface LogActivityParams {
  userId?: string | null;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any> | string | null;
  req?: Request;
}

export class AuditLogService {
  /**
   * Encapsulated Non-Blocking Audit Logger.
   * Dipanggil setiap kali ada aktivitas penting (create, update, delete, auth).
   * Berjalan secara latar belakang tanpa menghambat respon HTTP ke user.
   */
  async logActivity(params: LogActivityParams): Promise<void> {
    try {
      let ipAddress: string | undefined = undefined;
      let userAgent: string | undefined = undefined;

      if (params.req) {
        ipAddress =
          (params.req.headers["x-forwarded-for"] as string) ||
          params.req.socket.remoteAddress ||
          undefined;
        userAgent = params.req.headers["user-agent"];
      }

      let formattedDetails: string | null = null;
      if (params.details) {
        formattedDetails =
          typeof params.details === "object"
            ? JSON.stringify(params.details)
            : String(params.details);
      }

      await db.insert(auditLog).values({
        userId: params.userId || null,
        userName: params.userName || "System",
        userRole: params.userRole || "system",
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: formattedDetails,
        ipAddress: ipAddress || null,
        userAgent: userAgent ? userAgent.substring(0, 255) : null,
      });
    } catch (error) {
      console.error("⚠️ AuditLogService failed to write log:", error);
    }
  }

  /**
   * Mengambil daftar audit log dengan pagination dan pencarian.
   */
  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    search?: string;
    entity?: string;
    action?: string;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.search) {
      conditions.push(
        sql`(${auditLog.userName} LIKE ${`%${options.search}%`} OR ${auditLog.action} LIKE ${`%${options.search}%`} OR ${auditLog.entity} LIKE ${`%${options.search}%`})`
      );
    }

    if (options.entity) {
      conditions.push(eq(auditLog.entity, options.entity));
    }

    if (options.action) {
      conditions.push(eq(auditLog.action, options.action));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select()
      .from(auditLog)
      .where(whereClause)
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLog)
      .where(whereClause);

    const total = Number(totalCountResult?.count || 0);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditLogService = new AuditLogService();
