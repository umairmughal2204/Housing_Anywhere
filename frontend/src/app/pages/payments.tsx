import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { CreditCard, Calendar, Download, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { Skeleton } from "../components/ui/skeleton";

interface TenantPaymentDetails {
  method?: string;
  isPaid: boolean;
  paidAmount: number;
  paidAt: string | null;
  currency: string;
  rentForSelectedPeriod: number;
  tenantProtectionFee: number;
  addRentGuarantee: boolean;
  rentGuaranteeFee: number;
  totalAmount: number;
}

interface TenantApplicationWithPayment {
  id: string;
  createdAt: string;
  paymentDetails: TenantPaymentDetails | null;
  listing: {
    title: string;
    city: string;
    address: string;
  };
}

interface TenantApplicationsResponse {
  applications: TenantApplicationWithPayment[];
}

const methodLabel: Record<string, string> = {
  card: "Card",
  ideal: "iDEAL",
  bancontact: "Bancontact",
};

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });
}

function PaymentsSkeleton() {
  return (
    <div className="divide-y divide-[rgba(0,0,0,0.08)]" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="p-[24px]">
          <div className="flex items-center justify-between gap-[16px]">
            <div className="flex-1 space-y-[8px]">
              <Skeleton className="h-[18px] w-[60%] rounded-[6px]" />
              <Skeleton className="h-[14px] w-[40%] rounded-[6px]" />
            </div>
            <Skeleton className="h-[36px] w-[100px] rounded-[10px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildReceiptHtml(application: TenantApplicationWithPayment) {
  const payment = application.paymentDetails!;
  const statusColor = payment.isPaid ? "#0891B2" : "#B54708";
  const statusBg = payment.isPaid ? "#CFFAFE" : "#FEF0C7";

  const lineItems: Array<{ label: string; amount: number }> = [
    { label: "Rent for selected period", amount: payment.rentForSelectedPeriod },
    { label: "Tenant protection fee", amount: payment.tenantProtectionFee },
  ];
  if (payment.addRentGuarantee) {
    lineItems.push({ label: "Rent guarantee", amount: payment.rentGuaranteeFee });
  }

  const lineItemsHtml = lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;color:#6B6B6B;font-size:14px;">${item.label}</td>
          <td style="padding:10px 0;color:#1A1A1A;font-size:14px;text-align:right;">${formatCurrency(item.amount, payment.currency)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>ReserveHousing Receipt ${application.id}</title>
</head>
<body style="margin:0;padding:40px 16px;background:#F7F7F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:24px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);box-shadow:0 18px 44px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0891B2,#0E7490);padding:32px;">
      <div style="color:#FFFFFF;font-size:22px;font-weight:800;letter-spacing:-0.02em;">ReserveHousing</div>
      <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px;">Payment Receipt</div>
    </div>

    <div style="padding:32px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
        <div>
          <div style="color:#6B6B6B;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Receipt ID</div>
          <div style="color:#1A1A1A;font-size:14px;font-weight:600;margin-top:2px;">${application.id}</div>
        </div>
        <div style="background:${statusBg};color:${statusColor};font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;">
          ${payment.isPaid ? "Paid" : "Pending"}
        </div>
      </div>

      <div style="background:#F7F7F9;border-radius:16px;padding:20px;margin-bottom:24px;">
        <div style="color:#1A1A1A;font-size:16px;font-weight:700;margin-bottom:4px;">${application.listing.title}</div>
        <div style="color:#6B6B6B;font-size:13px;">${application.listing.address}, ${application.listing.city}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          ${lineItemsHtml}
          <tr>
            <td style="padding:16px 0 0;border-top:1px solid rgba(0,0,0,0.08);color:#1A1A1A;font-size:16px;font-weight:800;">Total paid</td>
            <td style="padding:16px 0 0;border-top:1px solid rgba(0,0,0,0.08);color:#0891B2;font-size:20px;font-weight:800;text-align:right;">${formatCurrency(payment.totalAmount, payment.currency)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex;gap:24px;margin-top:28px;padding-top:20px;border-top:1px solid rgba(0,0,0,0.08);">
        <div>
          <div style="color:#6B6B6B;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Date</div>
          <div style="color:#1A1A1A;font-size:14px;font-weight:600;margin-top:2px;">${formatDate(payment.paidAt ?? application.createdAt)}</div>
        </div>
        <div>
          <div style="color:#6B6B6B;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Method</div>
          <div style="color:#1A1A1A;font-size:14px;font-weight:600;margin-top:2px;">${methodLabel[payment.method ?? ""] ?? "Online payment"}</div>
        </div>
      </div>
    </div>

    <div style="background:#F7F7F9;padding:20px 32px;text-align:center;color:#6B6B6B;font-size:12px;">
      Questions about this payment? Contact support@reservehousing.com
    </div>
  </div>
</body>
</html>`;
}

export function Payments() {
  const [applications, setApplications] = useState<TenantApplicationWithPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view your payments.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/rental-applications/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load your payments");
        }

        const payload = (await response.json()) as TenantApplicationsResponse;
        setApplications(
          payload.applications.filter((application) => (application.paymentDetails?.totalAmount ?? 0) > 0)
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your payments");
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayments();
  }, []);

  const downloadReceipt = (application: TenantApplicationWithPayment) => {
    if (!application.paymentDetails) return;

    const blob = new Blob([buildReceiptHtml(application)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reservehousing-receipt-${application.id}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-[#F7F7F9] py-[64px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          {/* Header */}
          <div className="mb-[48px]">
            <h1 className="text-[#1A1A1A] text-[40px] font-bold tracking-[-0.02em] mb-[16px]">
              Payments
            </h1>
            <p className="text-[#6B6B6B] text-[16px]">
              View and download your payment history
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-[8px] bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] p-[24px] mb-[32px] text-[#B42318]">
              <AlertCircle className="w-[20px] h-[20px] flex-shrink-0" />
              <span className="text-[14px]">{error}</span>
            </div>
          )}

          {/* Payment History */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <div className="p-[32px] border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="text-[#1A1A1A] text-[20px] font-bold">
                Payment History
              </h2>
            </div>

            {isLoading ? (
              <PaymentsSkeleton />
            ) : applications.length === 0 && !error ? (
              <div className="p-[48px] text-center">
                <div className="w-[64px] h-[64px] rounded-full bg-brand-primary-light flex items-center justify-center mx-auto mb-[16px]">
                  <CreditCard className="w-[28px] h-[28px] text-brand-primary" />
                </div>
                <p className="text-[#6B6B6B] text-[14px]">
                  You don't have any payments yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[rgba(0,0,0,0.08)]">
                {applications.map((application) => {
                  const payment = application.paymentDetails!;
                  return (
                    <div key={application.id} className="p-[24px] hover:bg-[#F7F7F9] transition-colors">
                      <div className="flex items-center justify-between gap-[16px]">
                        <div className="flex-1 min-w-0">
                          <div className="text-[#1A1A1A] text-[16px] font-semibold mb-[4px] truncate">
                            {application.listing.title}
                          </div>
                          <div className="flex items-center gap-[16px] text-[#6B6B6B] text-[14px]">
                            <div className="flex items-center gap-[8px]">
                              <Calendar className="w-[14px] h-[14px]" />
                              {formatDate(payment.paidAt ?? application.createdAt)}
                            </div>
                            <div>{methodLabel[payment.method ?? ""] ?? "Online payment"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[24px]">
                          <div className="text-right">
                            <div className="text-[#1A1A1A] text-[18px] font-bold mb-[4px]">
                              {formatCurrency(payment.totalAmount, payment.currency)}
                            </div>
                            <div
                              className={`inline-block text-[12px] font-semibold rounded-full px-[10px] py-[2px] ${
                                payment.isPaid ? "bg-brand-primary-light text-brand-primary-dark" : "bg-[#FEF0C7] text-[#B54708]"
                              }`}
                            >
                              {payment.isPaid ? "Paid" : "Pending"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => downloadReceipt(application)}
                            className="p-[10px] rounded-[12px] hover:bg-white transition-colors"
                            aria-label={`Download receipt for ${application.listing.title}`}
                          >
                            <Download className="w-[20px] h-[20px] text-[#6B6B6B]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
