import { Link, useLocation } from "react-router";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { useState } from "react";
import { 
  Home,
  MessageSquare,
  List,
  Key,
  BarChart3,
  Bell,
  Settings,
  Calendar,
  User,
  MapPin,
  Euro,
  Clock,
  FileText,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type RentalStatus = "current" | "upcoming" | "past";

interface Rental {
  id: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyImage: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantAvatar: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: RentalStatus;
  daysRemaining?: number;
  totalEarned?: number;
}

const mockRentals: Rental[] = [
  {
    id: "1",
    propertyTitle: "Modern 2BR in Kreuzberg",
    propertyAddress: "Oranienstraße 45, Berlin",
    propertyImage: "https://images.unsplash.com/photo-1662454419736-de132ff75638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzczMTM3MzUxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    tenantName: "James Wilson",
    tenantEmail: "james.wilson@email.com",
    tenantPhone: "+49 157 1234 5678",
    tenantAvatar: "JW",
    startDate: "2025-12-01",
    endDate: "2026-06-01",
    monthlyRent: 1850,
    deposit: 3700,
    status: "current",
    daysRemaining: 83,
    totalEarned: 7400,
  },
  {
    id: "2",
    propertyTitle: "Studio Near Alexanderplatz",
    propertyAddress: "Karl-Marx-Allee 92, Berlin",
    propertyImage: "https://images.unsplash.com/photo-1725042893312-5ec0dea9e369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBsaXZpbmclMjByb29tJTIwYnJpZ2h0fGVufDF8fHx8MTc3MzE2NzI4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    tenantName: "Nina Kowalski",
    tenantEmail: "nina.k@email.com",
    tenantPhone: "+49 176 9876 5432",
    tenantAvatar: "NK",
    startDate: "2026-01-15",
    endDate: "2027-01-15",
    monthlyRent: 2200,
    deposit: 4400,
    status: "current",
    daysRemaining: 311,
    totalEarned: 4400,
  },
  {
    id: "3",
    propertyTitle: "3BR Family Apartment",
    propertyAddress: "Prenzlauer Allee 156, Berlin",
    propertyImage: "https://images.unsplash.com/photo-1715985160053-d339e8b6eb94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBraXRjaGVufGVufDF8fHx8MTc3MzA5Mzk5N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    tenantName: "Elena Rodriguez",
    tenantEmail: "elena.r@email.com",
    tenantPhone: "+49 162 4567 8901",
    tenantAvatar: "ER",
    startDate: "2026-03-18",
    endDate: "2027-03-18",
    monthlyRent: 2800,
    deposit: 5600,
    status: "upcoming",
  },
  {
    id: "4",
    propertyTitle: "Cozy 1BR in Neukölln",
    propertyAddress: "Sonnenallee 67, Berlin",
    propertyImage: "https://images.unsplash.com/photo-1662454419736-de132ff75638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzczMTM3MzUxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    tenantName: "Marcus Chen",
    tenantEmail: "m.chen@email.com",
    tenantPhone: "+49 151 2345 6789",
    tenantAvatar: "MC",
    startDate: "2025-06-01",
    endDate: "2025-12-01",
    monthlyRent: 1200,
    deposit: 2400,
    status: "past",
    totalEarned: 7200,
  },
  {
    id: "5",
    propertyTitle: "Luxury Penthouse Mitte",
    propertyAddress: "Friedrichstraße 200, Berlin",
    propertyImage: "https://images.unsplash.com/photo-1725042893312-5ec0dea9e369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBsaXZpbmclMjByb29tJTIwYnJpZ2h0fGVufDF8fHx8MTc3MzE2NzI4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    tenantName: "Sophie Anderson",
    tenantEmail: "sophie.a@email.com",
    tenantPhone: "+49 170 8765 4321",
    tenantAvatar: "SA",
    startDate: "2025-03-01",
    endDate: "2025-09-01",
    monthlyRent: 3500,
    deposit: 7000,
    status: "past",
    totalEarned: 21000,
  },
];

export function LandlordRentals() {
  const location = useLocation();
  const [filterStatus, setFilterStatus] = useState<RentalStatus | "all">("current");

  const stats = {
    unreadMessages: 5,
  };

  const filteredRentals = mockRentals.filter((rental) => {
    return filterStatus === "all" || rental.status === filterStatus;
  });

  const statusCounts = {
    all: mockRentals.length,
    current: mockRentals.filter((r) => r.status === "current").length,
    upcoming: mockRentals.filter((r) => r.status === "upcoming").length,
    past: mockRentals.filter((r) => r.status === "past").length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <LandlordPortalLayout>
      {/* Main Content */}
      <main className="flex-1 p-[32px]">
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
            Rentals
          </h1>
          <p className="text-neutral-gray text-[16px]">
            Track current, upcoming, and past rentals
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] mb-[24px]">
          <div className="flex items-center gap-[8px] px-[24px] py-[16px]">
            <button
              onClick={() => setFilterStatus("current")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "current"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              Current ({statusCounts.current})
            </button>
            <button
              onClick={() => setFilterStatus("upcoming")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "upcoming"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              Upcoming ({statusCounts.upcoming})
            </button>
            <button
              onClick={() => setFilterStatus("past")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "past"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              Past ({statusCounts.past})
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "all"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              All ({statusCounts.all})
            </button>
          </div>
        </div>

        {/* Rentals List */}
        <div className="space-y-[24px]">
          {filteredRentals.map((rental) => (
            <div key={rental.id} className="bg-white border border-[rgba(0,0,0,0.08)]">
              <div className="p-[24px]">
                <div className="flex gap-[24px]">
                  {/* Property Image */}
                  <div className="w-[200px] h-[150px] flex-shrink-0 overflow-hidden bg-neutral-light-gray">
                    <ImageWithFallback
                      src={rental.propertyImage}
                      alt={rental.propertyTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Property Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-[12px]">
                      <div>
                        <h3 className="text-neutral-black text-[20px] font-bold mb-[4px]">
                          {rental.propertyTitle}
                        </h3>
                        <div className="flex items-center gap-[6px] text-neutral-gray text-[14px]">
                          <MapPin className="w-[14px] h-[14px]" />
                          <span>{rental.propertyAddress}</span>
                        </div>
                      </div>
                      <span
                        className={`px-[16px] py-[6px] text-[13px] font-bold uppercase tracking-[0.05em] ${
                          rental.status === "current"
                            ? "bg-accent-blue/10 text-accent-blue"
                            : rental.status === "upcoming"
                            ? "bg-brand-light text-brand-primary"
                            : "bg-neutral-gray/10 text-neutral-gray"
                        }`}
                      >
                        {rental.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-[24px] mb-[16px]">
                      {/* Tenant Info */}
                      <div className="flex items-start gap-[12px]">
                        <div className="w-[48px] h-[48px] bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[16px] font-bold">
                            {rental.tenantAvatar}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-neutral-black text-[14px] font-bold mb-[4px]">
                            {rental.tenantName}
                          </div>
                          <div className="flex items-center gap-[4px] text-neutral-gray text-[12px] mb-[2px]">
                            <Mail className="w-[12px] h-[12px]" />
                            <span className="truncate">{rental.tenantEmail}</span>
                          </div>
                          <div className="flex items-center gap-[4px] text-neutral-gray text-[12px]">
                            <Phone className="w-[12px] h-[12px]" />
                            <span>{rental.tenantPhone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rental Details */}
                      <div className="space-y-[8px]">
                        <div className="flex items-center justify-between text-[14px]">
                          <span className="text-neutral-gray">Monthly Rent:</span>
                          <span className="text-neutral-black font-bold">
                            €{rental.monthlyRent.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[14px]">
                          <span className="text-neutral-gray">Deposit:</span>
                          <span className="text-neutral-black font-bold">
                            €{rental.deposit.toLocaleString()}
                          </span>
                        </div>
                        {rental.totalEarned && (
                          <div className="flex items-center justify-between text-[14px]">
                            <span className="text-neutral-gray">Total Earned:</span>
                            <span className="text-accent-blue font-bold">
                              €{rental.totalEarned.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates and Actions */}
                    <div className="flex items-center justify-between pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                      <div className="flex items-center gap-[24px]">
                        <div className="flex items-center gap-[8px]">
                          <Calendar className="w-[16px] h-[16px] text-neutral-gray" />
                          <span className="text-neutral-gray text-[14px]">
                            {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                          </span>
                        </div>
                        {rental.daysRemaining !== undefined && (
                          <div className="flex items-center gap-[8px]">
                            <Clock className="w-[16px] h-[16px] text-brand-primary" />
                            <span className="text-brand-primary text-[14px] font-semibold">
                              {rental.daysRemaining} days remaining
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-[8px]">
                        <Link
                          to={`/landlord/inbox`}
                          className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors"
                        >
                          <MessageSquare className="w-[14px] h-[14px]" />
                          Message
                        </Link>
                        <button className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors">
                          <FileText className="w-[14px] h-[14px]" />
                          View Contract
                        </button>
                        <button className="flex items-center gap-[8px] px-[16px] py-[8px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors">
                          <Download className="w-[14px] h-[14px]" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredRentals.length === 0 && (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[64px] text-center">
              <Key className="w-[48px] h-[48px] text-neutral-gray mx-auto mb-[16px]" />
              <h3 className="text-neutral-black text-[18px] font-bold mb-[8px]">
                No {filterStatus !== "all" ? filterStatus : ""} rentals
              </h3>
              <p className="text-neutral-gray text-[14px]">
                {filterStatus === "current" && "You don't have any active rentals at the moment"}
                {filterStatus === "upcoming" && "You don't have any upcoming rentals scheduled"}
                {filterStatus === "past" && "You don't have any past rental records"}
                {filterStatus === "all" && "You don't have any rental records yet"}
              </p>
            </div>
          )}
        </div>
      </main>
    </LandlordPortalLayout>
  );
}