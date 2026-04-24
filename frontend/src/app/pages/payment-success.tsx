import { useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";

export function PaymentSuccess() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applicationId = searchParams.get("applicationId");

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-[16px] py-[48px]">
        <div className="w-full max-w-[720px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_16px_40px_rgba(0,0,0,0.08)] rounded-[28px] p-[24px] sm:p-[32px] md:p-[40px] text-center">
          <div className="mx-auto w-[76px] h-[76px] rounded-full flex items-center justify-center mb-[20px] bg-[#EAF9F1]">
            <CheckCircle2 className="w-[38px] h-[38px] text-[#008A52]" />
          </div>

          <h1 className="text-[30px] sm:text-[36px] font-bold tracking-[-0.03em] text-neutral-black mb-[12px]">
            Payment completed
          </h1>

          <p className="text-[16px] leading-[1.7] text-neutral-gray max-w-[540px] mx-auto">
            Your Mollie payment was accepted and your application is now marked as paid.
          </p>

          {applicationId ? (
            <p className="mt-[12px] text-[13px] text-neutral-gray">
              Application reference: {applicationId}
            </p>
          ) : null}

          <div className="mt-[28px] flex flex-col sm:flex-row gap-[12px] justify-center">
            <button
              type="button"
              onClick={() => navigate(`/property/${id}`)}
              className="rounded-full bg-brand-primary text-white px-[24px] py-[12px] font-bold hover:bg-brand-primary-dark transition-colors"
            >
              View property
            </button>
            <button
              type="button"
              onClick={() => navigate("/tenant/applications")}
              className="rounded-full border border-[rgba(0,0,0,0.14)] text-neutral-black px-[24px] py-[12px] font-bold hover:bg-neutral-light-gray transition-colors"
            >
              My applications
            </button>
          </div>

          <p className="mt-[20px] text-[13px] text-neutral-gray">
            You can safely close this tab once you have saved the confirmation.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}