import { Toaster } from "@/components/ui/toaster";
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
import React, { Suspense } from "react";

const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const AcceptInvite = React.lazy(() => import("./pages/AcceptInvite"));
const VerifyIdentity = React.lazy(() => import("./pages/VerifyIdentity"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const CreateEntity = React.lazy(() => import("./pages/CreateEntity"));
const Launchpad = React.lazy(() => import("./pages/Launchpad"));
const Social = React.lazy(() => import("./pages/Social"));
const Tools = React.lazy(() => import("./pages/Tools"));
const ERPSetup = React.lazy(() => import("./pages/ERPSetup"));
const Directory = React.lazy(() => import("./pages/Directory"));
const Funding = React.lazy(() => import("./pages/Funding"));
const CRM = React.lazy(() => import("./pages/CRM"));
const Integrations = React.lazy(() => import("./pages/Integrations"));
const Messages = React.lazy(() => import("./pages/Messages"));
const BusinessCards = React.lazy(() => import("./pages/BusinessCards"));
const Franchises = React.lazy(() => import("./pages/Franchises"));
const MyApplications = React.lazy(() => import("./pages/MyApplications"));
const AIGiftCards = React.lazy(() => import("./pages/AIGiftCards"));
const AIProviderPortal = React.lazy(() => import("./pages/AIProviderPortal"));
const AIAdminApprovals = React.lazy(() => import("./pages/AIAdminApprovals"));
const ProviderDashboard = React.lazy(() => import("./pages/ProviderDashboard"));
const RedeemCard = React.lazy(() => import("./pages/RedeemCard"));
const PaymentSuccess = React.lazy(() => import("./pages/PaymentSuccess"));
const ClaimGiftCard = React.lazy(() => import("./pages/ClaimGiftCard"));
const AdminGiftCardsPricing = React.lazy(() => import("./pages/AdminGiftCardsPricing"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const CommercialStudio = React.lazy(() => import("./pages/CommercialStudio"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const AdminPanelUnified = React.lazy(() => import("./pages/AdminPanelUnified"));
const Profile = React.lazy(() => import("./pages/Profile"));
const CRMContactNew = React.lazy(() => import("./pages/CRMContactNew"));
const CRMContactDetail = React.lazy(() => import("./pages/CRMContactDetail"));
const CRMCompanyNew = React.lazy(() => import("./pages/CRMCompanyNew"));
const CRMDealNew = React.lazy(() => import("./pages/CRMDealNew"));
const CRMDealDetail = React.lazy(() => import("./pages/CRMDealDetail"));
const CRMIntegrations = React.lazy(() => import("./pages/CRMIntegrations"));
const ERPDashboard = React.lazy(() => import("./pages/ERPDashboard"));
const MCPAdmin = React.lazy(() => import("./pages/MCPAdmin"));
const AutomationLogs = React.lazy(() => import("./pages/admin/AutomationLogs"));
const AIUsageDashboard = React.lazy(() => import("./pages/admin/AIUsageDashboard"));
const Clients = React.lazy(() => import("./pages/Clients"));
const ClientReports = React.lazy(() => import("./pages/ClientReports"));
const ClientPortal = React.lazy(() => import("./pages/ClientPortal"));
const UserManagement = React.lazy(() => import("./pages/UserManagement"));
const TeamInvitations = React.lazy(() => import("./pages/TeamInvitations"));
const RequireRole = React.lazy(() => import("./components/auth/RequireRole"));
const RequirePermission = React.lazy(() => import("./components/auth/RequirePermission"));
const DefaultLanding = React.lazy(() => import("./components/auth/DefaultLanding"));
const Workflows = React.lazy(() => import("./pages/Workflows"));
const XodiakDashboard = React.lazy(() => import("./pages/XodiakDashboard"));
const ERP = React.lazy(() => import("./pages/ERP"));
const XBuilderx = React.lazy(() => import("./pages/XBuilderx"));
const XBuilderxDashboard = React.lazy(() => import("./pages/XBuilderxDashboard"));
const XBuilderxDiscovery = React.lazy(() => import("./pages/XBuilderxDiscovery"));
const XBuilderxEngineering = React.lazy(() => import("./pages/XBuilderxEngineering"));
const XBuilderxEstimating = React.lazy(() => import("./pages/XBuilderxEstimating"));
const XBuilderxPipeline = React.lazy(() => import("./pages/XBuilderxPipeline"));
const XBuilderxConstruction = React.lazy(() => import("./pages/XBuilderxConstruction"));
const XodiakAssets = React.lazy(() => import("./pages/XodiakAssets"));
const XodiakCompliance = React.lazy(() => import("./pages/XodiakCompliance"));
const ActivityDashboard = React.lazy(() => import("./pages/ActivityDashboard"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const Credits = React.lazy(() => import("./pages/Credits"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const SchedulingSettings = React.lazy(() => import("./pages/SchedulingSettings"));
const SmartSchedule = React.lazy(() => import("./pages/SmartSchedule"));
const Portfolio = React.lazy(() => import("./pages/Portfolio"));
const PortfolioCompanyNew = React.lazy(() => import("./pages/PortfolioCompanyNew"));
const PortfolioCompanyDetail = React.lazy(() => import("./pages/PortfolioCompanyDetail"));
const ThemeHarvester = React.lazy(() => import("./pages/ThemeHarvester"));
const TrueOdds = React.lazy(() => import("./pages/TrueOdds"));
const TrueOddsExplore = React.lazy(() => import("./pages/TrueOddsExplore"));
const TrueOddsMarket = React.lazy(() => import("./pages/TrueOddsMarket"));
const TrueOddsMyPicks = React.lazy(() => import("./pages/TrueOddsMyPicks"));
const TrueOddsSignals = React.lazy(() => import("./pages/TrueOddsSignals"));
const TrueOddsPlayerResearch = React.lazy(() => import("./pages/TrueOddsPlayerResearch"));
const AppStore = React.lazy(() => import("./pages/AppStore"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const MarketplaceListings = React.lazy(() => import("./pages/MarketplaceListings"));
const MarketplaceMarketers = React.lazy(() => import("./pages/MarketplaceMarketers"));
const MarketplaceCreateListing = React.lazy(() => import("./pages/MarketplaceCreateListing"));
const MarketplaceCreateMarketer = React.lazy(() => import("./pages/MarketplaceCreateMarketer"));
const MarketplaceListingDetail = React.lazy(() => import("./pages/MarketplaceListingDetail"));
const MarketplaceDashboard = React.lazy(() => import("./pages/MarketplaceDashboard"));
const MarketplaceConnectionDetail = React.lazy(() => import("./pages/MarketplaceConnectionDetail"));
const MyApps = React.lazy(() => import("./pages/MyApps"));
const WhiteLabelPortal = React.lazy(() => import("./pages/WhiteLabelPortal"));
const Earnings = React.lazy(() => import("./pages/Earnings"));
const IPLaunch = React.lazy(() => import("./pages/IPLaunch"));
const IPLaunchPatentStart = React.lazy(() => import("./pages/IPLaunchPatentStart"));
const IPLaunchTrademarkStart = React.lazy(() => import("./pages/IPLaunchTrademarkStart"));
const IPLaunchDashboard = React.lazy(() => import("./pages/IPLaunchDashboard"));
const IPApplicationDetail = React.lazy(() => import("./pages/IPApplicationDetail"));
const IPLaunchVault = React.lazy(() => import("./pages/IPLaunchVault"));
const SocialMediaManager = React.lazy(() => import("./pages/SocialMediaManager"));
const InfinityForceGridOS = React.lazy(() => import("./pages/InfinityForceGridOS"));
const WebsiteBuilder = React.lazy(() => import("./pages/WebsiteBuilder"));
const GeneratedWebsite = React.lazy(() => import("./pages/GeneratedWebsite"));
const GridTopology = React.lazy(() => import("./pages/GridTopology"));
const GridGeneration = React.lazy(() => import("./pages/GridGeneration"));
const GridMetering = React.lazy(() => import("./pages/GridMetering"));
const GridDemandResponse = React.lazy(() => import("./pages/GridDemandResponse"));
const GridEvents = React.lazy(() => import("./pages/GridEvents"));
const GridStorage = React.lazy(() => import("./pages/GridStorage"));
const GridMarket = React.lazy(() => import("./pages/GridMarket"));
const GridSCADA = React.lazy(() => import("./pages/GridSCADA"));
const GridAnalytics = React.lazy(() => import("./pages/GridAnalytics"));
const GridROSE = React.lazy(() => import("./pages/GridROSE"));
const DriveByIntelligence = React.lazy(() => import("./pages/DriveByIntelligence"));
const ResearchStudio = React.lazy(() => import("./pages/ResearchStudio"));
const NotebookDetail = React.lazy(() => import("./pages/NotebookDetail"));
const ProspectPage = React.lazy(() => import("./pages/ProspectPage"));
const ProspectManager = React.lazy(() => import("./pages/ProspectManager"));
const ERPGenerator = React.lazy(() => import("./pages/ERPGenerator"));
const ERPViewer = React.lazy(() => import("./pages/ERPViewer"));
const ServiceOfferings = React.lazy(() => import("./pages/ServiceOfferings"));
const StoreLaunch = React.lazy(() => import("./pages/StoreLaunch"));
const StoreLaunchNew = React.lazy(() => import("./pages/StoreLaunchNew"));
const StoreLaunchProject = React.lazy(() => import("./pages/StoreLaunchProject"));
const StoreLaunchFeatures = React.lazy(() => import("./pages/StoreLaunchFeatures"));
const StoreLaunchRevenue = React.lazy(() => import("./pages/StoreLaunchRevenue"));
const StoreLaunchAccounts = React.lazy(() => import("./pages/StoreLaunchAccounts"));
const StoreLaunchChecklist = React.lazy(() => import("./pages/StoreLaunchChecklist"));
const Broadcast = React.lazy(() => import("./pages/Broadcast"));
const GEOTools = React.lazy(() => import("./pages/GEOTools"));
const EcosystemHub = React.lazy(() => import("./pages/EcosystemHub"));
const EcosystemOnboard = React.lazy(() => import("./pages/EcosystemOnboard"));
const Sytuation = React.lazy(() => import("./pages/Sytuation"));
const FleetIntelligence = React.lazy(() => import("./pages/FleetIntelligence"));
const BillIntelligence = React.lazy(() => import("./pages/BillIntelligence"));
const BrandCommandCenter = React.lazy(() => import("./pages/BrandCommandCenter"));
const SystemVisualization = React.lazy(() => import("./pages/SystemVisualization"));
const DealRooms = React.lazy(() => import("./pages/DealRooms"));
const DealRoomNew = React.lazy(() => import("./pages/DealRoomNew"));
const DealRoomDetail = React.lazy(() => import("./pages/DealRoomDetail"));
const DealRoomInviteAccept = React.lazy(() => import("./pages/DealRoomInviteAccept"));
const AIIntelligence = React.lazy(() => import("./pages/AIIntelligence"));
const FeatureCompleteness = React.lazy(() => import("./pages/FeatureCompleteness"));
const SystemIntelligence = React.lazy(() => import("./pages/SystemIntelligence"));
const BusinessSpawn = React.lazy(() => import("./pages/BusinessSpawn"));
const BusinessHub = React.lazy(() => import("./pages/BusinessHub"));
const MyBusinesses = React.lazy(() => import("./pages/MyBusinesses"));
const ArchiveImportsPage = React.lazy(() => import("./pages/ArchiveImportsPage"));
const XCommodityDashboard = React.lazy(() => import("./pages/XCommodityDashboard"));
const XCommodityMarketplace = React.lazy(() => import("./pages/XCommodityMarketplace"));
const BookConsultant = React.lazy(() => import("./pages/BookConsultant"));
const XCommodityDeals = React.lazy(() => import("./pages/XCommodityDeals"));
const XCommodityDealRoom = React.lazy(() => import("./pages/XCommodityDealRoom"));
const XCommodityOnboard = React.lazy(() => import("./pages/XCommodityOnboard"));
const XCommodityNewListing = React.lazy(() => import("./pages/XCommodityNewListing"));
const XCommodityProfile = React.lazy(() => import("./pages/XCommodityProfile"));
const XodiakChain = React.lazy(() => import("./pages/XodiakChain"));
const ContributionDashboard = React.lazy(() => import("./pages/ContributionDashboard"));
const XodiakAnchorDashboard = React.lazy(() => import("./pages/XodiakAnchorDashboard"));
const CreditsDashboard = React.lazy(() => import("./pages/CreditsDashboard"));
const ContributionsPage = React.lazy(() => import("./pages/ContributionsPage"));
const RiskCenter = React.lazy(() => import("./pages/RiskCenter"));
const RiskRegister = React.lazy(() => import("./pages/RiskRegister"));
const PersonalCorporation = React.lazy(() => import("./pages/PersonalCorporation"));
const GrowthInstruments = React.lazy(() => import("./pages/GrowthInstruments"));
const CreatorStudio = React.lazy(() => import("./pages/CreatorStudio"));
const CreditsHub = React.lazy(() => import("./pages/CreditsHub"));
const TalentNetwork = React.lazy(() => import("./pages/TalentNetwork"));
const BizDevNews = React.lazy(() => import("./pages/BizDevNews"));
const NewsPublic = React.lazy(() => import("./pages/NewsPublic"));
const NewsArticlePage = React.lazy(() => import("./pages/NewsArticlePage"));
const BdSrvsHome = React.lazy(() => import("./pages/BdSrvsHome"));
const BdSrvsAbout = React.lazy(() => import("./pages/BdSrvsAbout"));
const BdSrvsServices = React.lazy(() => import("./pages/BdSrvsServices"));
const BdSrvsContact = React.lazy(() => import("./pages/BdSrvsContact"));
const QBCStudio = React.lazy(() => import("./pages/QBCStudio"));
const QBCPublicHome = React.lazy(() => import("./pages/QBCPublicHome"));
const QBCPublicGenerator = React.lazy(() => import("./pages/QBCPublicGenerator"));
const QBCPublicDocs = React.lazy(() => import("./pages/QBCPublicDocs"));
const QBCPublicPricing = React.lazy(() => import("./pages/QBCPublicPricing"));
const QBCPublicAbout = React.lazy(() => import("./pages/QBCPublicAbout"));
const PromptLibrary = React.lazy(() => import("./pages/PromptLibrary"));
const CRMCompanyDetailPage = React.lazy(() => import("./pages/CRMCompanyDetailPage"));
const OpportunityDiscovery = React.lazy(() => import("./pages/OpportunityDiscovery"));
const ProposalGenerator = React.lazy(() => import("./pages/ProposalGenerator"));
const PartnerPortalPage = React.lazy(() => import("./pages/PartnerPortal"));
const PartnerManagement = React.lazy(() => import("./pages/PartnerManagement"));
const PartnerOnboarding = React.lazy(() => import("./pages/PartnerOnboarding"));
const PartnerTeamInvite = React.lazy(() => import("./pages/PartnerTeamInvite"));
const XStayDashboard = React.lazy(() => import("./pages/XStayDashboard"));
const InitiativeArchitect = React.lazy(() => import("./pages/InitiativeArchitect"));
const InitiativeDetail = React.lazy(() => import("./pages/InitiativeDetail"));
const XEvents = React.lazy(() => import("./pages/XEvents"));
const XEventNew = React.lazy(() => import("./pages/XEventNew"));
const XEventDetail = React.lazy(() => import("./pages/XEventDetail"));
const XEventPublic = React.lazy(() => import("./pages/XEventPublic"));
const XEventCheckin = React.lazy(() => import("./pages/XEventCheckin"));
const ArchetypeSelection = React.lazy(() => import("./pages/ArchetypeSelection"));
const EROS = React.lazy(() => import("./pages/EROS"));
const ErosIncidentDetail = React.lazy(() => import("./pages/ErosIncidentDetail"));
const ErosResponderProfile = React.lazy(() => import("./pages/ErosResponderProfile"));
const TradingCommand = React.lazy(() => import("./pages/TradingCommand"));
const TradingExecution = React.lazy(() => import("./pages/TradingExecution"));
const WorkforceContinuum = React.lazy(() => import("./pages/WorkforceContinuum"));
const TLDRegistry = React.lazy(() => import("./pages/TLDRegistry"));
const DomainMarketplace = React.lazy(() => import("./pages/DomainMarketplace"));
const CapitalFormation = React.lazy(() => import("./pages/CapitalFormation"));
const AgentMarketplace = React.lazy(() => import("./components/agents/AgentMarketplace"));
const WorkflowBuilder = React.lazy(() => import("./components/workflow/WorkflowBuilder"));
const WorkflowTemplatesLibrary = React.lazy(() => import("./components/workflow/WorkflowTemplatesLibrary"));
const CreditAllocationManager = React.lazy(() => import("./components/credits/CreditAllocationManager"));
const DealRoomDetailPage = React.lazy(() => import("./components/deal-room/DealRoomDetailPage"));
const AgentRunHistory = React.lazy(() => import("./components/agent/AgentRunHistory"));
const ProactiveNotificationsCenter = React.lazy(() => import("./components/notifications/ProactiveNotificationsCenter"));
const TaskIntelligenceDashboard = React.lazy(() => import("./components/task-intelligence/TaskIntelligenceDashboard"));
const AgentOrchestrationHub = React.lazy(() => import("./components/orchestration/AgentOrchestrationHub"));
const UserAIPreferencesPanel = React.lazy(() => import("./components/preferences/UserAIPreferencesPanel"));
const FormulationReviewPanel = React.lazy(() => import("./components/formulation/FormulationReviewPanel"));
const EntityEmbeddingsVisualizer = React.lazy(() => import("./components/embeddings/EntityEmbeddingsVisualizer"));
const CrossModuleLinksManager = React.lazy(() => import("./components/links/CrossModuleLinksManager"));
const AgentMemoryPanel = React.lazy(() => import("./components/memory/AgentMemoryPanel"));
const FleetAnalyticsDashboard = React.lazy(() => import("./components/fleet/FleetAnalyticsDashboard"));
const AISecurityEventsMonitor = React.lazy(() => import("./components/security/AISecurityEventsMonitor"));
const ModelGovernancePanel = React.lazy(() => import("./components/security/ModelGovernancePanel"));
const ThreatIntelligenceDashboard = React.lazy(() => import("./components/security/ThreatIntelligenceDashboard"));

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
    <Suspense fallback={<LoaderFullScreen />}>
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
    </Suspense>
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
            <Suspense fallback={<LoaderFullScreen />}>
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
            </Suspense>
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
