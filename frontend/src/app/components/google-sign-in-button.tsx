import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-service";

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string; error?: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

function getGoogleAccountsId(): GoogleAccountsId | undefined {
  return (window as { google?: { accounts?: { id?: GoogleAccountsId } } }).google?.accounts?.id;
}

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google sign-in is only available in the browser"));
      return;
    }

    if (getGoogleAccountsId()) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          if (getGoogleAccountsId()) {
            resolve();
            return;
          }
          reject(new Error("Google sign-in script loaded but Google Identity is unavailable"));
        },
        { once: true }
      );
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google SDK")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (getGoogleAccountsId()) {
        resolve();
        return;
      }
      reject(new Error("Google sign-in script loaded but Google Identity is unavailable"));
    };
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });
}

interface GoogleSignInButtonProps {
  label: string;
  loadingLabel?: string;
  onCredential: (credential: string) => Promise<void>;
  onError: (message: string) => void;
}

// Renders our own branded button for visuals, with Google's real, official
// button rendered invisibly on top of it so the user's actual tap lands on
// Google's iframe. Google's One Tap `prompt()` API is unreliable on mobile
// browsers (blocked by third-party-cookie/FedCM restrictions, in-app
// WebViews, and its own cooldown after a dismissed prompt) and can hang
// indefinitely with no callback ever firing; renderButton's popup flow works
// consistently across desktop and mobile because it is a real, Google-hosted
// click target rather than a passive prompt.
export function GoogleSignInButton({ label, loadingLabel, onCredential, onError }: GoogleSignInButtonProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // GIS is only initialized once (below); these refs let the one-time
  // callback always call the latest handlers instead of closing over
  // whatever onCredential/onError were on the render that mounted it.
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          throw new Error("Google sign-in is not configured");
        }

        await loadGoogleIdentityScript();
        if (cancelled) return;

        const googleIdentity = getGoogleAccountsId();
        if (!googleIdentity || !overlayRef.current) {
          throw new Error("Google sign-in is unavailable right now");
        }

        googleIdentity.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.error) {
              onErrorRef.current(response.error);
              return;
            }
            if (!response.credential) {
              onErrorRef.current("No Google credential received");
              return;
            }

            setIsLoading(true);
            onCredentialRef
              .current(response.credential)
              .catch((err) => {
                onErrorRef.current(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
              })
              .finally(() => setIsLoading(false));
          },
        });

        const width = Math.min(400, Math.max(240, Math.round(wrapperRef.current?.clientWidth ?? 320)));
        googleIdentity.renderButton(overlayRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width,
        });

        if (!cancelled) setIsReady(true);
      } catch (err) {
        if (!cancelled) {
          onError(err instanceof Error ? err.message : "Google sign-in is unavailable right now");
        }
      }
    }

    setup();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once; onCredential/onError are stable enough for this one-time GIS setup
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled
        className="pointer-events-none w-full rounded-[14px] flex items-center justify-center gap-[12px] border border-[rgba(0,0,0,0.16)] py-[12px] text-neutral-black text-[14px] font-semibold"
      >
        <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20">
          <path
            d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
            fill="#4285F4"
          />
          <path
            d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
            fill="#34A853"
          />
          <path
            d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
            fill="#FBBC05"
          />
          <path
            d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
            fill="#EA4335"
          />
        </svg>
        {isLoading ? (loadingLabel ?? "Connecting to Google...") : label}
      </button>
      <div
        ref={overlayRef}
        className={`absolute inset-0 overflow-hidden opacity-0 ${isReady ? "" : "pointer-events-none"}`}
      />
    </div>
  );
}
