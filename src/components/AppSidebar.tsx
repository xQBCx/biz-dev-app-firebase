import { Home, Users, Package, DollarSign, Globe, Building, User, LayoutDashboard, Workflow, Mail, CreditCard, Store, FileCheck, Gift, Plug, Zap, Shield, FileText, Activity, CheckSquare, Calendar, UserCog, Building2, Palette, Cpu, Search, Layers, HardHat, TrendingUp, Rocket, Tag, Eye, Scale, MessageSquare, Sparkles, Car, BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
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

const navGroups = [
  {
    label: "Main",
    items: [
      { path: "/dashboard", label: "Dashboard", icon: Home },
      { path: "/erp", label: "ERP", icon: LayoutDashboard },
      { path: "/erp-generator", label: "ERP Generator", icon: Sparkles },
      { path: "/workflows", label: "Workflows", icon: Workflow },
    ]
  },
  {
    label: "xBUILDERx Platform",
    items: [
      { path: "/xbuilderx", label: "xBUILDERx Home", icon: Cpu },
      { path: "/xbuilderx/dashboard", label: "Intelligence Center", icon: LayoutDashboard },
      { path: "/xbuilderx/discovery", label: "Automated Discovery", icon: Search },
      { path: "/xbuilderx/engineering", label: "Engineering & Design", icon: Building },
      { path: "/xbuilderx/pipeline", label: "Project Pipeline", icon: Layers },
      { path: "/xbuilderx/construction", label: "Construction Lifecycle", icon: HardHat },
    ]
  },
  {
    label: "XODIAK Platform",
    items: [
      { path: "/xodiak", label: "XODIAK", icon: Zap },
      { path: "/xodiak/assets", label: "Assets", icon: DollarSign },
      { path: "/xodiak/compliance", label: "Compliance", icon: Shield },
      { path: "/xodiak/government", label: "Government", icon: Globe },
      { path: "/xodiak/contracts", label: "Contracts", icon: FileText },
    ]
  },
  {
    label: "Infinity Force Grid OS",
    items: [
      { path: "/grid-os", label: "Grid Control Center", icon: Activity },
    ]
  },
  {
    label: "Business",
    items: [
      { path: "/driveby", label: "Drive-By Intel", icon: Car },
      { path: "/directory", label: "Directory", icon: Building },
      { path: "/crm", label: "CRM", icon: Users },
      { path: "/portfolio", label: "Portfolio", icon: Building2 },
      { path: "/clients", label: "Clients", icon: Building },
      { path: "/client-portal", label: "Client Portal", icon: Eye },
      { path: "/user-management", label: "User Management", icon: Shield, adminOnly: true },
      { path: "/business-cards", label: "Cards", icon: CreditCard },
      { path: "/franchises", label: "Franchises", icon: Store },
      { path: "/my-applications", label: "Applications", icon: FileCheck },
    ]
  },
  {
    label: "Team",
    items: [
      { path: "/team/invitations", label: "Invitations", icon: Mail },
    ]
  },
  {
    label: "Tools & Services",
    items: [
      { path: "/research-studio", label: "Research Studio", icon: BookOpen },
      { path: "/website-builder", label: "Website Builder", icon: Sparkles },
      { path: "/tasks", label: "Tasks", icon: CheckSquare },
      { path: "/calendar", label: "Calendar", icon: Calendar },
      { path: "/activity", label: "Activity", icon: Activity },
      { path: "/tools", label: "Tools", icon: Package },
      { path: "/messages", label: "Messages", icon: Mail },
      { path: "/social-media", label: "Social Media Manager", icon: MessageSquare },
      { path: "/ai-gift-cards", label: "AI Gift Cards", icon: Gift },
      { path: "/iplaunch", label: "IPLaunch", icon: Scale },
      { path: "/social", label: "Network", icon: Users },
      { path: "/integrations", label: "Integrations", icon: Plug },
      { path: "/funding", label: "Funding", icon: DollarSign },
      { path: "/theme-harvester", label: "Theme Harvester", icon: Palette },
    ]
  },
  {
    label: "Ecosystem Apps",
    items: [
      { path: "/ecosystem/launchpad", label: "LaunchPad", icon: Rocket },
      { path: "/ecosystem/app-store", label: "App Store", icon: Store },
      { path: "/ecosystem/my-apps", label: "My Apps", icon: Package },
      { path: "/ecosystem/white-label", label: "White-Label Portal", icon: Tag },
      { path: "/ecosystem/earnings", label: "Earnings", icon: TrendingUp },
    ]
  },
  {
    label: "TrueOdds",
    items: [
      { path: "/trueodds", label: "Home", icon: TrendingUp },
      { path: "/trueodds/explore", label: "Explore Markets", icon: Search },
      { path: "/trueodds/my-picks", label: "My Picks", icon: CheckSquare },
      { path: "/trueodds/signals", label: "Signal Feed", icon: Activity },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { hasRole } = useUserRole();
  const { brandName } = useWhiteLabel();
  const isAdmin = hasRole('admin');

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50";

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

        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1 px-1">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 py-1">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item: any) => {
                  if (item.adminOnly && !isAdmin) return null;
                  
                  const Icon = item.icon;
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
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
