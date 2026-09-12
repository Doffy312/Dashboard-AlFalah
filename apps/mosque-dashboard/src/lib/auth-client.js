import { createAuthClient } from "better-auth/react";

function getAuthBaseUrl() {
  const rawApiUrl = import.meta.env.VITE_API_URL;
  if (rawApiUrl) {
    try {
      // Better Auth baseURL requires the server origin (e.g. https://api.masjid.org)
      return new URL(rawApiUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173').origin;
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
