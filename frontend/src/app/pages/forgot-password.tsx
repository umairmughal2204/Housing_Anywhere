import { Link } from "react-router";
import { FormEvent, useState } from "react";
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-[24px] py-[48px]">
      <div className="w-full max-w-[480px] border border-[rgba(0,0,0,0.12)] p-[32px]">
        <h1 className="text-neutral-black text-[30px] font-bold tracking-[-0.02em] mb-[10px]">
          Forgot your password?
        </h1>
        <p className="text-neutral-gray text-[15px] mb-[24px] leading-[1.6]">
          Enter your account email. If it exists, we will send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div>
            <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">Email address</label>
            <div className="relative">
              <Mail className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-[42px] pr-[14px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[14px] text-neutral-black focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary text-white py-[13px] font-bold hover:bg-brand-primary-dark hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Sending..." : "Send reset email"}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-[8px] text-brand-primary text-[14px] mt-[16px]">
            <AlertCircle className="w-[18px] h-[18px]" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-[8px] text-[#0f7d38] text-[14px] mt-[16px]">
            <CheckCircle2 className="w-[18px] h-[18px]" />
            {success}
          </div>
        )}

        <p className="text-neutral-gray text-[14px] mt-[22px]">
          Remembered it?{" "}
          <Link to="/login" className="text-brand-primary font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
