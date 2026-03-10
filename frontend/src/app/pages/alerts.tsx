import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Bell, MapPin, Euro, Home, X } from "lucide-react";

export function Alerts() {
  const alerts = [
    {
      id: 1,
      city: "Berlin",
      criteria: "€800-€1,200 • 1-2 bedrooms • Kreuzberg, Friedrichshain",
      matches: 12,
      active: true,
    },
    {
      id: 2,
      city: "Barcelona",
      criteria: "€600-€1,000 • Studio • Eixample, Gràcia",
      matches: 8,
      active: true,
    },
    {
      id: 3,
      city: "Amsterdam",
      criteria: "€900-€1,500 • 1 bedroom • Centrum, De Pijp",
      matches: 5,
      active: false,
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
              Search Alerts
            </h1>
            <p className="text-[#6B6B6B] text-[16px]">
              Get notified when new properties matching your criteria are listed
            </p>
          </div>

          {/* Create Alert CTA */}
          <div className="bg-[#FF4B27] text-white p-[32px] mb-[32px]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-bold mb-[8px]">
                  Never Miss Your Perfect Home
                </h2>
                <p className="text-white/80 text-[14px]">
                  Set up custom alerts and be the first to know about new listings
                </p>
              </div>
              <button className="px-[24px] py-[12px] bg-white text-[#FF4B27] font-semibold hover:bg-[#F7F7F9] transition-colors whitespace-nowrap">
                + Create Alert
              </button>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="mb-[48px]">
            <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[24px]">
              Active Alerts ({alerts.filter(a => a.active).length})
            </h2>
            <div className="space-y-[16px]">
              {alerts.filter(a => a.active).map((alert) => (
                <div key={alert.id} className="bg-white border border-[rgba(0,0,0,0.08)] p-[24px]">
                  <div className="flex items-start justify-between mb-[16px]">
                    <div className="flex-1">
                      <div className="flex items-center gap-[12px] mb-[12px]">
                        <div className="w-[40px] h-[40px] bg-[#FF4B27]/10 flex items-center justify-center">
                          <Bell className="w-[20px] h-[20px] text-[#FF4B27]" />
                        </div>
                        <div>
                          <h3 className="text-[#1A1A1A] text-[18px] font-bold">
                            {alert.city}
                          </h3>
                          <div className="text-[#6B6B6B] text-[14px]">
                            {alert.criteria}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="p-[8px] hover:bg-[#F7F7F9] transition-colors">
                      <X className="w-[20px] h-[20px] text-[#6B6B6B]" />
                    </button>
                  </div>
                  <div className="flex items-center gap-[16px]">
                    <div className="flex-1 bg-[#F7F7F9] px-[16px] py-[12px]">
                      <div className="text-[#FF4B27] text-[20px] font-bold">
                        {alert.matches}
                      </div>
                      <div className="text-[#6B6B6B] text-[12px]">
                        New matches this week
                      </div>
                    </div>
                    <button className="px-[24px] py-[12px] bg-[#FF4B27] text-white font-semibold hover:bg-[#E63E1F] transition-colors">
                      View Matches
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Paused Alerts */}
          {alerts.filter(a => !a.active).length > 0 && (
            <div>
              <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[24px]">
                Paused Alerts ({alerts.filter(a => !a.active).length})
              </h2>
              <div className="space-y-[16px]">
                {alerts.filter(a => !a.active).map((alert) => (
                  <div key={alert.id} className="bg-white border border-[rgba(0,0,0,0.08)] p-[24px] opacity-60">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-[12px] mb-[12px]">
                          <div className="w-[40px] h-[40px] bg-[#6B6B6B]/10 flex items-center justify-center">
                            <Bell className="w-[20px] h-[20px] text-[#6B6B6B]" />
                          </div>
                          <div>
                            <h3 className="text-[#1A1A1A] text-[18px] font-bold">
                              {alert.city}
                            </h3>
                            <div className="text-[#6B6B6B] text-[14px]">
                              {alert.criteria}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <button className="px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors">
                          Resume
                        </button>
                        <button className="p-[8px] hover:bg-[#F7F7F9] transition-colors">
                          <X className="w-[20px] h-[20px] text-[#6B6B6B]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
