import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RequestSupport from "./pages/RequestSupport";
import FindTechnician from "./pages/FindTechnician";
import MyBookings from "./pages/MyBookings";
import JoinSession from "./pages/JoinSession";

// Admin pages
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrganizations from "./pages/AdminOrganizations";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminKnowledgeBase from "./pages/AdminKnowledgeBase";

// Operator pages
import Operator from "./pages/Operator";
import OperatorDashboard from "./pages/OperatorDashboard";
import OperatorWorkOrders from "./pages/OperatorWorkOrders";
import OperatorAssets from "./pages/OperatorAssets";
import OperatorInspections from "./pages/OperatorInspections";
import OperatorSessions from "./pages/OperatorSessions";
import OperatorSettings from "./pages/OperatorSettings";
import OperatorFabrication from "./pages/OperatorFabrication";

// Tech pages
import Tech from "./pages/Tech";
import TechToday from "./pages/TechToday";
import TechWorkOrderDetail from "./pages/TechWorkOrderDetail";

// Expert pages
import Expert from "./pages/Expert";
import ExpertQueue from "./pages/ExpertQueue";
import ExpertSession from "./pages/ExpertSession";

// Shared
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/request-support" element={<RequestSupport />} />
          <Route path="/find-technician" element={<FindTechnician />} />
          <Route path="/join/:sessionId" element={<JoinSession />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />

          {/* Dashboard redirect */}
          <Route path="/dashboard" element={<Navigate to="/operator" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="organizations" element={<AdminOrganizations />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="knowledge" element={<AdminKnowledgeBase />} />
          </Route>

          {/* Operator Routes */}
          <Route path="/operator" element={<Operator />}>
            <Route index element={<OperatorDashboard />} />
            <Route path="work-orders" element={<OperatorWorkOrders />} />
            <Route path="assets" element={<OperatorAssets />} />
            <Route path="inspections" element={<OperatorInspections />} />
            <Route path="sessions" element={<OperatorSessions />} />
            <Route path="fabrication" element={<OperatorFabrication />} />
            <Route path="settings" element={<OperatorSettings />} />
          </Route>

          {/* Field Technician Routes */}
          <Route path="/tech" element={<Tech />}>
            <Route index element={<TechToday />} />
            <Route path="today" element={<TechToday />} />
            <Route path="work-orders/:id" element={<TechWorkOrderDetail />} />
          </Route>

          {/* Remote Expert Routes */}
          <Route path="/expert" element={<Expert />}>
            <Route index element={<ExpertQueue />} />
            <Route path="queue" element={<ExpertQueue />} />
            <Route path="sessions/:id" element={<ExpertSession />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;