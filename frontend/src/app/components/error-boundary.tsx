import { Link, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-[32px]">
      <div className="max-w-[600px] text-center">
        <h1 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[16px]">
          Oops! Something went wrong
        </h1>
        <p className="text-[#6B6B6B] text-[18px] mb-[32px] leading-[1.6]">
          We encountered an error loading this page. Please try again or return to the homepage.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#FF4B27] text-white px-[48px] py-[16px] font-bold hover:bg-[#E63E1C] transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
