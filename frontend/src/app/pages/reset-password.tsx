import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export function ResetPassword() {
  const { resetPasswordWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get("token") ?? "";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Missing reset token. Please request a new reset email.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPasswordWithToken(token, newPassword);
      setSuccess("Password updated successfully. Redirecting to login...");
      window.setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-[24px] py-[48px]">
      <div className="w-full max-w-[480px] border border-[rgba(0,0,0,0.12)] p-[32px]">
        <h1 className="text-neutral-black text-[30px] font-bold tracking-[-0.02em] mb-[10px]">
          Set new password
        </h1>
        <p className="text-neutral-gray text-[15px] mb-[24px] leading-[1.6]">
          Choose a strong password with at least 8 characters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div>
            <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">New password</label>
            <div className="relative">
              <Lock className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full pl-[42px] pr-[42px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[14px] text-neutral-black focus:outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-black"
              >
                {showNewPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-neutral-black text-[14px] font-semibold block mb-[8px]">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full pl-[42px] pr-[42px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[14px] text-neutral-black focus:outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-black"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-[18px] h-[18px]" />
                ) : (
                  <Eye className="w-[18px] h-[18px]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary text-white py-[13px] font-bold hover:bg-brand-primary-dark hover:cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Updating..." : "Reset password"}
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
          <Link to="/login" className="text-brand-primary font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
