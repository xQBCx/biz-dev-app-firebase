import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navigation } from "@/components/Navigation";
import { LoaderFullScreen } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { TermsAcceptanceDialog } from "@/components/TermsAcceptanceDialog";
import { InstinctsProvider } from "@/components/InstinctsProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AcceptInvite from "./pages/AcceptInvite";
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
import ClaimGiftCard from "./pages/ClaimGiftCard";
import AdminGiftCardsPricing from "./pages/AdminGiftCardsPricing";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import CRMContactNew from "./pages/CRMContactNew";
import CRMContactDetail from "./pages/CRMContactDetail";
import CRMCompanyNew from "./pages/CRMCompanyNew";
import CRMDealNew from "./pages/CRMDealNew";
import CRMDealDetail from "./pages/CRMDealDetail";
import CRMIntegrations from "./pages/CRMIntegrations";
import ERPDashboard from "./pages/ERPDashboard";
import MCPAdmin from "./pages/MCPAdmin";
import Clients from "./pages/Clients";
import ClientReports from "./pages/ClientReports";
import ClientPortal from "./pages/ClientPortal";
import UserManagement from "./pages/UserManagement";
import TeamInvitations from "./pages/TeamInvitations";
import RequireRole from "./components/auth/RequireRole";
import Workflows from "./pages/Workflows";
import XodiakDashboard from "./pages/XodiakDashboard";
import ERP from "./pages/ERP";
import XBuilderx from "./pages/XBuilderx";
import XBuilderxDashboard from "./pages/XBuilderxDashboard";
import XBuilderxDiscovery from "./pages/XBuilderxDiscovery";
import XBuilderxEngineering from "./pages/XBuilderxEngineering";
import XBuilderxEstimating from "./pages/XBuilderxEstimating";
import XBuilderxPipeline from "./pages/XBuilderxPipeline";
import XBuilderxConstruction from "./pages/XBuilderxConstruction";
import XodiakAssets from "./pages/XodiakAssets";
import XodiakCompliance from "./pages/XodiakCompliance";
import ActivityDashboard from "./pages/ActivityDashboard";
import Tasks from "./pages/Tasks";
import Credits from "./pages/Credits";
import Calendar from "./pages/Calendar";
import SchedulingSettings from "./pages/SchedulingSettings";
import SmartSchedule from "./pages/SmartSchedule";
import Portfolio from "./pages/Portfolio";
import PortfolioCompanyNew from "./pages/PortfolioCompanyNew";
import PortfolioCompanyDetail from "./pages/PortfolioCompanyDetail";
import ThemeHarvester from "./pages/ThemeHarvester";
import TrueOdds from "./pages/TrueOdds";
import TrueOddsExplore from "./pages/TrueOddsExplore";
import TrueOddsMarket from "./pages/TrueOddsMarket";
import TrueOddsMyPicks from "./pages/TrueOddsMyPicks";
import TrueOddsSignals from "./pages/TrueOddsSignals";
import TrueOddsPlayerResearch from "./pages/TrueOddsPlayerResearch";

import AppStore from "./pages/AppStore";
import Marketplace from "./pages/Marketplace";
import MarketplaceListings from "./pages/MarketplaceListings";
import MarketplaceMarketers from "./pages/MarketplaceMarketers";
import MarketplaceCreateListing from "./pages/MarketplaceCreateListing";
import MarketplaceCreateMarketer from "./pages/MarketplaceCreateMarketer";
import MarketplaceListingDetail from "./pages/MarketplaceListingDetail";
import MarketplaceDashboard from "./pages/MarketplaceDashboard";
import MarketplaceConnectionDetail from "./pages/MarketplaceConnectionDetail";
import MyApps from "./pages/MyApps";
import WhiteLabelPortal from "./pages/WhiteLabelPortal";
import Earnings from "./pages/Earnings";
import IPLaunch from "./pages/IPLaunch";
import IPLaunchPatentStart from "./pages/IPLaunchPatentStart";
import IPLaunchTrademarkStart from "./pages/IPLaunchTrademarkStart";
import IPLaunchDashboard from "./pages/IPLaunchDashboard";
import IPApplicationDetail from "./pages/IPApplicationDetail";
import IPLaunchVault from "./pages/IPLaunchVault";
import SocialMediaManager from "./pages/SocialMediaManager";
import InfinityForceGridOS from "./pages/InfinityForceGridOS";
import WebsiteBuilder from "./pages/WebsiteBuilder";
import GeneratedWebsite from "./pages/GeneratedWebsite";
import GridTopology from "./pages/GridTopology";
import GridGeneration from "./pages/GridGeneration";
import GridMetering from "./pages/GridMetering";
import GridDemandResponse from "./pages/GridDemandResponse";
import GridEvents from "./pages/GridEvents";
import GridStorage from "./pages/GridStorage";
import GridMarket from "./pages/GridMarket";
import GridSCADA from "./pages/GridSCADA";
import GridAnalytics from "./pages/GridAnalytics";
import GridROSE from "./pages/GridROSE";
import DriveByIntelligence from "./pages/DriveByIntelligence";
import ResearchStudio from "./pages/ResearchStudio";
import NotebookDetail from "./pages/NotebookDetail";
import ERPGenerator from "./pages/ERPGenerator";
import ERPViewer from "./pages/ERPViewer";
import ServiceOfferings from "./pages/ServiceOfferings";
import StoreLaunch from "./pages/StoreLaunch";
import StoreLaunchNew from "./pages/StoreLaunchNew";
import StoreLaunchProject from "./pages/StoreLaunchProject";
import StoreLaunchFeatures from "./pages/StoreLaunchFeatures";
import StoreLaunchRevenue from "./pages/StoreLaunchRevenue";
import StoreLaunchAccounts from "./pages/StoreLaunchAccounts";
import StoreLaunchChecklist from "./pages/StoreLaunchChecklist";
import Broadcast from "./pages/Broadcast";
import GEOTools from "./pages/GEOTools";
import EcosystemHub from "./pages/EcosystemHub";
import EcosystemOnboard from "./pages/EcosystemOnboard";
import Sytuation from "./pages/Sytuation";
import FleetIntelligence from "./pages/FleetIntelligence";
import BillIntelligence from "./pages/BillIntelligence";
import BrandCommandCenter from "./pages/BrandCommandCenter";
import SystemVisualization from "./pages/SystemVisualization";
import DealRooms from "./pages/DealRooms";
import DealRoomNew from "./pages/DealRoomNew";
import DealRoomDetail from "./pages/DealRoomDetail";
import AIIntelligence from "./pages/AIIntelligence";
import FeatureCompleteness from "./pages/FeatureCompleteness";
import SystemIntelligence from "./pages/SystemIntelligence";
import BusinessSpawn from "./pages/BusinessSpawn";
import BusinessHub from "./pages/BusinessHub";
import MyBusinesses from "./pages/MyBusinesses";
import ArchiveImportsPage from "./pages/ArchiveImportsPage";
import XCommodityDashboard from "./pages/XCommodityDashboard";
import XCommodityMarketplace from "./pages/XCommodityMarketplace";
import XCommodityDeals from "./pages/XCommodityDeals";
import XCommodityDealRoom from "./pages/XCommodityDealRoom";
import XCommodityOnboard from "./pages/XCommodityOnboard";
import XCommodityNewListing from "./pages/XCommodityNewListing";
import XCommodityProfile from "./pages/XCommodityProfile";
import XodiakChain from "./pages/XodiakChain";
import ContributionDashboard from "./pages/ContributionDashboard";
import XodiakAnchorDashboard from "./pages/XodiakAnchorDashboard";
import CreditsDashboard from "./pages/CreditsDashboard";
import ContributionsPage from "./pages/ContributionsPage";
import CreditsHub from "./pages/CreditsHub";
import { AgentMarketplace } from "./components/agents/AgentMarketplace";
import { WorkflowBuilder } from "./components/workflow/WorkflowBuilder";
import { WorkflowTemplatesLibrary } from "./components/workflow/WorkflowTemplatesLibrary";
import { CreditAllocationManager } from "./components/credits/CreditAllocationManager";
import { DealRoomDetailPage } from "./components/deal-room/DealRoomDetailPage";
import { AgentRunHistory } from "./components/agent/AgentRunHistory";
import ProactiveNotificationsCenter from "./components/notifications/ProactiveNotificationsCenter";
import { TaskIntelligenceDashboard } from "./components/task-intelligence/TaskIntelligenceDashboard";
import AgentOrchestrationHub from "./components/orchestration/AgentOrchestrationHub";
import { UserAIPreferencesPanel } from "./components/preferences/UserAIPreferencesPanel";
import { FormulationReviewPanel } from "./components/formulation/FormulationReviewPanel";
import EntityEmbeddingsVisualizer from "./components/embeddings/EntityEmbeddingsVisualizer";
import { CrossModuleLinksManager } from "./components/links/CrossModuleLinksManager";
import AgentMemoryPanel from "./components/memory/AgentMemoryPanel";
import FleetAnalyticsDashboard from "./components/fleet/FleetAnalyticsDashboard";
import AISecurityEventsMonitor from "./components/security/AISecurityEventsMonitor";
import { ModelGovernancePanel } from "./components/security/ModelGovernancePanel";
import ThreatIntelligenceDashboard from "./components/security/ThreatIntelligenceDashboard";
const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const { hasAcceptedTerms, loading: termsLoading, markTermsAccepted } = useTermsAcceptance();

  if (loading || termsLoading) {
    return <LoaderFullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
        <Route path="*" element={<Index />} />
      </Routes>
    );
  }

  if (hasAcceptedTerms === false) {
    return (
      <>
        <TermsAcceptanceDialog open={true} onAccepted={markTermsAccepted} />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Please accept the Terms of Service to continue.</p>
        </div>
      </>
    );
  }

  return (
    <InstinctsProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full overflow-x-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Navigation />
            <main className="flex-1 overflow-x-hidden">
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
              <Route path="/credits" element={<Credits />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/scheduling-settings" element={<SchedulingSettings />} />
              <Route path="/smart-schedule" element={<SmartSchedule />} />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/erp-setup" element={<ERPSetup />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/funding" element={<Funding />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/crm/contacts/new" element={<CRMContactNew />} />
              <Route path="/crm/contacts/:id" element={<CRMContactDetail />} />
              <Route path="/crm/companies/new" element={<CRMCompanyNew />} />
              <Route path="/crm/deals/new" element={<CRMDealNew />} />
              <Route path="/crm/deals/:id" element={<CRMDealDetail />} />
              <Route path="/crm/integrations" element={<CRMIntegrations />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/companies/new" element={<PortfolioCompanyNew />} />
              <Route path="/portfolio/companies/:id" element={<PortfolioCompanyDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/client-reports/:clientId" element={<ClientReports />} />
          <Route path="/client-portal" element={<ClientPortal />} />
          <Route 
            path="/user-management" 
            element={
              <RequireRole role="admin">
                <UserManagement />
              </RequireRole>
            } 
          />
          <Route 
            path="/users" 
            element={
              <RequireRole role="admin">
                <UserManagement />
              </RequireRole>
            } 
          />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/social-media" element={<SocialMediaManager />} />
              <Route path="/grid-os" element={<InfinityForceGridOS />} />
              <Route path="/grid-os/topology" element={<GridTopology />} />
              <Route path="/grid-os/generation" element={<GridGeneration />} />
              <Route path="/grid-os/metering" element={<GridMetering />} />
              <Route path="/grid-os/demand-response" element={<GridDemandResponse />} />
              <Route path="/grid-os/events" element={<GridEvents />} />
              <Route path="/grid-os/storage" element={<GridStorage />} />
              <Route path="/grid-os/market" element={<GridMarket />} />
              <Route path="/grid-os/scada" element={<GridSCADA />} />
              <Route path="/grid-os/analytics" element={<GridAnalytics />} />
              <Route path="/grid-os/rose" element={<GridROSE />} />
              <Route path="/business-cards" element={<BusinessCards />} />
              <Route path="/franchises" element={<Franchises />} />
              <Route path="/brand-command-center" element={<BrandCommandCenter />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/ai-gift-cards" element={<AIGiftCards />} />
              <Route path="/ai-gift-cards/provider-portal" element={<AIProviderPortal />} />
              <Route path="/ai-gift-cards/admin" element={<AIAdminApprovals />} />
              <Route path="/admin/gift-cards/pricing" element={<AdminGiftCardsPricing />} />
              <Route path="/provider-dashboard" element={<ProviderDashboard />} />
              <Route path="/redeem-card" element={<RedeemCard />} />
              <Route path="/claim/:claimUrl" element={<ClaimGiftCard />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/xodiak" element={<XodiakDashboard />} />
              <Route path="/xodiak/chain" element={<XodiakChain />} />
              <Route path="/erp" element={<ERP />} />
              <Route path="/xodiak/assets" element={<XodiakAssets />} />
              <Route path="/xodiak/compliance" element={<XodiakCompliance />} />
            <Route path="/xbuilderx" element={<XBuilderx />} />
            <Route path="/xbuilderx/dashboard" element={<XBuilderxDashboard />} />
            <Route path="/xbuilderx/discovery" element={<XBuilderxDiscovery />} />
            <Route path="/xbuilderx/engineering" element={<XBuilderxEngineering />} />
            <Route path="/xbuilderx/estimating/:projectId" element={<XBuilderxEstimating />} />
            <Route path="/xbuilderx/pipeline" element={<XBuilderxPipeline />} />
            <Route path="/xbuilderx/construction" element={<XBuilderxConstruction />} />
              <Route 
                path="/team/invitations" 
                element={
                  <RequireRole role="admin">
                    <TeamInvitations />
                  </RequireRole>
                } 
              />
              <Route path="/theme-harvester" element={<ThemeHarvester />} />
              <Route path="/trueodds" element={<TrueOdds />} />
              <Route path="/trueodds/explore" element={<TrueOddsExplore />} />
              <Route path="/trueodds/market/:marketId" element={<TrueOddsMarket />} />
              <Route path="/trueodds/my-picks" element={<TrueOddsMyPicks />} />
              <Route path="/trueodds/signals" element={<TrueOddsSignals />} />
              <Route path="/trueodds/players" element={<TrueOddsPlayerResearch />} />
              <Route path="/ecosystem/launchpad" element={<Launchpad />} />
              <Route path="/ecosystem/app-store" element={<AppStore />} />
              <Route path="/ecosystem/my-apps" element={<MyApps />} />
              <Route path="/ecosystem/white-label" element={<WhiteLabelPortal />} />
              <Route path="/ecosystem/earnings" element={<Earnings />} />
              <Route path="/ecosystem" element={<EcosystemHub />} />
              <Route path="/ecosystem/onboard" element={<EcosystemOnboard />} />
              <Route path="/website-builder" element={<WebsiteBuilder />} />
              <Route path="/websites/:id" element={<GeneratedWebsite />} />
              <Route path="/iplaunch" element={<IPLaunch />} />
              <Route path="/iplaunch/patent/start" element={<IPLaunchPatentStart />} />
              <Route path="/iplaunch/trademark/start" element={<IPLaunchTrademarkStart />} />
              <Route path="/iplaunch/dashboard" element={<IPLaunchDashboard />} />
              <Route path="/iplaunch/application/:id" element={<IPApplicationDetail />} />
              <Route path="/iplaunch/vault" element={<IPLaunchVault />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/listings" element={<MarketplaceListings />} />
          <Route path="/marketplace/listings/create" element={<MarketplaceCreateListing />} />
          <Route path="/marketplace/listings/:id" element={<MarketplaceListingDetail />} />
          <Route path="/marketplace/marketers" element={<MarketplaceMarketers />} />
          <Route path="/marketplace/marketer/create" element={<MarketplaceCreateMarketer />} />
          <Route path="/marketplace/dashboard" element={<MarketplaceDashboard />} />
          <Route path="/marketplace/connections/:id" element={<MarketplaceConnectionDetail />} />
          <Route path="/driveby" element={<DriveByIntelligence />} />
          <Route path="/research-studio" element={<ResearchStudio />} />
          <Route path="/research-studio/:id" element={<NotebookDetail />} />
          <Route path="/erp-generator" element={<ERPGenerator />} />
          <Route path="/erp-viewer/:id" element={<ERPViewer />} />
          <Route path="/services" element={<ServiceOfferings />} />
          <Route path="/store-launch" element={<StoreLaunch />} />
          <Route path="/store-launch/new" element={<StoreLaunchNew />} />
          <Route path="/store-launch/project/:id" element={<StoreLaunchProject />} />
          <Route path="/store-launch/project/:id/features" element={<StoreLaunchFeatures />} />
          <Route path="/store-launch/project/:projectId/checklist" element={<StoreLaunchChecklist />} />
          <Route path="/store-launch/project/:projectId/checklist/:platform" element={<StoreLaunchChecklist />} />
          <Route path="/store-launch/features" element={<StoreLaunchFeatures />} />
          <Route path="/store-launch/revenue" element={<StoreLaunchRevenue />} />
          <Route path="/store-launch/accounts" element={<StoreLaunchAccounts />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/geo-tools" element={<GEOTools />} />
          <Route path="/sytuation" element={<Sytuation />} />
          <Route path="/fleet-intelligence" element={<FleetIntelligence />} />
          <Route path="/bill-intelligence" element={<BillIntelligence />} />
          <Route path="/system-visualization" element={<SystemVisualization />} />
          <Route 
            path="/deal-rooms" 
            element={
              <RequireRole role="admin">
                <DealRooms />
              </RequireRole>
            } 
          />
          <Route 
            path="/deal-rooms/new" 
            element={
              <RequireRole role="admin">
                <DealRoomNew />
              </RequireRole>
            } 
          />
          <Route path="/deal-rooms/:id" element={<DealRoomDetail />} />
          <Route path="/ai-intelligence" element={<AIIntelligence />} />
          <Route path="/feature-completeness" element={<FeatureCompleteness />} />
          <Route path="/business-spawn" element={<BusinessSpawn />} />
          <Route path="/business/:id" element={<BusinessHub />} />
          <Route path="/my-businesses" element={<MyBusinesses />} />
          <Route path="/system-intelligence" element={<SystemIntelligence />} />
          <Route path="/contributions" element={<ContributionDashboard />} />
          <Route path="/contributions/anchoring" element={<XodiakAnchorDashboard />} />
          <Route path="/credits" element={<CreditsDashboard />} />
          <Route path="/credits-hub" element={<CreditsHub />} />
          <Route path="/xcommodity" element={<XCommodityDashboard />} />
          <Route path="/xcommodity/marketplace" element={<XCommodityMarketplace />} />
          <Route path="/xcommodity/marketplace/new" element={<XCommodityNewListing />} />
          <Route path="/xcommodity/deals" element={<XCommodityDeals />} />
          <Route path="/xcommodity/deals/:dealId" element={<XCommodityDealRoom />} />
          <Route path="/xcommodity/onboard" element={<XCommodityOnboard />} />
          <Route path="/xcommodity/profile" element={<XCommodityProfile />} />
          <Route path="/contributions" element={<ContributionsPage />} />
          <Route path="/workflow-builder" element={<WorkflowBuilder />} />
          <Route path="/workflow-templates" element={<WorkflowTemplatesLibrary />} />
          <Route path="/credit-allocation" element={<CreditAllocationManager />} />
          <Route path="/deal-room-detail" element={<DealRoomDetailPage />} />
          <Route path="/deal-room-detail/:id" element={<DealRoomDetailPage />} />
          <Route path="/agent-run-history" element={<AgentRunHistory />} />
          <Route path="/notifications" element={<ProactiveNotificationsCenter />} />
          <Route path="/task-intelligence" element={<TaskIntelligenceDashboard />} />
          <Route path="/orchestration" element={<AgentOrchestrationHub />} />
          <Route path="/ai-preferences" element={<UserAIPreferencesPanel />} />
          <Route path="/formulation-review" element={<FormulationReviewPanel />} />
          <Route path="/embeddings" element={<EntityEmbeddingsVisualizer />} />
          <Route path="/cross-links" element={<CrossModuleLinksManager />} />
          <Route path="/agent-memory" element={<AgentMemoryPanel />} />
          <Route path="/fleet-analytics" element={<FleetAnalyticsDashboard />} />
          <Route path="/security-events" element={<AISecurityEventsMonitor />} />
          <Route path="/model-governance" element={<ModelGovernancePanel />} />
          <Route path="/threat-intelligence" element={<ThreatIntelligenceDashboard />} />
          <Route path="/archive-imports" element={<ArchiveImportsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
    </InstinctsProvider>
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
