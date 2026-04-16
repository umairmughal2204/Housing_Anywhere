import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

const GOOGLE_SCRIPT_ID = "google-identity-service";

function hasGoogleIdentity() {
  const google = (window as {
    google?: {
      accounts?: {
        id?: unknown;
      };
    };
  }).google;

  return Boolean(google?.accounts?.id);
}

function loadGoogleIdentityScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google sign-in is only available in the browser"));
      return;
    }

    if (hasGoogleIdentity()) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () => {
          if (hasGoogleIdentity()) {
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
      if (hasGoogleIdentity()) {
        resolve();
        return;
      }

      reject(new Error("Google sign-in script loaded but Google Identity is unavailable"));
    };
    script.onerror = () => reject(new Error("Failed to load Google SDK"));
    document.head.appendChild(script);
  });
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { user, login, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || searchParams.get("returnTo");

  useEffect(() => {
    if (user) {
      if (user.isLandlord) {
        navigate("/landlord/dashboard");
      } else {
        navigate(redirect || "/");
      }
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);

    try {
      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        throw new Error("Google sign-in is not configured");
      }

      await loadGoogleIdentityScript();

      const google = (window as {
        google?: {
          accounts?: {
            id?: {
              initialize: (config: {
                client_id: string;
                callback: (response: { credential?: string; error?: string }) => void;
              }) => void;
              prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
            };
          };
        };
      }).google;

      if (!google?.accounts?.id) {
        throw new Error("Google sign-in is unavailable right now");
      }

      const credential = await new Promise<string>((resolve, reject) => {
        let settled = false;

        const timeout = window.setTimeout(() => {
          if (!settled) {
            settled = true;
            reject(new Error("Google sign-in timed out. Please try again."));
          }
        }, 30000);

        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (settled) {
              return;
            }

            if (response.error) {
              settled = true;
              window.clearTimeout(timeout);
              reject(new Error(response.error));
              return;
            }

            if (!response.credential) {
              return;
            }

            settled = true;
            window.clearTimeout(timeout);
            resolve(response.credential);
          },
        });

        google.accounts.id.prompt((notification) => {
          if (settled) {
            return;
          }

          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            settled = true;
            window.clearTimeout(timeout);
            reject(new Error("Google sign-in UI could not be displayed. Please ensure Google is not blocked."));
          }
        });
      });

      await loginWithGoogle(credential, rememberMe);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      setError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAuthLoading) {
      setError("Please wait a moment and try again.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      if (message.toLowerCase().includes("failed to fetch")) {
        setError("Cannot reach server right now. Please try again in a few seconds.");
      } else if (message.toLowerCase().includes("uses google sign-in")) {
        await handleGoogleLogin();
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-[32px] py-[48px]">
        <div className="w-full max-w-[480px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-[8px] mb-[48px]">
            <div className="w-[32px] h-[32px] bg-brand-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-neutral-black text-[18px] font-bold">
              Easy<span className="text-brand-primary">Rent</span>
            </span>
          </Link>

          <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
            Welcome back
          </h1>
          <p className="text-neutral-gray text-[16px] mb-[32px] leading-[1.6]">
            Log in to your account to continue your search
          </p>

          <form onSubmit={handleSubmit} className="space-y-[24px]">
            {/* Email Field */}
            <div>
              <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-neutral-gray" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-[8px]">
                <label className="text-neutral-black text-[14px] font-semibold">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-brand-primary text-[13px] font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-neutral-gray" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-[48px] pr-[48px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-black"
                >
                  {showPassword ? (
                    <EyeOff className="w-[20px] h-[20px]" />
                  ) : (
                    <Eye className="w-[20px] h-[20px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-[16px] h-[16px] border border-[rgba(0,0,0,0.16)] accent-brand-primary"
              />
              <label htmlFor="remember" className="text-neutral-black text-[14px]">
                Remember me for 10 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isAuthLoading}
              className="w-full bg-brand-primary text-white py-[16px] font-bold hover:bg-brand-primary-dark hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {isLoading || isAuthLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-[8px] text-brand-primary text-[14px] mt-[16px]">
              <AlertCircle className="w-[20px] h-[20px]" />
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-[16px] my-[32px]">
            <div className="flex-1 h-[1px] bg-[rgba(0,0,0,0.08)]"></div>
            <span className="text-neutral-gray text-[13px]">OR</span>
            <div className="flex-1 h-[1px] bg-[rgba(0,0,0,0.08)]"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-[12px]">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-[12px] border border-[rgba(0,0,0,0.16)] py-[12px] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
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
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-neutral-gray text-[14px] mt-[32px]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-brand-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-[#0891B2] to-[#0E7490] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-[64px]">
          <div className="text-white">
            <h2 className="text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
              Find Your Perfect Home
            </h2>
            <p className="text-[18px] text-white/90 leading-[1.6] mb-[32px]">
              Access thousands of verified properties across Europe. Book securely without viewing.
            </p>
            <div className="space-y-[16px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-brand-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">100% Verified Landlords</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-brand-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">Secure Payment Protection</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-brand-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}