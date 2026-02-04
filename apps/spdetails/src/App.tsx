import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LocationProvider } from "@/contexts/LocationContext";
import Index from "./pages/Index";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import PartnerRegister from "./pages/PartnerRegister";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminPartners from "./pages/AdminPartners";
import AdminStaff from "./pages/AdminStaff";
import AdminMarketing from "./pages/AdminMarketing";
import AdminLeads from "./pages/AdminLeads";
import AdminCampaigns from "./pages/AdminCampaigns";
import AdminContent from "./pages/AdminContent";
import AdminSEO from "./pages/AdminSEO";
import AdminKnowledgeBase from "./pages/AdminKnowledgeBase";
import Partner from "./pages/Partner";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnerBookings from "./pages/PartnerBookings";
import PartnerAvailability from "./pages/PartnerAvailability";
import PartnerBilling from "./pages/PartnerBilling";
import PartnerSettings from "./pages/PartnerSettings";
import PartnerJobs from "./pages/PartnerJobs";
import PartnerStaff from "./pages/PartnerStaff";
import Staff from "./pages/Staff";
import StaffJobs from "./pages/StaffJobs";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import RatingsHistory from "./pages/RatingsHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/partner-register" element={<PartnerRegister />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ratings-history" element={<RatingsHistory />} />
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="marketing/leads" element={<AdminLeads />} />
            <Route path="marketing/campaigns" element={<AdminCampaigns />} />
            <Route path="marketing/content" element={<AdminContent />} />
            <Route path="marketing/seo" element={<AdminSEO />} />
            <Route path="marketing/knowledge" element={<AdminKnowledgeBase />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="staff" element={<AdminStaff />} />
          </Route>
          <Route path="/partner" element={<Partner />}>
            <Route index element={<PartnerDashboard />} />
            <Route path="bookings" element={<PartnerBookings />} />
            <Route path="jobs" element={<PartnerJobs />} />
            <Route path="availability" element={<PartnerAvailability />} />
            <Route path="billing" element={<PartnerBilling />} />
            <Route path="staff" element={<PartnerStaff />} />
            <Route path="settings" element={<PartnerSettings />} />
          </Route>
          <Route path="/staff" element={<Staff />}>
            <Route index element={<StaffJobs />} />
            <Route path="active" element={<StaffJobs />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </LocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
