import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { CreditCard, Calendar, Download, Check } from "lucide-react";

export function Payments() {
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
              <div className="flex items-center justify-between p-[16px] border border-[rgba(0,0,0,0.08)] bg-[#F7F7F9]">
                <div className="flex items-center gap-[16px]">
                  <div className="w-[48px] h-[32px] bg-[#1A1A1A] flex items-center justify-center">
                    <CreditCard className="w-[20px] h-[20px] text-white" />
                  </div>
                  <div>
                    <div className="text-[#1A1A1A] text-[14px] font-semibold">
                      Visa ending in 4242
                    </div>
                    <div className="text-[#6B6B6B] text-[12px]">
                      Expires 12/2028
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-[8px] text-[#008A52] text-[12px] font-semibold">
                  <Check className="w-[14px] h-[14px]" />
                  Default
                </div>
              </div>
              <button className="w-full p-[16px] border border-[rgba(0,0,0,0.08)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors">
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
                      <button className="p-[8px] hover:bg-white transition-colors">
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
