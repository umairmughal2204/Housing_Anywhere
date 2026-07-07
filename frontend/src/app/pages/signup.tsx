import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { BrandLogo } from "../components/brand-logo";
import { GoogleSignInButton } from "../components/google-sign-in-button";

export function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"details" | "verify">("details");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingSignupId, setPendingSignupId] = useState("");
  const [verificationHint, setVerificationHint] = useState("");

  const { signup, confirmSignupCode, signupWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleCredential = async (credential: string) => {
    setError("");
    await signupWithGoogle(credential);
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === "details") {
      if (!agreeToTerms) {
        setError("Please agree to the Terms and Conditions");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      setIsLoading(true);

      try {
        const payload = await signup({
          email,
          password,
          firstName,
          lastName,
          role: "tenant",
        });

        setPendingSignupId(payload.pendingSignupId);
        setVerificationHint(`We sent a 6-digit code to ${email}.`);
        setVerificationCode("");
        setStep("verify");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send verification code. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!pendingSignupId) {
      setError("Please request a new verification code.");
      return;
    }

    if (verificationCode.length !== 6) {
      setError("Enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmSignupCode(pendingSignupId, verificationCode);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");

    if (!agreeToTerms || password.length < 8) {
      setStep("details");
      return;
    }

    setIsLoading(true);
    try {
      const payload = await signup({
        email,
        password,
        firstName,
        lastName,
        role: "tenant",
      });
      setPendingSignupId(payload.pendingSignupId);
      setVerificationHint(`We sent a new 6-digit code to ${email}.`);
      setVerificationCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification code.");
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
            <BrandLogo className="h-[84px]" />
          </Link>

          <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
            Create your account
          </h1>
          <p className="text-neutral-gray text-[16px] mb-[32px] leading-[1.6]">
            Start your housing search today
          </p>

          <form onSubmit={handleSubmit} className="space-y-[24px]">
            {step === "verify" && (
              <div className="rounded-[12px] border border-[rgba(0,0,0,0.12)] bg-[#F8FAFC] p-[16px]">
                <p className="text-neutral-black text-[14px] font-semibold">Verify your email</p>
                <p className="text-neutral-gray text-[13px] mt-[4px] leading-[1.5]">
                  {verificationHint || "Enter the 6-digit code we sent to your email to finish creating your account."}
                </p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-neutral-gray" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    disabled={step === "verify"}
                    className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  disabled={step === "verify"}
                  className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>

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
                  disabled={step === "verify"}
                  className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-neutral-gray" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  disabled={step === "verify"}
                  className="w-full pl-[48px] pr-[48px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={step === "verify"}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-black disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="w-[20px] h-[20px]" />
                  ) : (
                    <Eye className="w-[20px] h-[20px]" />
                  )}
                </button>
              </div>
              <p className="text-neutral-gray text-[12px] mt-[4px]">
                Must be at least 8 characters
              </p>
            </div>

            {step === "details" ? (
              <div className="flex items-start gap-[8px]">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                  className="w-[16px] h-[16px] border border-[rgba(0,0,0,0.16)] accent-brand-primary mt-[2px] flex-shrink-0"
                />
                <label htmlFor="terms" className="text-neutral-black text-[14px] leading-[1.5]">
                  I agree to the{" "}
                  <Link to="/terms" className="text-brand-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-brand-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            ) : (
              <div className="space-y-[12px]">
                <div>
                  <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">
                    Verification code
                  </label>
                  <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex flex-wrap items-center gap-[12px]">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setError("");
                    }}
                    className="text-brand-primary text-[13px] font-semibold hover:underline"
                  >
                    Edit details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-brand-primary text-[13px] font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Resend code
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-[8px] text-brand-primary text-[14px] leading-[1.5]">
                <AlertCircle className="w-[20px] h-[20px]" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (step === "details" && !agreeToTerms)}
              className={`w-full rounded-[14px] py-[16px] font-bold transition-colors ${
                !isLoading && (step === "verify" || agreeToTerms)
                  ? "bg-brand-primary text-white hover:bg-brand-primary-dark hover:cursor-pointer"
                  : "bg-[#EDEDED] text-neutral-gray cursor-not-allowed"
              }`}
            >
              {isLoading ? (step === "verify" ? "Verifying code..." : "Sending code...") : step === "verify" ? "Verify code and create account" : "Send verification code"}
            </button>
          </form>

          {step === "details" && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-[16px] my-[32px]">
                <div className="flex-1 h-[1px] bg-[rgba(0,0,0,0.08)]"></div>
                <span className="text-neutral-gray text-[13px]">OR</span>
                <div className="flex-1 h-[1px] bg-[rgba(0,0,0,0.08)]"></div>
              </div>

              {/* Social Signup */}
              <div className="space-y-[12px]">
                <GoogleSignInButton
                  label="Continue with Google"
                  onCredential={handleGoogleCredential}
                  onError={setError}
                />
              </div>
            </>
          )}

          {/* Login Link */}
          <p className="text-center text-neutral-gray text-[14px] mt-[32px]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-primary font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-[#0891B2] to-[#0E7490] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-[64px]">
          <div className="text-white">
            <h2 className="text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
              Join Thousands of<br />
              Happy Tenants
            </h2>
            <p className="text-[18px] text-white/90 leading-[1.6] mb-[32px]">
              Experience the easiest way to find and book your next home across Europe.
            </p>
            <div className="space-y-[16px]">
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-brand-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-brand-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">Book Without Viewing</span>
              </div>
              <div className="flex items-center gap-[12px]">
                <div className="w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center">
                  <svg className="w-[16px] h-[16px] text-brand-primary" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[16px]">Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
