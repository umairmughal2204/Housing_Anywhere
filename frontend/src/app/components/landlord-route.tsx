import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/auth-context";
import { BrandLogo } from "./brand-logo";

interface LandlordRouteProps {
  children: React.ReactNode;
}

export function LandlordRoute({ children }: LandlordRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9]">
        <div className="text-center">
          <div className="mb-[10px]">
            <BrandLogo className="h-[104px] mx-auto" />
          </div>
          <div className="text-[#6B6B6B] text-[14px]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (!user?.isLandlord) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
