import crypto from "crypto";
import {
  mysqlTable,
  text,
  varchar,
  int,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

// ─── Error Log Table ──────────────────────────────────────────────────
// Mencatat setiap runtime crash/error di backend maupun client (frontend)
// untuk keperluan investigasi, audit kesehatan sistem, dan debugging.

export const errorLogs = mysqlTable(
  "error_logs",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Level & Sumber
    level: varchar("level", { length: 10 }).notNull().default("ERROR"), // 'ERROR' | 'FATAL' | 'WARN'
    source: varchar("source", { length: 15 }).notNull().default("BACKEND"), // 'BACKEND' | 'FRONTEND'

    // Tracing & Korelasi antar Request
    requestId: varchar("request_id", { length: 36 }),

    // Detail Error
    errorName: varchar("error_name", { length: 150 }).notNull(),
    errorMessage: text("error_message").notNull(),
    errorCode: varchar("error_code", { length: 50 }),
    stackTrace: text("stack_trace"),

    // Konteks HTTP (Endpoint & Status)
    httpMethod: varchar("http_method", { length: 10 }),
    httpUrl: varchar("http_url", { length: 500 }),
    httpStatusCode: int("http_status_code"),

    // Konteks Pengguna & Akses (jika tersedia)
    userId: varchar("user_id", { length: 36 }),
    userRole: varchar("user_role", { length: 50 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 255 }),

    // Konteks Payload Tambahan (disanitasi & di-masking, JSON string)
    contextData: text("context_data"),

    // Status Resolusi (untuk tracking issue)
    isResolved: int("is_resolved").notNull().default(0), // 0: Open, 1: Resolved

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    createdAtIdx: index("error_log_created_at_idx").on(table.createdAt),
    levelIdx: index("error_log_level_idx").on(table.level),
    sourceIdx: index("error_log_source_idx").on(table.source),
    requestIdIdx: index("error_log_request_id_idx").on(table.requestId),
    statusCodeIdx: index("error_log_status_code_idx").on(table.httpStatusCode),
    userIdIdx: index("error_log_user_id_idx").on(table.userId),
  })
);
