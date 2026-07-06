import { API_BASE } from "../config";

const VISITOR_ID_KEY = "va_visitor_id";
const SESSION_ID_KEY = "va_session_id";

function getOrCreateId(storage: Storage, key: string): string {
  let id = storage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    storage.setItem(key, id);
  }
  return id;
}

export function trackPageView(pathname: string): void {
  if (typeof window === "undefined" || pathname.startsWith("/admin")) return;

  try {
    const visitorId = getOrCreateId(window.localStorage, VISITOR_ID_KEY);
    const sessionId = getOrCreateId(window.sessionStorage, SESSION_ID_KEY);
    const token = window.localStorage.getItem("authToken");

    void fetch(`${API_BASE}/api/analytics/track`, {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        path: pathname,
        visitorId,
        sessionId,
        referrer: document.referrer || undefined,
      }),
    }).catch(() => {});
  } catch {
    // never let tracking break navigation
  }
}
