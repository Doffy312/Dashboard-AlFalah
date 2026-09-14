import { createAuthClient } from "better-auth/react";

export function getAuthBaseUrl() {
  const rawApiUrl = import.meta.env.VITE_API_URL;
  if (rawApiUrl) {
    try {
      let trimmed = rawApiUrl.trim();
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
        trimmed = `https://${trimmed}`;
      }
      // Better Auth baseURL requires the server origin (e.g. https://api.masjid.org)
      return new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173').origin;
    } catch {
      // Fallback if URL parsing fails
    }
  }
  return typeof window !== 'undefined' ? window.location.origin : "http://localhost:5173";
}

// better-auth requires an absolute URL for baseURL
export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
});
