import { Link, useRouteError, isRouteErrorResponse } from "react-router";
import { BrandLogo } from "./brand-logo";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] px-[24px] py-[14px]">
        <Link to="/">
          <BrandLogo className="h-[52px]" />
        </Link>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-[24px] py-[48px]">
        <div className="max-w-[520px] w-full text-center">

          {/* Illustrated number */}
          <div className="flex items-center justify-center gap-[8px] mb-[32px]">
            {is404 ? (
              <>
                <span className="text-[96px] sm:text-[120px] font-extrabold tracking-[-0.04em] text-brand-primary leading-none">4</span>
                <div className="w-[72px] h-[72px] sm:w-[90px] sm:h-[90px] rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                  <Home className="w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] text-white" />
                </div>
                <span className="text-[96px] sm:text-[120px] font-extrabold tracking-[-0.04em] text-brand-primary leading-none">4</span>
              </>
            ) : (
              <div className="w-[96px] h-[96px] rounded-full bg-brand-primary-light flex items-center justify-center">
                <RefreshCw className="w-[48px] h-[48px] text-brand-primary" />
              </div>
            )}
          </div>

          {/* Text */}
          <h1 className="text-neutral-black text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] mb-[12px]">
            {is404 ? "Page not found" : "Something went wrong"}
          </h1>
          <p className="text-neutral-gray text-[15px] sm:text-[16px] leading-[1.7] mb-[36px] max-w-[400px] mx-auto">
            {is404
              ? "We couldn't find the page you're looking for. It may have been moved, deleted, or never existed."
              : "We ran into an unexpected error loading this page. Please try again or go back to the homepage."}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-[12px]">
            <Link
              to="/"
              className="inline-flex items-center gap-[8px] bg-brand-primary text-white px-[28px] py-[13px] rounded-[12px] font-semibold text-[15px] hover:bg-brand-primary-dark transition-colors"
            >
              <Home className="w-[16px] h-[16px]" />
              Go to Homepage
            </Link>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-[8px] bg-white border border-[rgba(0,0,0,0.12)] text-neutral-black px-[28px] py-[13px] rounded-[12px] font-semibold text-[15px] hover:bg-neutral-light-gray transition-colors"
            >
              <ArrowLeft className="w-[16px] h-[16px]" />
              Go Back
            </button>
          </div>

        </div>
      </div>

      {/* Footer strip */}
      <footer className="bg-white border-t border-[rgba(0,0,0,0.06)] px-[24px] py-[16px] text-center">
        <p className="text-neutral-gray text-[13px]">
          Need help?{" "}
          <Link to="/help" className="text-brand-primary font-medium hover:underline">
            Visit our Help Centre
          </Link>
        </p>
      </footer>
    </div>
  );
}
