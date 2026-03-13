// Shared API base used across all frontend modules.
// Falls back to localhost in development; set VITE_API_BASE_URL in production.
export const API_BASE: string =
  (typeof import.meta !== "undefined" && (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL) ??
  "http://localhost:4000";
