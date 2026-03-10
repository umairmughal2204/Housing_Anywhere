import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth-context";

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
          <div className="w-[64px] h-[64px] bg-[#FF4B27] flex items-center justify-center mx-auto mb-[24px]">
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-[#6B6B6B] text-[16px]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
