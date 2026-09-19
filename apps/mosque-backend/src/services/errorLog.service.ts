import { db } from "../config/db.js";
import { errorLogs } from "../db/schema/errorLogs.js";
import { lt } from "drizzle-orm";
import type { Request } from "express";
import cron from "node-cron";

export interface LogErrorParams {
  level?: "ERROR" | "FATAL" | "WARN";
  source?: "BACKEND" | "FRONTEND";
  requestId?: string;
  error: Error | { name?: string; message: string; stack?: string; code?: string };
  httpStatusCode?: number;
  req?: Request;
  userId?: string | null;
  userRole?: string;
  context?: Record<string, any> | string;
}

const SENSITIVE_KEYS = [
  "password",
  "token",
  "authorization",
  "secret",
  "cookie",
  "pin",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "creditcard",
];

/**
 * Masking rekursif untuk menyensor kredensial sensitif dari log
 */
export function maskSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
      key.toLowerCase().includes(sensitiveKey)
    );

    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = maskSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export class ErrorLogService {
  /**
   * Non-Blocking Error Logger.
   * Mencatat error ke DB MySQL dan mencetak structured JSON log ke console/stdout.
   * Didesain agar tidak pernah melempar exception ke pemanggil.
   */
  async logError(params: LogErrorParams): Promise<void> {
    try {
      const level = params.level || "ERROR";
      const source = params.source || "BACKEND";
      const errorObj = params.error;
      const errorName = (errorObj.name || "Error").substring(0, 150);
      const errorMessage = errorObj.message || "Unknown error occurred";
      const errorCode = (errorObj as any).code
        ? String((errorObj as any).code).substring(0, 50)
        : null;
      const stackTrace = errorObj.stack || null;

      let httpMethod: string | undefined = undefined;
      let httpUrl: string | undefined = undefined;
      let ipAddress: string | undefined = undefined;
      let userAgent: string | undefined = undefined;
      let requestId: string | undefined = params.requestId;
      let userId: string | null = params.userId || null;
      let userRole: string | undefined = params.userRole;

      if (params.req) {
        httpMethod = params.req.method?.substring(0, 10);
        httpUrl = params.req.originalUrl?.substring(0, 500) || params.req.url?.substring(0, 500);
        ipAddress =
          (params.req.headers["x-forwarded-for"] as string) ||
          params.req.socket?.remoteAddress ||
          undefined;
        userAgent = params.req.headers["user-agent"]?.substring(0, 255);
        if (!requestId && (params.req as any).id) {
          requestId = (params.req as any).id;
        }
        if (!userId && (params.req as any).user?.id) {
          userId = (params.req as any).user.id;
        }
        if (!userRole && (params.req as any).user?.role) {
          userRole = (params.req as any).user.role;
        }
      }

      // Format & sanitize context data
      let contextPayload: any = null;
      if (params.context) {
        contextPayload = maskSensitiveData(params.context);
      } else if (params.req) {
        contextPayload = maskSensitiveData({
          query: params.req.query,
          params: params.req.params,
          body: params.req.body,
        });
      }

      const formattedContext = contextPayload
        ? typeof contextPayload === "string"
          ? contextPayload
          : JSON.stringify(contextPayload)
        : null;

      // 1. Structured JSON output ke stdout (Railway/Docker log reader)
      const structuredLog = {
        timestamp: new Date().toISOString(),
        level,
        source,
        requestId,
        error: {
          name: errorName,
          message: errorMessage,
          code: errorCode,
        },
        http: {
          method: httpMethod,
          url: httpUrl,
          statusCode: params.httpStatusCode,
        },
        user: {
          id: userId,
          role: userRole,
        },
      };

      if (level === "FATAL" || level === "ERROR") {
        console.error(`🚨 [SYSTEM_${level}]`, JSON.stringify(structuredLog));
        if (stackTrace && process.env.NODE_ENV !== "production") {
          console.error(stackTrace);
        }
      } else {
        console.warn(`⚠️ [SYSTEM_${level}]`, JSON.stringify(structuredLog));
      }

      // 2. Simpan ke database error_logs secara non-blocking
      await db.insert(errorLogs).values({
        level,
        source,
        requestId: requestId || null,
        errorName,
        errorMessage,
        errorCode,
        stackTrace: stackTrace ? stackTrace.substring(0, 10000) : null,
        httpMethod: httpMethod || null,
        httpUrl: httpUrl || null,
        httpStatusCode: params.httpStatusCode || 500,
        userId: userId || null,
        userRole: userRole || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        contextData: formattedContext,
        isResolved: 0,
      });
    } catch (dbError) {
      // Logger tidak boleh mematikan alur utama jika DB bermasalah
      console.error("⚠️ ErrorLogService failed to write to database:", dbError);
    }
  }

  /**
   * Menghapus log error yang lebih tua dari batas hari (default: 30 hari)
   */
  async cleanOldLogs(retentionDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      await db.delete(errorLogs).where(lt(errorLogs.createdAt, cutoffDate));
      console.log(`🧹 [Retention] Cleaned error logs older than ${retentionDays} days (before ${cutoffDate.toISOString()})`);
      return 1;
    } catch (error) {
      console.error("⚠️ Failed to clean old error logs:", error);
      return 0;
    }
  }

  /**
   * Menginisialisasi cron job retensi log error harian pukul 03:00 pagi
   */
  initRetentionCron(retentionDays: number = 30): void {
    cron.schedule("0 3 * * *", async () => {
      console.log("🕒 [Cron] Memulai pembersihan log error kadaluwarsa...");
      await this.cleanOldLogs(retentionDays);
    });
    console.log(`✅ ErrorLog retention cron initialized (Daily at 03:00 AM, retention: ${retentionDays} days)`);
  }
}

export const errorLogService = new ErrorLogService();
