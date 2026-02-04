import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VenueDetail from "./pages/VenueDetail";
import VenueDetailMock from "./pages/VenueDetailMock";
import VenueManagement from "./pages/VenueManagement";
import UserDashboard from "./pages/UserDashboard";
import ForVenues from "./pages/ForVenues";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/venue/:slug" element={<VenueDetailMock />} />
          <Route path="/venue/id/:id" element={<VenueDetail />} />
          <Route path="/manage-venues" element={<VenueManagement />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/for-venues" element={<ForVenues />} />
          <Route path="/about" element={<About />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
