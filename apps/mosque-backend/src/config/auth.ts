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
    const frontendOrigin = new URL(env.FRONTEND_URL).origin;
    const backendOrigin = new URL(env.BETTER_AUTH_URL).origin;
    return frontendOrigin !== backendOrigin;
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
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
});

