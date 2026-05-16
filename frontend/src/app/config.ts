// Shared API base used across all frontend modules.
// In production set VITE_API_BASE_URL (e.g. https://reservehousing.com).
// Falls back to window.location.origin so the frontend always points at the
// same host it was served from, which works behind any reverse proxy.
const _viteBase = (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env
  ?.VITE_API_BASE_URL;

export const API_BASE: string =
  _viteBase && _viteBase.trim().length > 0
    ? _viteBase.trim()
    : typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:4000";
