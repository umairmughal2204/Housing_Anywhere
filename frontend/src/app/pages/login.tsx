import { Link, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { BrandLogo } from "../components/brand-logo";
import { GoogleSignInButton } from "../components/google-sign-in-button";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || searchParams.get("returnTo");

  const handleGoogleCredential = async (credential: string) => {
    setError("");
    await loginWithGoogle(credential, rememberMe);
    navigate(redirect || "/");
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
      // Redirect to specified page or home after successful login
      navigate(redirect || "/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid email or password. Please try again.";
      if (message.toLowerCase().includes("failed to fetch")) {
        setError("Cannot reach server right now. Please try again in a few seconds.");
      } else if (message.toLowerCase().includes("uses google sign-in")) {
        setError("This account uses Google sign-in. Please use the \"Continue with Google\" button below.");
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
            <BrandLogo className="h-[80px]" />
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
              className="w-full rounded-[14px] bg-brand-primary text-white py-[16px] font-bold hover:bg-brand-primary-dark hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
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
            <GoogleSignInButton
              label="Continue with Google"
              onCredential={handleGoogleCredential}
              onError={setError}
            />
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