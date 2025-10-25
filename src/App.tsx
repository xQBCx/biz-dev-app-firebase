import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navigation } from "@/components/Navigation";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { LoaderFullScreen } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
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
import ProviderDashboard from "./pages/ProviderDashboard";
import RedeemCard from "./pages/RedeemCard";
import PaymentSuccess from "./pages/PaymentSuccess";
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
import Clients from "./pages/Clients";
import UserManagement from "./pages/UserManagement";
import Workflows from "./pages/Workflows";
import XodiakDashboard from "./pages/XodiakDashboard";
import ERP from "./pages/ERP";
import XBuilderx from "./pages/XBuilderx";
import XBuilderxDashboard from "./pages/XBuilderxDashboard";
import XBuilderxDiscovery from "./pages/XBuilderxDiscovery";
import XBuilderxEngineering from "./pages/XBuilderxEngineering";
import XBuilderxPipeline from "./pages/XBuilderxPipeline";
import XodiakAssets from "./pages/XodiakAssets";
import XodiakCompliance from "./pages/XodiakCompliance";
import ActivityDashboard from "./pages/ActivityDashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Portfolio from "./pages/Portfolio";
import PortfolioCompanyNew from "./pages/PortfolioCompanyNew";
import PortfolioCompanyDetail from "./pages/PortfolioCompanyDetail";
import TeamInvitations from "./pages/TeamInvitations";
import ThemeHarvester from "./pages/ThemeHarvester";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoaderFullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Index />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-identity" element={<VerifyIdentity />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/erp-dashboard" element={<ERPDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/mcp" element={<MCPAdmin />} />
              <Route path="/create-entity" element={<CreateEntity />} />
              <Route path="/launchpad" element={<Launchpad />} />
              <Route path="/social" element={<Social />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/activity" element={<ActivityDashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/calendar" element={<Calendar />} />
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
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/companies/new" element={<PortfolioCompanyNew />} />
              <Route path="/portfolio/companies/:id" element={<PortfolioCompanyDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/user-management" element={<UserManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/business-cards" element={<BusinessCards />} />
              <Route path="/franchises" element={<Franchises />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/ai-gift-cards" element={<AIGiftCards />} />
              <Route path="/ai-gift-cards/provider-portal" element={<AIProviderPortal />} />
              <Route path="/ai-gift-cards/admin" element={<AIAdminApprovals />} />
              <Route path="/provider-dashboard" element={<ProviderDashboard />} />
              <Route path="/redeem-card" element={<RedeemCard />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/xodiak" element={<XodiakDashboard />} />
              <Route path="/erp" element={<ERP />} />
              <Route path="/xodiak/assets" element={<XodiakAssets />} />
              <Route path="/xodiak/compliance" element={<XodiakCompliance />} />
            <Route path="/xbuilderx" element={<XBuilderx />} />
            <Route path="/xbuilderx/dashboard" element={<XBuilderxDashboard />} />
            <Route path="/xbuilderx/discovery" element={<XBuilderxDiscovery />} />
            <Route path="/xbuilderx/engineering" element={<XBuilderxEngineering />} />
            <Route path="/xbuilderx/pipeline" element={<XBuilderxPipeline />} />
              <Route path="/team/invitations" element={<TeamInvitations />} />
              <Route path="/theme-harvester" element={<ThemeHarvester />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <VoiceRecorder compact />
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
