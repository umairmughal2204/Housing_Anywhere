import { createBrowserRouter, redirect } from "react-router";
import { createElement, type ComponentType } from "react";
import { Home } from "./pages/home";
import { SearchResults } from "./pages/search-results";
import { PropertyListing } from "./pages/property-listing";
import { RentalApplication } from "./pages/rental-application";
import { ApplicationSuccess } from "./pages/application-success";
import { Payment } from "./pages/payment";
import { TenantConversation } from "./pages/tenant-conversation";
import { TenantInbox } from "./pages/tenant-inbox";
import { TenantApplications } from "./pages/tenant-applications";
import { LandlordInbox } from "./pages/landlord-inbox";
import { LandlordDashboard } from "./pages/landlord-dashboard";
import { LandlordAnalytics } from "./pages/landlord-analytics";
import { LandlordListings } from "./pages/landlord-listings";
import { LandlordRentals } from "./pages/landlord-rentals";
import { LandlordCalendar } from "./pages/landlord-calendar";
import { LandlordRegister } from "./pages/landlord-register";
import { LandlordAddListing } from "./pages/landlord-add-listing";
import { LandlordListingOptions } from "./pages/landlord-listing-options";
import { HowItWorks } from "./pages/how-it-works";
import { Pricing } from "./pages/pricing";
import { Help } from "./pages/help";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { ForgotPassword } from "./pages/forgot-password";
import { ResetPassword } from "./pages/reset-password";
import { Landlord } from "./pages/landlord";
import { Payments } from "./pages/payments";
import { Account } from "./pages/account";
import { Favorites } from "./pages/favorites";
import { ErrorBoundary } from "./components/error-boundary";
import { ProtectedRoute } from "./components/protected-route";

function withProtectedRoute(Page: ComponentType) {
  return function ProtectedPage() {
    return createElement(ProtectedRoute, null, createElement(Page));
  };
}

const ProtectedLandlordDashboard = withProtectedRoute(LandlordDashboard);
const ProtectedLandlordAnalytics = withProtectedRoute(LandlordAnalytics);
const ProtectedLandlordListings = withProtectedRoute(LandlordListings);
const ProtectedLandlordAddListing = withProtectedRoute(LandlordAddListing);
const ProtectedLandlordListingOptions = withProtectedRoute(LandlordListingOptions);
const ProtectedLandlordRentals = withProtectedRoute(LandlordRentals);
const ProtectedLandlordCalendar = withProtectedRoute(LandlordCalendar);
const ProtectedLandlordInbox = withProtectedRoute(LandlordInbox);
const ProtectedTenantInbox = withProtectedRoute(TenantInbox);
const ProtectedTenantApplications = withProtectedRoute(TenantApplications);
const ProtectedTenantConversation = withProtectedRoute(TenantConversation);
const ProtectedPayments = withProtectedRoute(Payments);
const ProtectedAccount = withProtectedRoute(Account);
const ProtectedFavorites = withProtectedRoute(Favorites);
const ProtectedPropertyPayment = withProtectedRoute(Payment);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    ErrorBoundary,
  },
  {
    path: "/login",
    Component: Login,
    ErrorBoundary,
  },
  {
    path: "/signup",
    Component: Signup,
    ErrorBoundary,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
    ErrorBoundary,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
    ErrorBoundary,
  },
  {
    path: "/landlord",
    Component: Landlord,
    ErrorBoundary,
  },
  {
    path: "/landlord/register",
    Component: LandlordRegister,
    ErrorBoundary,
  },
  {
    path: "/landlord/dashboard",
    Component: ProtectedLandlordDashboard,
    ErrorBoundary,
  },
  {
    path: "/landlord/analytics",
    Component: ProtectedLandlordAnalytics,
    ErrorBoundary,
  },
  {
    path: "/landlord/listings",
    Component: ProtectedLandlordListings,
    ErrorBoundary,
  },
  {
    path: "/landlord/add-listing",
    Component: ProtectedLandlordListingOptions,
    ErrorBoundary,
  },
  {
    path: "/landlord/add-listing/:mode",
    Component: ProtectedLandlordAddListing,
    ErrorBoundary,
  },
  {
    path: "/landlord/listings/add",
    Component: ProtectedLandlordAddListing,
    ErrorBoundary,
  },
  {
    path: "/landlord/listings/:id/edit",
    Component: ProtectedLandlordAddListing,
    ErrorBoundary,
  },
  {
    path: "/landlord/rentals",
    Component: ProtectedLandlordRentals,
    ErrorBoundary,
  },
  {
    path: "/landlord/calendar",
    Component: ProtectedLandlordCalendar,
    ErrorBoundary,
  },
  {
    path: "/landlord/signup",
    loader: () => redirect("/signup"),
    ErrorBoundary,
  },
  {
    path: "/landlord/inbox",
    Component: ProtectedLandlordInbox,
    ErrorBoundary,
  },
  {
    path: "/how-it-works",
    Component: HowItWorks,
    ErrorBoundary,
  },
  {
    path: "/pricing",
    Component: Pricing,
    ErrorBoundary,
  },
  {
    path: "/help",
    Component: Help,
    ErrorBoundary,
  },
  {
    path: "/listings",
    Component: SearchResults,
    ErrorBoundary,
  },
  {
    path: "/listings/:city",
    Component: SearchResults,
    ErrorBoundary,
  },
  {
    path: "/s",
    loader: ({ request }) => {
      const url = new URL(request.url);
      return redirect(`/listings${url.search}`);
    },
    ErrorBoundary,
  },
  {
    path: "/s/:city",
    loader: ({ params, request }) => {
      const url = new URL(request.url);
      const city = params.city ? `/${params.city}` : "";
      return redirect(`/listings${city}${url.search}`);
    },
    ErrorBoundary,
  },
  {
    path: "/listing/:id",
    loader: ({ params }) => redirect(`/property/${params.id}`),
    ErrorBoundary,
  },
  {
    path: "/property/:id",
    Component: PropertyListing,
    ErrorBoundary,
  },
  {
    path: "/property/:id/apply",
    Component: RentalApplication,
    ErrorBoundary,
  },
  {
    path: "/property/:id/success",
    Component: ApplicationSuccess,
    ErrorBoundary,
  },
  {
    path: "/property/:id/payment",
    Component: ProtectedPropertyPayment,
    ErrorBoundary,
  },
  {
    path: "/tenant/inbox",
    Component: ProtectedTenantInbox,
    ErrorBoundary,
  },
  {
    path: "/tenant/applications",
    Component: ProtectedTenantApplications,
    ErrorBoundary,
  },
  {
    path: "/tenant/inbox/conversation/:id",
    Component: ProtectedTenantConversation,
    ErrorBoundary,
  },
  {
    path: "/payments",
    Component: ProtectedPayments,
    ErrorBoundary,
  },
  {
    path: "/account",
    Component: ProtectedAccount,
    ErrorBoundary,
  },
  {
    path: "/favorites",
    Component: ProtectedFavorites,
    ErrorBoundary,
  },
]);