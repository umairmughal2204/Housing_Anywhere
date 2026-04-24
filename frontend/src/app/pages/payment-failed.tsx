import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CircleAlert, Loader2 } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { API_BASE } from "../config";

export function PaymentFailed() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get("applicationId") ?? "";
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const retryPayment = async () => {
    if (!id || !applicationId) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsRetrying(true);
    setErrorMessage(null);

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
        throw new Error(payload.message ?? "Unable to restart payment");
      }

      const payload = (await response.json()) as { checkoutUrl?: string };
      if (!payload.checkoutUrl) {
        throw new Error("Mollie checkout URL is missing");
      }

      window.location.assign(payload.checkoutUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to restart payment");
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7F4] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-[16px] py-[48px]">
        <div className="w-full max-w-[720px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_16px_40px_rgba(0,0,0,0.08)] rounded-[28px] p-[24px] sm:p-[32px] md:p-[40px] text-center">
          <div className="mx-auto w-[76px] h-[76px] rounded-full flex items-center justify-center mb-[20px] bg-[#FFF1E7]">
            <CircleAlert className="w-[38px] h-[38px] text-[#C2410C]" />
          </div>

          <h1 className="text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] text-neutral-black mb-[12px]">
            Payment was not completed
          </h1>

          <p className="text-[16px] leading-[1.7] text-neutral-gray max-w-[560px] mx-auto">
            If you entered the wrong card number or chose a method that was declined, Mollie will stop the payment and you can try again.
          </p>

          {applicationId ? (
            <p className="mt-[12px] text-[13px] text-neutral-gray">
              Application reference: {applicationId}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-[16px] text-[14px] text-[#B42318] font-medium">{errorMessage}</p>
          ) : null}

          <div className="mt-[28px] flex flex-col sm:flex-row gap-[12px] justify-center">
            <button
              type="button"
              onClick={retryPayment}
              disabled={isRetrying}
              className="rounded-full bg-brand-primary text-white px-[24px] py-[12px] font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-[8px]"
            >
              {isRetrying ? <Loader2 className="w-[16px] h-[16px] animate-spin" /> : null}
              Try again
            </button>
            <button
              type="button"
              onClick={() => navigate(id ? `/property/${id}` : "/")}
              className="rounded-full border border-[rgba(0,0,0,0.14)] text-neutral-black px-[24px] py-[12px] font-bold hover:bg-neutral-light-gray transition-colors"
            >
              Back to property
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}