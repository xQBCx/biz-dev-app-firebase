import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HelmetProvider } from "react-helmet-async";
import { AppSidebar } from "@/components/AppSidebar";
import { Navigation } from "@/components/Navigation";
import { LoaderFullScreen } from "@/components/ui/loader";
import { GlobalChatProvider } from "@/contexts/GlobalChatContext";
import { GlobalFloatingChat } from "@/components/chat/GlobalFloatingChat";
import { useAuth } from "@/hooks/useAuth";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { useDomainRouting } from "@/hooks/useDomainRouting";
import { TermsAcceptanceDialog } from "@/components/TermsAcceptanceDialog";
import { InstinctsProvider } from "@/components/InstinctsProvider";
import { QBCScriptProvider } from "@/contexts/QBCScriptContext";
import { ImpersonationProvider } from "@/contexts/ImpersonationContext";
import { ArchetypeProvider } from "@/contexts/ArchetypeContext";
import { ImpersonationLayout } from "@/components/impersonation/ImpersonationLayout";
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const VerifyIdentity = lazy(() => import("./pages/VerifyIdentity"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateEntity = lazy(() => import("./pages/CreateEntity"));
const Launchpad = lazy(() => import("./pages/Launchpad"));
const Social = lazy(() => import("./pages/Social"));
const Tools = lazy(() => import("./pages/Tools"));
const ERPSetup = lazy(() => import("./pages/ERPSetup"));
const Directory = lazy(() => import("./pages/Directory"));
const Funding = lazy(() => import("./pages/Funding"));
const CRM = lazy(() => import("./pages/CRM"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Messages = lazy(() => import("./pages/Messages"));
const BusinessCards = lazy(() => import("./pages/BusinessCards"));
const Franchises = lazy(() => import("./pages/Franchises"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const AIGiftCards = lazy(() => import("./pages/AIGiftCards"));
const AIProviderPortal = lazy(() => import("./pages/AIProviderPortal"));
const AIAdminApprovals = lazy(() => import("./pages/AIAdminApprovals"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const RedeemCard = lazy(() => import("./pages/RedeemCard"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ClaimGiftCard = lazy(() => import("./pages/ClaimGiftCard"));
const AdminGiftCardsPricing = lazy(() => import("./pages/AdminGiftCardsPricing"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CommercialStudio = lazy(() => import("./pages/CommercialStudio"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminPanelUnified = lazy(() => import("./pages/AdminPanelUnified"));
const Profile = lazy(() => import("./pages/Profile"));
const CRMContactNew = lazy(() => import("./pages/CRMContactNew"));
const CRMContactDetail = lazy(() => import("./pages/CRMContactDetail"));
const CRMCompanyNew = lazy(() => import("./pages/CRMCompanyNew"));
const CRMDealNew = lazy(() => import("./pages/CRMDealNew"));
const CRMDealDetail = lazy(() => import("./pages/CRMDealDetail"));
const CRMIntegrations = lazy(() => import("./pages/CRMIntegrations"));
const ERPDashboard = lazy(() => import("./pages/ERPDashboard"));
const MCPAdmin = lazy(() => import("./pages/MCPAdmin"));
const AutomationLogs = lazy(() => import("./pages/admin/AutomationLogs"));
const AIUsageDashboard = lazy(() => import("./pages/admin/AIUsageDashboard"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientReports = lazy(() => import("./pages/ClientReports"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const TeamInvitations = lazy(() => import("./pages/TeamInvitations"));
import RequireRole from "./components/auth/RequireRole";
import RequirePermission from "./components/auth/RequirePermission";
import DefaultLanding from "./components/auth/DefaultLanding";
const Workflows = lazy(() => import("./pages/Workflows"));
const XodiakDashboard = lazy(() => import("./pages/XodiakDashboard"));
const ERP = lazy(() => import("./pages/ERP"));
const XBuilderx = lazy(() => import("./pages/XBuilderx"));
const XBuilderxDashboard = lazy(() => import("./pages/XBuilderxDashboard"));
const XBuilderxDiscovery = lazy(() => import("./pages/XBuilderxDiscovery"));
const XBuilderxEngineering = lazy(() => import("./pages/XBuilderxEngineering"));
const XBuilderxEstimating = lazy(() => import("./pages/XBuilderxEstimating"));
const XBuilderxPipeline = lazy(() => import("./pages/XBuilderxPipeline"));
const XBuilderxConstruction = lazy(() => import("./pages/XBuilderxConstruction"));
const XodiakAssets = lazy(() => import("./pages/XodiakAssets"));
const XodiakCompliance = lazy(() => import("./pages/XodiakCompliance"));
const ActivityDashboard = lazy(() => import("./pages/ActivityDashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Credits = lazy(() => import("./pages/Credits"));
const Calendar = lazy(() => import("./pages/Calendar"));
const SchedulingSettings = lazy(() => import("./pages/SchedulingSettings"));
const SmartSchedule = lazy(() => import("./pages/SmartSchedule"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const PortfolioCompanyNew = lazy(() => import("./pages/PortfolioCompanyNew"));
const PortfolioCompanyDetail = lazy(() => import("./pages/PortfolioCompanyDetail"));
const ThemeHarvester = lazy(() => import("./pages/ThemeHarvester"));
const TrueOdds = lazy(() => import("./pages/TrueOdds"));
const TrueOddsExplore = lazy(() => import("./pages/TrueOddsExplore"));
const TrueOddsMarket = lazy(() => import("./pages/TrueOddsMarket"));
const TrueOddsMyPicks = lazy(() => import("./pages/TrueOddsMyPicks"));
const TrueOddsSignals = lazy(() => import("./pages/TrueOddsSignals"));
const TrueOddsPlayerResearch = lazy(() => import("./pages/TrueOddsPlayerResearch"));
const AppStore = lazy(() => import("./pages/AppStore"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const MarketplaceListings = lazy(() => import("./pages/MarketplaceListings"));
const MarketplaceMarketers = lazy(() => import("./pages/MarketplaceMarketers"));
const MarketplaceCreateListing = lazy(() => import("./pages/MarketplaceCreateListing"));
const MarketplaceCreateMarketer = lazy(() => import("./pages/MarketplaceCreateMarketer"));
const MarketplaceListingDetail = lazy(() => import("./pages/MarketplaceListingDetail"));
const MarketplaceDashboard = lazy(() => import("./pages/MarketplaceDashboard"));
const MarketplaceConnectionDetail = lazy(() => import("./pages/MarketplaceConnectionDetail"));
const MyApps = lazy(() => import("./pages/MyApps"));
const WhiteLabelPortal = lazy(() => import("./pages/WhiteLabelPortal"));
const Earnings = lazy(() => import("./pages/Earnings"));
const IPLaunch = lazy(() => import("./pages/IPLaunch"));
const IPLaunchPatentStart = lazy(() => import("./pages/IPLaunchPatentStart"));
const IPLaunchTrademarkStart = lazy(() => import("./pages/IPLaunchTrademarkStart"));
const IPLaunchDashboard = lazy(() => import("./pages/IPLaunchDashboard"));
const IPApplicationDetail = lazy(() => import("./pages/IPApplicationDetail"));
const IPLaunchVault = lazy(() => import("./pages/IPLaunchVault"));
const SocialMediaManager = lazy(() => import("./pages/SocialMediaManager"));
const InfinityForceGridOS = lazy(() => import("./pages/InfinityForceGridOS"));
const WebsiteBuilder = lazy(() => import("./pages/WebsiteBuilder"));
const GeneratedWebsite = lazy(() => import("./pages/GeneratedWebsite"));
const GridTopology = lazy(() => import("./pages/GridTopology"));
const GridGeneration = lazy(() => import("./pages/GridGeneration"));
const GridMetering = lazy(() => import("./pages/GridMetering"));
const GridDemandResponse = lazy(() => import("./pages/GridDemandResponse"));
const GridEvents = lazy(() => import("./pages/GridEvents"));
const GridStorage = lazy(() => import("./pages/GridStorage"));
const GridMarket = lazy(() => import("./pages/GridMarket"));
const GridSCADA = lazy(() => import("./pages/GridSCADA"));
const GridAnalytics = lazy(() => import("./pages/GridAnalytics"));
const GridROSE = lazy(() => import("./pages/GridROSE"));
const DriveByIntelligence = lazy(() => import("./pages/DriveByIntelligence"));
const ResearchStudio = lazy(() => import("./pages/ResearchStudio"));
const NotebookDetail = lazy(() => import("./pages/NotebookDetail"));
const ProspectPage = lazy(() => import("./pages/ProspectPage"));
const ProspectManager = lazy(() => import("./pages/ProspectManager"));
const ERPGenerator = lazy(() => import("./pages/ERPGenerator"));
const ERPViewer = lazy(() => import("./pages/ERPViewer"));
const ServiceOfferings = lazy(() => import("./pages/ServiceOfferings"));
const StoreLaunch = lazy(() => import("./pages/StoreLaunch"));
const StoreLaunchNew = lazy(() => import("./pages/StoreLaunchNew"));
const StoreLaunchProject = lazy(() => import("./pages/StoreLaunchProject"));
const StoreLaunchFeatures = lazy(() => import("./pages/StoreLaunchFeatures"));
const StoreLaunchRevenue = lazy(() => import("./pages/StoreLaunchRevenue"));
const StoreLaunchAccounts = lazy(() => import("./pages/StoreLaunchAccounts"));
const StoreLaunchChecklist = lazy(() => import("./pages/StoreLaunchChecklist"));
const Broadcast = lazy(() => import("./pages/Broadcast"));
const GEOTools = lazy(() => import("./pages/GEOTools"));
const EcosystemHub = lazy(() => import("./pages/EcosystemHub"));
const EcosystemOnboard = lazy(() => import("./pages/EcosystemOnboard"));
const Sytuation = lazy(() => import("./pages/Sytuation"));
const FleetIntelligence = lazy(() => import("./pages/FleetIntelligence"));
const BillIntelligence = lazy(() => import("./pages/BillIntelligence"));
const BrandCommandCenter = lazy(() => import("./pages/BrandCommandCenter"));
const SystemVisualization = lazy(() => import("./pages/SystemVisualization"));
const DealRooms = lazy(() => import("./pages/DealRooms"));
const DealRoomNew = lazy(() => import("./pages/DealRoomNew"));
const DealRoomDetail = lazy(() => import("./pages/DealRoomDetail"));
const DealRoomInviteAccept = lazy(() => import("./pages/DealRoomInviteAccept"));
const AIIntelligence = lazy(() => import("./pages/AIIntelligence"));
const FeatureCompleteness = lazy(() => import("./pages/FeatureCompleteness"));
const SystemIntelligence = lazy(() => import("./pages/SystemIntelligence"));
const BusinessSpawn = lazy(() => import("./pages/BusinessSpawn"));
const BusinessHub = lazy(() => import("./pages/BusinessHub"));
const MyBusinesses = lazy(() => import("./pages/MyBusinesses"));
const ArchiveImportsPage = lazy(() => import("./pages/ArchiveImportsPage"));
const XCommodityDashboard = lazy(() => import("./pages/XCommodityDashboard"));
const XCommodityMarketplace = lazy(() => import("./pages/XCommodityMarketplace"));
const BookConsultant = lazy(() => import("./pages/BookConsultant"));
const XCommodityDeals = lazy(() => import("./pages/XCommodityDeals"));
const XCommodityDealRoom = lazy(() => import("./pages/XCommodityDealRoom"));
const XCommodityOnboard = lazy(() => import("./pages/XCommodityOnboard"));
const XCommodityNewListing = lazy(() => import("./pages/XCommodityNewListing"));
const XCommodityProfile = lazy(() => import("./pages/XCommodityProfile"));
const XodiakChain = lazy(() => import("./pages/XodiakChain"));
const ContributionDashboard = lazy(() => import("./pages/ContributionDashboard"));
const XodiakAnchorDashboard = lazy(() => import("./pages/XodiakAnchorDashboard"));
const CreditsDashboard = lazy(() => import("./pages/CreditsDashboard"));
const ContributionsPage = lazy(() => import("./pages/ContributionsPage"));
const RiskCenter = lazy(() => import("./pages/RiskCenter"));
const RiskRegister = lazy(() => import("./pages/RiskRegister"));
const PersonalCorporation = lazy(() => import("./pages/PersonalCorporation"));
const GrowthInstruments = lazy(() => import("./pages/GrowthInstruments"));
const CreatorStudio = lazy(() => import("./pages/CreatorStudio"));
const CreditsHub = lazy(() => import("./pages/CreditsHub"));
const TalentNetwork = lazy(() => import("./pages/TalentNetwork"));
const BizDevNews = lazy(() => import("./pages/BizDevNews"));
const NewsPublic = lazy(() => import("./pages/NewsPublic"));
const NewsArticlePage = lazy(() => import("./pages/NewsArticlePage"));
const BdSrvsHome = lazy(() => import("./pages/BdSrvsHome"));
const BdSrvsAbout = lazy(() => import("./pages/BdSrvsAbout"));
const BdSrvsServices = lazy(() => import("./pages/BdSrvsServices"));
const BdSrvsContact = lazy(() => import("./pages/BdSrvsContact"));
const QBCStudio = lazy(() => import("./pages/QBCStudio"));
const QBCPublicHome = lazy(() => import("./pages/QBCPublicHome"));
const QBCPublicGenerator = lazy(() => import("./pages/QBCPublicGenerator"));
const QBCPublicDocs = lazy(() => import("./pages/QBCPublicDocs"));
const QBCPublicPricing = lazy(() => import("./pages/QBCPublicPricing"));
const QBCPublicAbout = lazy(() => import("./pages/QBCPublicAbout"));
const PromptLibrary = lazy(() => import("./pages/PromptLibrary"));
const CRMCompanyDetailPage = lazy(() => import("./pages/CRMCompanyDetailPage"));
const OpportunityDiscovery = lazy(() => import("./pages/OpportunityDiscovery"));
const ProposalGenerator = lazy(() => import("./pages/ProposalGenerator"));
const PartnerPortalPage = lazy(() => import("./pages/PartnerPortal"));
const PartnerManagement = lazy(() => import("./pages/PartnerManagement"));
const PartnerOnboarding = lazy(() => import("./pages/PartnerOnboarding"));
const PartnerTeamInvite = lazy(() => import("./pages/PartnerTeamInvite"));
const XStayDashboard = lazy(() => import("./pages/XStayDashboard"));
const InitiativeArchitect = lazy(() => import("./pages/InitiativeArchitect"));
const InitiativeDetail = lazy(() => import("./pages/InitiativeDetail"));
const XEvents = lazy(() => import("./pages/XEvents"));
const XEventNew = lazy(() => import("./pages/XEventNew"));
const XEventDetail = lazy(() => import("./pages/XEventDetail"));
const XEventPublic = lazy(() => import("./pages/XEventPublic"));
const XEventCheckin = lazy(() => import("./pages/XEventCheckin"));
const ArchetypeSelection = lazy(() => import("./pages/ArchetypeSelection"));
const EROS = lazy(() => import("./pages/EROS"));
const ErosIncidentDetail = lazy(() => import("./pages/ErosIncidentDetail"));
const ErosResponderProfile = lazy(() => import("./pages/ErosResponderProfile"));
const TradingCommand = lazy(() => import("./pages/TradingCommand"));
const TradingExecution = lazy(() => import("./pages/TradingExecution"));
const WorkforceContinuum = lazy(() => import("./pages/WorkforceContinuum"));
const TLDRegistry = lazy(() => import("./pages/TLDRegistry"));
const DomainMarketplace = lazy(() => import("./pages/DomainMarketplace"));
const CapitalFormation = lazy(() => import("./pages/CapitalFormation"));
import '@/styles/qbc-theme.css';
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
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const { hasAcceptedTerms, loading: termsLoading, markTermsAccepted } = useTermsAcceptance();
  
  // Handle domain-based routing (e.g., bdsrvs.com -> /bdsrvs)
  useDomainRouting();

  if (loading || termsLoading) {
    return <LoaderFullScreen />;
  }

  // Public routes accessible without authentication - render without sidebar
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={isAuthenticated ? <AuthenticatedApp hasAcceptedTerms={hasAcceptedTerms} markTermsAccepted={markTermsAccepted} /> : <Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/accept-invite/:token" element={<AcceptInvite />} />
      <Route path="/deal-room-invite/:token" element={<DealRoomInviteAccept />} />
      {/* Public news routes - accessible without authentication */}
      <Route path="/news" element={<NewsPublic />} />
      <Route path="/news/article/:slug" element={<NewsArticlePage />} />
      {/* Public bdsrvs.com consulting site routes - NO SIDEBAR */}
      <Route path="/bdsrvs" element={<BdSrvsHome />} />
      <Route path="/bdsrvs/about" element={<BdSrvsAbout />} />
      <Route path="/bdsrvs/services" element={<BdSrvsServices />} />
      <Route path="/bdsrvs/contact" element={<BdSrvsContact />} />
      <Route path="/book/:slug" element={<BookConsultant />} />
      <Route path="/book/:slug/success" element={<BookConsultant />} />
      {/* Public QBC site routes - NO SIDEBAR, DARK CYBER-QUANTUM THEME */}
      <Route path="/qbc" element={<QBCPublicHome />} />
      <Route path="/qbc/generator" element={<QBCPublicGenerator />} />
      <Route path="/qbc/docs" element={<QBCPublicDocs />} />
      <Route path="/qbc/pricing" element={<QBCPublicPricing />} />
      <Route path="/qbc/about" element={<QBCPublicAbout />} />
      {/* Partner onboarding routes - page handles auth internally with redirect */}
      <Route path="/partner-onboarding/:token" element={<PartnerOnboarding />} />
      <Route path="/partner-team-invite/:token" element={<PartnerTeamInvite />} />
      {/* All other routes go to authenticated app */}
      <Route path="/*" element={isAuthenticated ? <AuthenticatedApp hasAcceptedTerms={hasAcceptedTerms} markTermsAccepted={markTermsAccepted} /> : <Auth />} />
    </Routes>
  );
};

const AuthenticatedApp = ({ hasAcceptedTerms, markTermsAccepted }: { hasAcceptedTerms: boolean | null, markTermsAccepted: () => void }) => {
  const showTermsDialog = hasAcceptedTerms === false;

  return (
    <ArchetypeProvider>
      <ImpersonationProvider>
        <InstinctsProvider>
          <GlobalChatProvider>
          <SidebarProvider>
            <ImpersonationLayout>
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navigation />
              <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<DefaultLanding />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-identity" element={<VerifyIdentity />} />
              <Route path="/dashboard" element={<RequirePermission module="dashboard"><Dashboard /></RequirePermission>} />
              <Route path="/archetype-selection" element={<ArchetypeSelection />} />
              <Route path="/erp-dashboard" element={<ERPDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route 
                path="/admin-panel" 
                element={
                  <RequireRole role="admin" redirectTo="/dashboard">
                    <AdminPanelUnified />
                  </RequireRole>
                } 
              />
              <Route 
                path="/admin/mcp" 
                element={
                  <RequireRole role="admin" redirectTo="/dashboard">
                    <MCPAdmin />
                  </RequireRole>
                } 
              />
              <Route 
                path="/admin/automation-logs" 
                element={
                  <RequireRole role="admin" redirectTo="/dashboard">
                    <AutomationLogs />
                  </RequireRole>
                } 
              />
              <Route 
                path="/admin/ai-usage" 
                element={
                  <RequireRole role="admin" redirectTo="/dashboard">
                    <AIUsageDashboard />
                  </RequireRole>
                } 
              />
              <Route path="/create-entity" element={<CreateEntity />} />
              <Route path="/news" element={<NewsPublic />} />
              <Route path="/news/article/:slug" element={<NewsArticlePage />} />
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
              <Route path="/crm/companies/:id" element={<CRMCompanyDetailPage />} />
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
              <Route path="/commercial-studio" element={<CommercialStudio />} />
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
          <Route path="/prospects" element={<ProspectManager />} />
          <Route path="/p/:slug" element={<ProspectPage />} />
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
          <Route path="/sytuation" element={<RequirePermission module="sytuation"><Sytuation /></RequirePermission>} />
          <Route path="/fleet-intelligence" element={<FleetIntelligence />} />
          <Route path="/bill-intelligence" element={<BillIntelligence />} />
          <Route path="/system-visualization" element={<SystemVisualization />} />
          <Route path="/deal-rooms" element={<RequirePermission module="deal_rooms"><DealRooms /></RequirePermission>} />
          <Route path="/deal-rooms/new" element={<RequirePermission module="deal_rooms"><DealRoomNew /></RequirePermission>} />
          <Route path="/deal-rooms/:id" element={<RequirePermission module="deal_rooms"><DealRoomDetail /></RequirePermission>} />
          <Route path="/xevents" element={<RequirePermission module="xevents"><XEvents /></RequirePermission>} />
          <Route path="/xevents/new" element={<RequirePermission module="xevents"><XEventNew /></RequirePermission>} />
          <Route path="/xevents/:id" element={<RequirePermission module="xevents"><XEventDetail /></RequirePermission>} />
          <Route path="/xevents/:id/checkin" element={<RequirePermission module="xevents"><XEventCheckin /></RequirePermission>} />
          <Route path="/e/:slug" element={<XEventPublic />} />
          <Route path="/deal-room-invite/:token" element={<DealRoomInviteAccept />} />
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
          <Route path="/risk-center" element={<RiskCenter />} />
          <Route path="/risk-register" element={<RiskRegister />} />
          <Route path="/my-corporation" element={<PersonalCorporation />} />
          <Route path="/growth-instruments" element={<GrowthInstruments />} />
          <Route path="/creator-studio" element={<CreatorStudio />} />
          <Route path="/talent-network" element={<TalentNetwork />} />
          <Route path="/biz-dev-news" element={<BizDevNews />} />
          <Route path="/qbc-studio" element={<QBCStudio />} />
          <Route path="/archive-imports/*" element={<ArchiveImportsPage />} />
          <Route path="/archive/imports/*" element={<ArchiveImportsPage />} />
          <Route path="/prompt-library" element={<PromptLibrary />} />
          <Route path="/opportunity-discovery" element={<OpportunityDiscovery />} />
          <Route path="/proposals" element={<RequirePermission module="proposal_generator"><ProposalGenerator /></RequirePermission>} />
          <Route path="/partner-portal/:token" element={<PartnerPortalPage />} />
          <Route path="/partners" element={<RequirePermission module="partner_management"><PartnerManagement /></RequirePermission>} />
          <Route path="/partner-team-invite/:token" element={<PartnerTeamInvite />} />
          <Route path="/xstay" element={<XStayDashboard />} />
          <Route path="/initiatives" element={<RequirePermission module="initiatives"><InitiativeArchitect /></RequirePermission>} />
          <Route path="/initiatives/new" element={<RequirePermission module="initiatives"><InitiativeArchitect /></RequirePermission>} />
          <Route path="/initiatives/:id" element={<RequirePermission module="initiatives"><InitiativeDetail /></RequirePermission>} />
          <Route path="/eros" element={<EROS />} />
          <Route path="/eros/incidents/:id" element={<ErosIncidentDetail />} />
          <Route path="/eros/profile" element={<ErosResponderProfile />} />
              <Route path="/trading-command" element={<TradingCommand />} />
              <Route path="/trading-command/execute" element={<TradingExecution />} />
              <Route path="/workforce" element={<WorkforceContinuum />} />
              <Route path="/capital-formation" element={<CapitalFormation />} />
              <Route path="/tld-registry" element={<RequireRole role="admin"><TLDRegistry /></RequireRole>} />
              <Route path="/domain-marketplace" element={<DomainMarketplace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
                </main>
              </div>
              <GlobalFloatingChat />
            </ImpersonationLayout>
            {showTermsDialog && <TermsAcceptanceDialog open={true} onAccepted={markTermsAccepted} />}
          </SidebarProvider>
          </GlobalChatProvider>
    </InstinctsProvider>
    </ImpersonationProvider>
    </ArchetypeProvider>
  );
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <QBCScriptProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </QBCScriptProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
