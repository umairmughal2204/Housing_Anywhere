import { useEffect, useState } from "react";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { useAuth } from "../contexts/auth-context";
import { API_BASE } from "../config";
import { CalendarSlider } from "../components/calendar-slider";

interface Booking {
  id: string;
  propertyTitle: string;
  tenantName: string;
  moveInDate: string;
  moveOutDate: string;
  status: "pending" | "approved" | "rejected";
}

export function LandlordCalendar() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      if (!isAuthenticated || user?.role !== "landlord") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/rental-applications/landlord/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load bookings");
        }

        const payload = (await response.json()) as { bookings: Booking[] };
        setBookings(payload.bookings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, [isAuthenticated, user?.role]);

  return (
    <LandlordPortalLayout>
      <main className="flex-1 px-[20px] py-[20px] lg:px-[28px] lg:py-[24px]">
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="text-neutral-black text-[28px] font-bold tracking-[-0.03em] mb-[8px]">
            Calendar
          </h1>
          <p className="text-neutral-gray text-[14px]">
            View all your property bookings and availability
          </p>
          {error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
        </div>

        {/* Calendar */}
        <CalendarSlider bookings={bookings} isLoading={isLoading} />
      </main>
    </LandlordPortalLayout>
  );
}
