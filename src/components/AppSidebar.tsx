import { Home, Users, Package, DollarSign, Globe, Building, User, LayoutDashboard, Workflow, Mail, CreditCard, Store, FileCheck, Gift, Plug, Zap, Shield, FileText, Activity, CheckSquare, Calendar, UserCog, Building2, Palette, Cpu, Search, Layers, HardHat, TrendingUp, Rocket, Tag, Eye, Scale, MessageSquare, Sparkles, Car, BookOpen, Briefcase, Smartphone, Lock, Radio, Bot, Network, Brain } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { usePermissions, PlatformModule } from "@/hooks/usePermissions";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import bizdevMonogram from "@/assets/bizdev-monogram.png";

interface NavItem {
  path: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
  module?: PlatformModule;
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: Home, module: 'dashboard' },
      { path: "/sytuation", label: "Sytuation", icon: Brain, module: 'dashboard' },
      { path: "/erp", label: "ERP", icon: LayoutDashboard, module: 'erp' },
      { path: "/erp-generator", label: "ERP Generator", icon: Sparkles, module: 'erp' },
      { path: "/services", label: "Service Offerings", icon: Briefcase, module: 'core' },
      { path: "/workflows", label: "Workflows", icon: Workflow, module: 'workflows' },
    ]
  },
  {
    label: "xBUILDERx Platform",
    items: [
      { path: "/xbuilderx", label: "xBUILDERx Home", icon: Cpu, module: 'xbuilderx_home' },
      { path: "/xbuilderx/dashboard", label: "Intelligence Center", icon: LayoutDashboard, module: 'xbuilderx' },
      { path: "/xbuilderx/discovery", label: "Automated Discovery", icon: Search, module: 'xbuilderx_discovery' },
      { path: "/xbuilderx/engineering", label: "Engineering & Design", icon: Building, module: 'xbuilderx_engineering' },
      { path: "/xbuilderx/pipeline", label: "Project Pipeline", icon: Layers, module: 'xbuilderx_pipeline' },
      { path: "/xbuilderx/construction", label: "Construction Lifecycle", icon: HardHat, module: 'xbuilderx_construction' },
    ]
  },
  {
    label: "XODIAK Platform",
    items: [
      { path: "/xodiak", label: "XODIAK", icon: Zap, module: 'xodiak' },
      { path: "/system-visualization", label: "System Visualization", icon: Network, module: 'xodiak' },
      { path: "/xodiak/assets", label: "Assets", icon: DollarSign, module: 'xodiak_assets' },
      { path: "/xodiak/compliance", label: "Compliance", icon: Shield, module: 'xodiak_compliance' },
      { path: "/xodiak/government", label: "Government", icon: Globe, module: 'xodiak' },
      { path: "/xodiak/contracts", label: "Contracts", icon: FileText, module: 'xodiak' },
    ]
  },
  {
    label: "Infinity Force Grid OS",
    items: [
      { path: "/grid-os", label: "Grid Control Center", icon: Activity, module: 'grid_os' },
    ]
  },
  {
    label: "Business",
    items: [
      { path: "/driveby", label: "Drive-By Intel", icon: Car, module: 'crm' },
      { path: "/directory", label: "Directory", icon: Building, module: 'directory' },
      { path: "/crm", label: "CRM", icon: Users, module: 'crm' },
      { path: "/portfolio", label: "Portfolio", icon: Building2, module: 'portfolio' },
      { path: "/clients", label: "Clients", icon: Building, module: 'clients' },
      { path: "/client-portal", label: "Client Portal", icon: Eye, module: 'client_portal' },
      { path: "/user-management", label: "User Management", icon: Shield, adminOnly: true, module: 'admin' },
      { path: "/business-cards", label: "Cards", icon: CreditCard, module: 'business_cards' },
      { path: "/franchises", label: "Franchises", icon: Store, module: 'franchises' },
      { path: "/my-applications", label: "Applications", icon: FileCheck, module: 'franchise_applications' },
    ]
  },
  {
    label: "Tools & Services",
    items: [
      { path: "/research-studio", label: "Research Studio", icon: BookOpen, module: 'tools' },
      { path: "/website-builder", label: "Website Builder", icon: Sparkles, module: 'website_builder' },
      { path: "/tasks", label: "Tasks", icon: CheckSquare, module: 'tasks' },
      { path: "/calendar", label: "Calendar", icon: Calendar, module: 'calendar' },
      { path: "/activity", label: "Activity", icon: Activity, module: 'activity' },
      { path: "/tools", label: "Tools", icon: Package, module: 'tools' },
      { path: "/messages", label: "Messages", icon: Mail, module: 'messages' },
      { path: "/social-media", label: "Social Media Manager", icon: MessageSquare, module: 'social' },
      { path: "/ai-gift-cards", label: "AI Gift Cards", icon: Gift, module: 'ai_gift_cards' },
      { path: "/iplaunch", label: "IPLaunch", icon: Scale, module: 'iplaunch' },
      { path: "/broadcast", label: "UPN Broadcast", icon: Radio, module: 'network' },
      { path: "/social", label: "Network", icon: Users, module: 'network' },
      { path: "/integrations", label: "Integrations", icon: Plug, module: 'integrations' },
      { path: "/funding", label: "Funding", icon: DollarSign, module: 'funding' },
      { path: "/theme-harvester", label: "Theme Harvester", icon: Palette, module: 'theme_harvester' },
      { path: "/geo-tools", label: "GEO Tools", icon: Bot, module: 'tools' },
    ]
  },
  {
    label: "Store Launch",
    items: [
      { path: "/store-launch", label: "Overview", icon: Smartphone, module: 'launchpad' },
      { path: "/store-launch/new", label: "New App", icon: Rocket, module: 'launchpad' },
      { path: "/store-launch/accounts", label: "Developer Accounts", icon: Shield, module: 'launchpad' },
      { path: "/store-launch/revenue", label: "Revenue Share", icon: DollarSign, module: 'launchpad' },
    ]
  },
  {
    label: "Ecosystem Apps",
    items: [
      { path: "/ecosystem", label: "Ecosystem Hub", icon: Network, module: 'launchpad' },
      { path: "/ecosystem/onboard", label: "System Onboarding", icon: Plug, module: 'launchpad' },
      { path: "/ecosystem/launchpad", label: "LaunchPad", icon: Rocket, module: 'launchpad' },
      { path: "/ecosystem/app-store", label: "App Store", icon: Store, module: 'app_store' },
      { path: "/ecosystem/my-apps", label: "My Apps", icon: Package, module: 'my_apps' },
      { path: "/ecosystem/white-label", label: "White-Label Portal", icon: Tag, module: 'white_label_portal' },
      { path: "/ecosystem/earnings", label: "Earnings", icon: TrendingUp, module: 'earnings' },
    ]
  },
  {
    label: "TrueOdds",
    items: [
      { path: "/trueodds", label: "Home", icon: TrendingUp, module: 'true_odds' },
      { path: "/trueodds/explore", label: "Explore Markets", icon: Search, module: 'true_odds_explore' },
      { path: "/trueodds/my-picks", label: "My Picks", icon: CheckSquare, module: 'true_odds_picks' },
      { path: "/trueodds/signals", label: "Signal Feed", icon: Activity, module: 'true_odds_signals' },
    ]
  },
  {
    label: "Marketplace",
    items: [
      { path: "/marketplace", label: "Marketplace", icon: Store, module: 'marketplace' },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { hasRole } = useUserRole();
  const { brandName } = useWhiteLabel();
  const { hasPermission, isAdmin, isLoading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();
  const isUserAdmin = hasRole('admin');

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50";

  const handleDisabledClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info(`${label} is not available`, {
      description: "Contact your administrator to request access to this module.",
    });
  };

  const canAccessModule = (item: NavItem): boolean => {
    // Admins can access everything
    if (isAdmin || isUserAdmin) return true;
    // If no module specified, allow access
    if (!item.module) return true;
    // Check permission
    return hasPermission(item.module, 'view');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-background">
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
          <img 
            src={bizdevMonogram} 
            alt={brandName} 
            className="h-8 w-8 object-contain flex-shrink-0"
          />
          {!isCollapsed && (
            <span className="text-sm font-medium truncate">{brandName}</span>
          )}
        </div>

        {navGroups.map((group) => {
          // Check if at least one item in the group is accessible
          const hasAccessibleItems = group.items.some(item => {
            if (item.adminOnly && !isUserAdmin) return false;
            return true; // Show all items (some may be disabled)
          });

          if (!hasAccessibleItems) return null;

          return (
            <SidebarGroup key={group.label} className="py-1 px-1">
              {!isCollapsed && (
                <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-1">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => {
                    // Hide admin-only items from non-admins
                    if (item.adminOnly && !isUserAdmin) return null;
                    
                    const Icon = item.icon;
                    const canAccess = canAccessModule(item);
                    
                    if (canAccess) {
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton asChild size="sm">
                            <NavLink to={item.path} end className={getNavCls}>
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-xs">{item.label}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    }
                    
                    // Disabled state - show greyed out with lock
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton 
                          size="sm"
                          className="opacity-40 cursor-not-allowed hover:bg-transparent"
                          onClick={(e) => handleDisabledClick(e, item.label)}
                        >
                          <div className="relative">
                            <Icon className="h-3.5 w-3.5" />
                            <Lock className="h-2 w-2 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
                          </div>
                          <span className="text-xs">{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}