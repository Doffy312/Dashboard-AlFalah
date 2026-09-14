import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";
import { env, getCorsOrigins } from "./env.js";
import * as schema from "../db/schema/index.js";

// ─── Cross-Domain Cookie Detection ──────────────────────────────────
// When frontend (e.g. Vercel) and backend (e.g. Railway) are on
// different domains, session cookies MUST use SameSite=None + Secure.
// Otherwise browsers silently block cookies on cross-origin fetch(),
// breaking all authentication flows.
function isCrossDomainDeployment(): boolean {
  try {
    // If deployed on cloud (Railway, Render, Vercel, etc.) or backend URL is HTTPS, enable SameSite=None + Secure
    // so any cross-origin frontend (Vercel, custom domain) can set and send session cookies
    if (
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      process.env.VERCEL ||
      process.env.RENDER ||
      env.NODE_ENV === "production" ||
      env.BETTER_AUTH_URL.startsWith("https://") ||
      (env.FRONTEND_URL && !env.FRONTEND_URL.includes("localhost") && !env.FRONTEND_URL.includes("127.0.0.1"))
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

const crossDomain = isCrossDomainDeployment();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 30 * 60, // 30 minutes per PRD requirement
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "Ketua",
        input: true,
      },
    },
  },
  trustedOrigins: (request) => {
    const reqOrigin = request?.headers?.get?.("origin") || request?.headers?.get?.("referer");
    return getCorsOrigins(reqOrigin || undefined);
  },
  // ─── Cross-Domain Cookie Attributes ─────────────────────────────
  // Applied only when frontend and backend origins differ (e.g.
  // mosque-dashboard.vercel.app ↔ mosque-backend.up.railway.app)
  ...(crossDomain
    ? {
        advanced: {
          useSecureCookies: true,
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
            partitioned: true,
          },
        },
      }
    : {}),
});

