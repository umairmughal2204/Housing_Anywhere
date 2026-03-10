import { Link, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || searchParams.get("returnTo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      login(email, password);
      // Redirect to specified page or home after successful login
      navigate(redirect || "/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
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
                className="w-[16px] h-[16px] border border-[rgba(0,0,0,0.16)] accent-brand-primary"
              />
              <label htmlFor="remember" className="text-neutral-black text-[14px]">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-brand-primary text-white py-[16px] font-bold hover:bg-brand-primary-dark transition-colors"
            >
              {isLoading ? "Logging in..." : "Log in"}
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
            <button className="w-full flex items-center justify-center gap-[12px] border border-[rgba(0,0,0,0.16)] py-[12px] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors">
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
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-[12px] border border-[rgba(0,0,0,0.16)] py-[12px] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors">
              <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="#1877F2">
                <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" />
              </svg>
              Continue with Facebook
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