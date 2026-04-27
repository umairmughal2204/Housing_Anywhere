import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { API_BASE } from "../config";

export function Payment() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!applicationId) {
      setError("Missing application ID.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/payments/mollie/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? "Failed to start checkout");
      }

      const payload = (await response.json()) as { checkoutUrl?: string };
      if (!payload.checkoutUrl) {
        throw new Error("Checkout URL not provided by the server.");
      }

      window.location.href = payload.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-[16px] py-[48px]">
        <div className="w-full max-w-[720px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_16px_40px_rgba(0,0,0,0.08)] rounded-[28px] p-[24px] sm:p-[32px] md:p-[40px] text-center">
          <div className="mx-auto w-[76px] h-[76px] rounded-full flex items-center justify-center mb-[20px] bg-[#EEF5FF]">
            <ShieldCheck className="w-[38px] h-[38px] text-brand-primary" />
          </div>

          <h1 className="text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] text-neutral-black mb-[12px]">
            Complete your booking
          </h1>

          <p className="text-[16px] leading-[1.7] text-neutral-gray max-w-[560px] mx-auto">
            You will be redirected to Mollie's secure checkout to finalize your payment. We do not store your card details.
          </p>

          {error && (
            <div className="mt-[20px] max-w-[400px] mx-auto bg-red-50 border border-red-200 text-red-600 px-[16px] py-[12px] rounded-[8px] flex items-center gap-[8px] text-left text-[14px]">
              <AlertTriangle className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-[28px] flex flex-col sm:flex-row gap-[12px] justify-center">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isLoading || !applicationId}
              className="rounded-full bg-brand-primary text-white px-[24px] py-[12px] font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-[8px]"
            >
              {isLoading && <Loader2 className="w-[18px] h-[18px] animate-spin" />}
              Proceed to Checkout
            </button>
            <button
              type="button"
              onClick={() => navigate(id ? `/property/${id}` : "/")}
              className="rounded-full border border-[rgba(0,0,0,0.14)] text-neutral-black px-[24px] py-[12px] font-bold hover:bg-neutral-light-gray transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-[28px] flex items-center justify-center gap-[8px] text-[13px] text-neutral-gray">
            <CheckCircle2 className="w-[16px] h-[16px] text-[#008A52]" />
            Payment is confirmed instantly
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
