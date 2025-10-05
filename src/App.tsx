import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VerifyIdentity from "./pages/VerifyIdentity";
import Dashboard from "./pages/Dashboard";
import CreateEntity from "./pages/CreateEntity";
import Launchpad from "./pages/Launchpad";
import Social from "./pages/Social";
import Tools from "./pages/Tools";
import ERPSetup from "./pages/ERPSetup";
import Directory from "./pages/Directory";
import Funding from "./pages/Funding";
import CRM from "./pages/CRM";
import Integrations from "./pages/Integrations";
import Messages from "./pages/Messages";
import BusinessCards from "./pages/BusinessCards";
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
          <Route path="/verify-identity" element={<VerifyIdentity />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-entity" element={<CreateEntity />} />
          <Route path="/launchpad" element={<Launchpad />} />
          <Route path="/social" element={<Social />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/erp-setup" element={<ERPSetup />} />
          <Route path="/directory" element={<Directory />} />
          <Route path="/funding" element={<Funding />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/business-cards" element={<BusinessCards />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
