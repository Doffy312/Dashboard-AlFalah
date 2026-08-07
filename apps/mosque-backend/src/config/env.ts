import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
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
 * Returns the list of allowed CORS origins.
 * Combines FRONTEND_URL with any extra origins from CORS_ORIGINS env var.
 */
export function getCorsOrigins(): string[] {
  const origins = [env.FRONTEND_URL];
  if (env.CORS_ORIGINS) {
    const extras = env.CORS_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
    origins.push(...extras);
  }
  return origins;
}
