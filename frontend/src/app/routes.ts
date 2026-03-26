import { createBrowserRouter, redirect } from "react-router";
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
import { LandlordRegister } from "./pages/landlord-register";
import { LandlordAddListing } from "./pages/landlord-add-listing";
import { LandlordAddListingSection1Draft } from "./pages/landlord-add-listing-section1-draft";
import { HowItWorks } from "./pages/how-it-works";
import { Pricing } from "./pages/pricing";
import { Help } from "./pages/help";
import { Login } from "./pages/login";
import { Signup } from "./pages/signup";
import { Landlord } from "./pages/landlord";
import { Payments } from "./pages/payments";
import { Account } from "./pages/account";
import { Favorites } from "./pages/favorites";
import { ErrorBoundary } from "./components/error-boundary";
import { ProtectedRoute } from "./components/protected-route";

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
    Component: LandlordDashboard,
    ErrorBoundary,
  },
  {
    path: "/landlord/analytics",
    Component: LandlordAnalytics,
    ErrorBoundary,
  },
  {
    path: "/landlord/listings",
    Component: LandlordListings,
    ErrorBoundary,
  },
  {
    path: "/landlord/listings/add",
    Component: LandlordAddListing,
    ErrorBoundary,
  },
  {
    path: "/landlord/listings/add-section-1-draft",
    Component: LandlordAddListingSection1Draft,
    ErrorBoundary,
  },
  {
    path: "/landlord/listings/:id/edit",
    Component: LandlordAddListing,
    ErrorBoundary,
  },
  {
    path: "/landlord/rentals",
    Component: LandlordRentals,
    ErrorBoundary,
  },
  {
    path: "/landlord/signup",
    loader: () => redirect("/signup"),
    ErrorBoundary,
  },
  {
    path: "/landlord/inbox",
    Component: LandlordInbox,
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
    Component: Payment,
    ErrorBoundary,
  },
  {
    path: "/tenant/inbox",
    Component: TenantInbox,
    ErrorBoundary,
  },
  {
    path: "/tenant/applications",
    Component: TenantApplications,
    ErrorBoundary,
  },
  {
    path: "/tenant/inbox/conversation/:id",
    Component: TenantConversation,
    ErrorBoundary,
  },
  {
    path: "/payments",
    Component: Payments,
    ErrorBoundary,
  },
  {
    path: "/account",
    Component: Account,
    ErrorBoundary,
  },
  {
    path: "/favorites",
    Component: Favorites,
    ErrorBoundary,
  },
]);