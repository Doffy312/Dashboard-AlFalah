import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Load .env from current directory and fallback to apps/mosque-backend/.env for monorepo root runs
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "apps/mosque-backend/.env") });

const defaultAuthUrl = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : (process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3000");

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url().default(defaultAuthUrl),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  CORS_ORIGINS: z.string().optional(), // Comma-separated extra origins, e.g. "http://192.168.1.87:5173,https://staging.example.com"
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional().default("Takmir Masjid <noreply@masjid.local>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

/**
 * Helper to check if an origin is a local network address (LAN / localhost).
 */
export function isLocalNetworkOrigin(originStr?: string): boolean {
  if (!originStr) return false;
  try {
    const url = new URL(originStr);
    const hostname = url.hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
}

/**
 * Returns the list of allowed CORS origins.
 * Combines FRONTEND_URL with any extra origins from CORS_ORIGINS env var,
 * plus local network origins during development.
 */
export function getCorsOrigins(requestOrigin?: string): string[] {
  const origins = [
    env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
  ];
  if (env.CORS_ORIGINS) {
    const extras = env.CORS_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
    origins.push(...extras);
  }
  if (requestOrigin) {
    try {
      const parsedUrl = new URL(requestOrigin);
      const cleanOrigin = parsedUrl.origin;
      const hostname = parsedUrl.hostname;
      let isAllowedVercelDomain = false;
      if (env.FRONTEND_URL && env.FRONTEND_URL.includes(".vercel.app")) {
        try {
          const frontendHost = new URL(env.FRONTEND_URL).hostname;
          const projectName = frontendHost.split(".")[0];
          // Allow exact frontend domain or legitimate project preview deployments (e.g. mosque-dashboard-git-main-xxx.vercel.app)
          if (
            hostname === frontendHost ||
            (projectName && hostname.startsWith(`${projectName}-`) && hostname.endsWith(".vercel.app"))
          ) {
            isAllowedVercelDomain = true;
          }
        } catch {}
      } else if (hostname.endsWith(".vercel.app") && env.NODE_ENV === "development") {
        isAllowedVercelDomain = true;
      }

      if (
        isAllowedVercelDomain ||
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        env.NODE_ENV === "development" ||
        isLocalNetworkOrigin(cleanOrigin)
      ) {
        if (!origins.includes(cleanOrigin)) {
          origins.push(cleanOrigin);
        }
      }
    } catch {}
  }
  return origins;
}
