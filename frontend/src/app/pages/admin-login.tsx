import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { BrandLogo } from "../components/brand-logo";

export function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAdmin) {
    void navigate("/admin", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored) as { role?: string };
        if (parsed.role !== "admin") {
          localStorage.removeItem("user");
          localStorage.removeItem("authToken");
          setError("This account does not have admin access.");
          setIsLoading(false);
          return;
        }
      }
      void navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light-gray flex flex-col items-center justify-center p-[24px]">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-[32px]">
          <Link to="/">
            <BrandLogo className="h-[72px] mb-[16px]" />
          </Link>
          <div className="flex items-center gap-[8px] px-[16px] py-[8px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px]">
            <ShieldCheck className="w-[18px] h-[18px] text-brand-primary" />
            <span className="text-[14px] font-bold text-neutral-black">Admin Portal</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] p-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h1 className="text-[24px] font-bold text-neutral-black mb-[8px]">Sign in</h1>
          <p className="text-neutral-gray text-[14px] mb-[24px]">Access the administrator dashboard</p>

          {error && (
            <div className="mb-[20px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[10px] text-red-600 text-[14px]">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-[16px]">
            <div>
              <label className="block text-[13px] font-semibold text-neutral-black mb-[6px]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full px-[14px] py-[12px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] text-neutral-black outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-neutral-black mb-[6px]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-[14px] py-[12px] pr-[44px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] text-neutral-black outline-none focus:border-brand-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-[12px] top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-black"
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-[13px] bg-brand-primary text-white text-[15px] font-semibold rounded-[10px] hover:bg-brand-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-[8px]"
            >
              {isLoading ? "Signing in…" : "Sign in to Admin"}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-gray text-[13px] mt-[20px]">
          <Link to="/" className="hover:text-brand-primary transition-colors">← Back to website</Link>
        </p>
      </div>
    </div>
  );
}
