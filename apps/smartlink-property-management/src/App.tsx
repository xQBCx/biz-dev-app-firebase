import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EnvironmentBanner } from "@/components/layout/EnvironmentBanner";
import Index from "./pages/Index";
import About from "./pages/About";
import WhoWeManage from "./pages/WhoWeManage";
import SmartLinkOS from "./pages/SmartLinkOS";
import PartnerWithUs from "./pages/PartnerWithUs";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import FutureVision from "./pages/FutureVision";
import ComingSoon from "./pages/ComingSoon";
import PublicAcademy from "./pages/Academy";
import OperationalExcellence from "./pages/academy/OperationalExcellence";
import EmergingMarkets from "./pages/academy/EmergingMarkets";
import OwnerLessons from "./pages/academy/OwnerLessons";
import LeadershipMatters from "./pages/academy/LeadershipMatters";
import JobApplication from "./pages/JobApplication";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { OSLayout } from "./components/layout/OSLayout";
import Dashboard from "./pages/os/Dashboard";
import Operations from "./pages/os/Operations";
import FrontDesk from "./pages/os/FrontDesk";
import Housekeeping from "./pages/os/Housekeeping";
import Maintenance from "./pages/os/Maintenance";
import RoomMaintenance from "./pages/os/RoomMaintenance";
import Onboarding from "./pages/os/Onboarding";
import Academy from "./pages/os/Academy";
import Team from "./pages/os/Team";
import COMS from "./pages/os/COMS";
import Settings from "./pages/os/Settings";
import Reports from "./pages/os/Reports";
import Schedule from "./pages/os/Schedule";
import Inventory from "./pages/os/Inventory";
import PublicForms from "./pages/os/PublicForms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <EnvironmentBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/who-we-manage" element={<WhoWeManage />} />
          <Route path="/smartlink-os" element={<SmartLinkOS />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:jobId" element={<JobApplication />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/future-vision" element={<FutureVision />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/academy" element={<PublicAcademy />} />
          <Route path="/academy/operational-excellence" element={<OperationalExcellence />} />
          <Route path="/academy/emerging-markets" element={<EmergingMarkets />} />
          <Route path="/academy/owner-lessons" element={<OwnerLessons />} />
          <Route path="/academy/leadership-matters" element={<LeadershipMatters />} />
          
          {/* OS Routes - Authentication Disabled */}
          <Route path="/os" element={<OSLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="operations" element={<Operations />} />
            <Route path="operations/public-forms" element={<PublicForms />} />
            <Route path="frontdesk" element={<FrontDesk />} />
            <Route path="housekeeping" element={<Housekeeping />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="maintenance/room/:roomId" element={<RoomMaintenance />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="academy" element={<Academy />} />
            <Route path="team" element={<Team />} />
            <Route path="coms" element={<COMS />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
