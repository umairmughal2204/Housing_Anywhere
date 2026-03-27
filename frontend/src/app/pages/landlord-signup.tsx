import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, User, Home } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export function LandlordSignup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/landlord/inbox");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle landlord signup logic here
    console.log("Landlord Signup attempt:", { firstName, lastName, email, password });
    // After successful signup, redirect to landlord inbox
    navigate("/landlord/inbox");
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-[48px] h-[48px] border-4 border-[#FF4B27] border-t-transparent rounded-full animate-spin mx-auto mb-[16px]"></div>
          <p className="text-[#6B6B6B] text-[14px]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-[32px] py-[48px]">
        <div className="w-full max-w-[480px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-[8px] mb-[48px]">
            <div className="w-[32px] h-[32px] bg-[#FF4B27] flex items-center justify-center">
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
            <span className="text-[#1A1A1A] text-[18px] font-bold">
              Housing<span className="text-[#FF4B27]">Anywhere</span>
            </span>
          </Link>

          <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
            Create your landlord account
          </h1>
          <p className="text-[#6B6B6B] text-[16px] mb-[32px] leading-[1.6]">
            List your property for free and find verified tenants
          </p>

          <form onSubmit={handleSubmit} className="space-y-[24px]">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className="text-[#1A1A1A] text-[14px] font-semibold block mb-[8px]">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#6B6B6B]" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[#1A1A1A] text-[14px] font-semibold block mb-[8px]">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27] transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-[#1A1A1A] text-[14px] font-semibold block mb-[8px]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#6B6B6B]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-[#1A1A1A] text-[14px] font-semibold block mb-[8px]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#6B6B6B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full pl-[48px] pr-[48px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
                >
                  {showPassword ? (
                    <EyeOff className="w-[20px] h-[20px]" />
                  ) : (
                    <Eye className="w-[20px] h-[20px]" />
                  )}
                </button>
              </div>
              <p className="text-[#6B6B6B] text-[12px] mt-[4px]">
                Must be at least 8 characters
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-[8px]">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                required
                className="w-[16px] h-[16px] border border-[rgba(0,0,0,0.16)] accent-[#FF4B27] mt-[2px] flex-shrink-0"
              />
              <label htmlFor="terms" className="text-[#1A1A1A] text-[14px] leading-[1.5]">
                I agree to the{" "}
                <Link to="/terms" className="text-[#FF4B27] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-[#FF4B27] hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreeToTerms}
              className={`w-full py-[16px] font-bold transition-colors ${
                agreeToTerms
                  ? "bg-[#FF4B27] text-white hover:bg-[#E63E1C]"
                  : "bg-[#EDEDED] text-[#6B6B6B] cursor-not-allowed"
              }`}
            >
              Create landlord account
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-[16px] my-[32px]">
            <div className="flex-1 h-[1px] bg-[rgba(0,0,0,0.08)]"></div>
            <span className="text-[#6B6B6B] text-[13px]">OR</span>
            <div className="flex-1 h-[1px] bg-[rgba(0,0,0,0.08)]"></div>
          </div>

          {/* Social Signup */}
          <div className="space-y-[12px]">
            <button className="w-full flex items-center justify-center gap-[12px] border border-[rgba(0,0,0,0.16)] py-[12px] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors">
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
          </div>

          {/* Login Link */}
          <p className="text-center text-[#6B6B6B] text-[14px] mt-[32px]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#FF4B27] font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>

          {/* Tenant Link */}
          <p className="text-center text-[#6B6B6B] text-[14px] mt-[16px]">
            Looking for a place to rent?{" "}
            <Link
              to="/signup"
              className="text-[#FF4B27] font-semibold hover:underline"
            >
              Sign up as a tenant
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-[64px]">
          <div className="text-white">
            <div className="w-[64px] h-[64px] bg-[#FF4B27] flex items-center justify-center mb-[32px]">
              <Home className="w-[40px] h-[40px] text-white" />
            </div>
            <h2 className="text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
              Start Earning Today
            </h2>
            <p className="text-[18px] text-white/90 leading-[1.6] mb-[32px]">
              Join 75,000+ landlords who trust HousingAnywhere to find reliable tenants.
            </p>
            <div className="space-y-[16px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-[#008A52] rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-white" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">Free to list your property</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-[#008A52] rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-white" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">100% verified tenants</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-[#008A52] rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-white" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">14 days average rental time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}