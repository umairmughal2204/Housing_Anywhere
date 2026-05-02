import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { CreditCard, Calendar, Download, Check } from "lucide-react";
import { useState } from "react";

export function Payments() {
  const [showAddMethodForm, setShowAddMethodForm] = useState(false);
  const [cardLast4, setCardLast4] = useState("");
  const [expiry, setExpiry] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      brand: "Visa",
      last4: "4242",
      expiry: "12/2028",
      isDefault: true,
    },
  ]);

  const payments = [
    {
      id: 1,
      property: "Modern Loft in Kreuzberg",
      amount: "€1,200",
      date: "2026-03-01",
      status: "Paid",
      method: "Visa •••• 4242",
    },
    {
      id: 2,
      property: "Modern Loft in Kreuzberg",
      amount: "€1,200",
      date: "2026-02-01",
      status: "Paid",
      method: "Visa •••• 4242",
    },
    {
      id: 3,
      property: "Sunny Studio near Tiergarten",
      amount: "€950",
      date: "2025-12-01",
      status: "Paid",
      method: "Mastercard •••• 8888",
    },
  ];

  const downloadReceipt = (payment: (typeof payments)[number]) => {
    const receiptContent = [
      "ReserveHousing Payment Receipt",
      "",
      `Receipt ID: ${payment.id}`,
      `Property: ${payment.property}`,
      `Amount: ${payment.amount}`,
      `Date: ${payment.date}`,
      `Status: ${payment.status}`,
      `Method: ${payment.method}`,
    ].join("\n");

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reservehousing-receipt-${payment.id}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleAddPaymentMethod = () => {
    const normalizedLast4 = cardLast4.replace(/\D/g, "").slice(-4);
    const normalizedExpiry = expiry.trim();

    if (normalizedLast4.length !== 4 || !/^\d{2}\/\d{4}$/.test(normalizedExpiry)) {
      return;
    }

    setPaymentMethods((prev) => [
      ...prev,
      {
        id: Date.now(),
        brand: "Visa",
        last4: normalizedLast4,
        expiry: normalizedExpiry,
        isDefault: prev.length === 0,
      },
    ]);
    setCardLast4("");
    setExpiry("");
    setShowAddMethodForm(false);
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
              View and manage your payment history
            </p>
          </div>

          {/* Payment Methods */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[32px] mb-[32px]">
            <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[24px]">
              Payment Methods
            </h2>
            <div className="space-y-[16px]">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-[16px] border border-[rgba(0,0,0,0.08)] bg-[#F7F7F9]">
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[48px] h-[32px] bg-[#1A1A1A] flex items-center justify-center">
                      <CreditCard className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div>
                      <div className="text-[#1A1A1A] text-[14px] font-semibold">
                        {method.brand} ending in {method.last4}
                      </div>
                      <div className="text-[#6B6B6B] text-[12px]">
                        Expires {method.expiry}
                      </div>
                    </div>
                  </div>
                  {method.isDefault && (
                    <div className="flex items-center gap-[8px] text-[#008A52] text-[12px] font-semibold">
                      <Check className="w-[14px] h-[14px]" />
                      Default
                    </div>
                  )}
                </div>
              ))}

              {showAddMethodForm && (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-[10px] p-[14px] border border-[rgba(0,0,0,0.08)] bg-white">
                  <input
                    type="text"
                    value={cardLast4}
                    onChange={(event) => setCardLast4(event.target.value)}
                    placeholder="Last 4 digits"
                    className="h-[42px] rounded-[8px] border border-[rgba(0,0,0,0.14)] px-[12px] text-[14px] outline-none focus:border-brand-primary"
                  />
                  <input
                    type="text"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    placeholder="MM/YYYY"
                    className="h-[42px] rounded-[8px] border border-[rgba(0,0,0,0.14)] px-[12px] text-[14px] outline-none focus:border-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddPaymentMethod}
                    className="h-[42px] rounded-[8px] bg-brand-primary px-[14px] text-[14px] font-semibold text-white hover:bg-brand-primary-dark transition-colors"
                  >
                    Save
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAddMethodForm((prev) => !prev)}
                className="w-full p-[16px] border border-[rgba(0,0,0,0.08)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors"
              >
                + Add Payment Method
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)]">
            <div className="p-[32px] border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="text-[#1A1A1A] text-[20px] font-bold">
                Payment History
              </h2>
            </div>
            <div className="divide-y divide-[rgba(0,0,0,0.08)]">
              {payments.map((payment) => (
                <div key={payment.id} className="p-[24px] hover:bg-[#F7F7F9] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-[#1A1A1A] text-[16px] font-semibold mb-[4px]">
                        {payment.property}
                      </div>
                      <div className="flex items-center gap-[16px] text-[#6B6B6B] text-[14px]">
                        <div className="flex items-center gap-[8px]">
                          <Calendar className="w-[14px] h-[14px]" />
                          {payment.date}
                        </div>
                        <div>{payment.method}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-[24px]">
                      <div className="text-right">
                        <div className="text-[#1A1A1A] text-[18px] font-bold mb-[4px]">
                          {payment.amount}
                        </div>
                        <div className="text-[#008A52] text-[12px] font-semibold">
                          {payment.status}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadReceipt(payment)}
                        className="p-[8px] hover:bg-white transition-colors"
                        aria-label={`Download receipt for payment ${payment.id}`}
                      >
                        <Download className="w-[20px] h-[20px] text-[#6B6B6B]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
