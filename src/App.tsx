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
import Franchises from "./pages/Franchises";
import MyApplications from "./pages/MyApplications";
import AIGiftCards from "./pages/AIGiftCards";
import AIProviderPortal from "./pages/AIProviderPortal";
import AIAdminApprovals from "./pages/AIAdminApprovals";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import CRMContactNew from "./pages/CRMContactNew";
import CRMContactDetail from "./pages/CRMContactDetail";
import CRMCompanyNew from "./pages/CRMCompanyNew";
import CRMDealNew from "./pages/CRMDealNew";
import CRMIntegrations from "./pages/CRMIntegrations";
import ERPDashboard from "./pages/ERPDashboard";
import MCPAdmin from "./pages/MCPAdmin";
import Workflows from "./pages/Workflows";

const queryClient = new QueryClient();

function App() {
  return (
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
            <Route path="/erp" element={<ERPDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/mcp" element={<MCPAdmin />} />
            <Route path="/create-entity" element={<CreateEntity />} />
            <Route path="/launchpad" element={<Launchpad />} />
            <Route path="/social" element={<Social />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/erp-setup" element={<ERPSetup />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/funding" element={<Funding />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/crm/contacts/new" element={<CRMContactNew />} />
            <Route path="/crm/contacts/:id" element={<CRMContactDetail />} />
            <Route path="/crm/companies/new" element={<CRMCompanyNew />} />
            <Route path="/crm/deals/new" element={<CRMDealNew />} />
            <Route path="/crm/integrations" element={<CRMIntegrations />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/business-cards" element={<BusinessCards />} />
            <Route path="/franchises" element={<Franchises />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/ai-gift-cards" element={<AIGiftCards />} />
            <Route path="/ai-gift-cards/provider-portal" element={<AIProviderPortal />} />
            <Route path="/ai-gift-cards/admin" element={<AIAdminApprovals />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
