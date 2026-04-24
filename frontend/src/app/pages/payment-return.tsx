import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { API_BASE } from "../config";

type PaymentStatusResponse = {
  paymentStatus?: string;
  isPaid?: boolean;
};

const terminalStatuses = new Set(["paid", "failed", "canceled", "expired"]);

export function PaymentReturn() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get("applicationId") ?? "";
  const [message, setMessage] = useState("Confirming your payment with Mollie...");
  const [hasError, setHasError] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!id || !applicationId) {
      setHasError(true);
      setMessage("Missing payment details. Please return to the listing and try again.");
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/payments/mollie/application-status?applicationId=${encodeURIComponent(applicationId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to confirm payment status");
        }

        const payload = (await response.json()) as PaymentStatusResponse;
        if (cancelled) {
          return;
        }

        const status = (payload.paymentStatus ?? "open").toLowerCase();
        if (status === "paid" || payload.isPaid) {
          navigate(`/property/${id}/payment/success?applicationId=${encodeURIComponent(applicationId)}`, { replace: true });
          return;
        }

        if (terminalStatuses.has(status)) {
          navigate(`/property/${id}/payment/failed?applicationId=${encodeURIComponent(applicationId)}`, { replace: true });
          return;
        }

        attemptsRef.current += 1;
        setMessage("Your payment is still being confirmed. This usually takes a few seconds.");

        if (attemptsRef.current < 6) {
          timeoutId = window.setTimeout(() => {
            void checkStatus();
          }, 2000);
        } else {
          setMessage("We are still waiting for Mollie to confirm the payment. Please refresh in a moment.");
        }
      } catch {
        if (cancelled) {
          return;
        }

        attemptsRef.current += 1;
        setHasError(true);
        setMessage("We could not confirm the payment yet. Please wait a moment or try again.");

        if (attemptsRef.current < 3) {
          timeoutId = window.setTimeout(() => {
            void checkStatus();
          }, 2000);
        }
      }
    };

    void checkStatus();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [applicationId, id, navigate]);

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-[16px] py-[48px]">
        <div className="w-full max-w-[720px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_16px_40px_rgba(0,0,0,0.08)] rounded-[28px] p-[24px] sm:p-[32px] md:p-[40px] text-center">
          <div className="mx-auto w-[72px] h-[72px] rounded-full flex items-center justify-center mb-[20px] bg-[#EEF5FF]">
            {hasError ? <TriangleAlert className="w-[34px] h-[34px] text-[#D97706]" /> : <Loader2 className="w-[34px] h-[34px] text-brand-primary animate-spin" />}
          </div>

          <h1 className="text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] text-neutral-black mb-[12px]">
            {hasError ? "Checking payment details" : "Confirming your payment"}
          </h1>

          <p className="text-[16px] leading-[1.7] text-neutral-gray max-w-[540px] mx-auto">
            {message}
          </p>

          <div className="mt-[28px] flex flex-col sm:flex-row gap-[12px] justify-center">
            <button
              type="button"
              onClick={() => navigate(id ? `/property/${id}` : "/")}
              className="rounded-full bg-brand-primary text-white px-[24px] py-[12px] font-bold hover:bg-brand-primary-dark transition-colors"
            >
              Back to property
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-[rgba(0,0,0,0.14)] text-neutral-black px-[24px] py-[12px] font-bold hover:bg-neutral-light-gray transition-colors"
            >
              Refresh status
            </button>
          </div>

          <div className="mt-[28px] flex items-center justify-center gap-[8px] text-[13px] text-neutral-gray">
            <CheckCircle2 className="w-[16px] h-[16px] text-[#008A52]" />
            Secure checkout powered by Mollie
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}