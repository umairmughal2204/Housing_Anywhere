import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth-context";
import { BrandLogo } from "./brand-logo";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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
    return null;
  }

  return <>{children}</>;
}
