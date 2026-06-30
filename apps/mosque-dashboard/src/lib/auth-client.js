import { createAuthClient } from "better-auth/react";

// better-auth requires an absolute URL for baseURL
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : "http://localhost:5173", 
});
