import { Home, Users, Package, DollarSign, Globe, Building, User, LayoutDashboard, Workflow, Mail, CreditCard, Store, FileCheck, Gift, Plug, Zap, Shield, FileText, Activity, CheckSquare, Calendar, UserCog, Building2, Palette, Cpu, Search, Layers, HardHat, TrendingUp, Rocket, Tag } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
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
    label: "Business",
    items: [
      { path: "/directory", label: "Directory", icon: Building },
      { path: "/crm", label: "CRM", icon: Users },
      { path: "/portfolio", label: "Portfolio", icon: Building2 },
      { path: "/clients", label: "Clients", icon: Building },
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
      { path: "/tasks", label: "Tasks", icon: CheckSquare },
      { path: "/calendar", label: "Calendar", icon: Calendar },
      { path: "/activity", label: "Activity", icon: Activity },
      { path: "/tools", label: "Tools", icon: Package },
      { path: "/messages", label: "Messages", icon: Mail },
      { path: "/ai-gift-cards", label: "AI Gift Cards", icon: Gift },
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
  const { isAdmin } = useUserRole();

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex items-center justify-center py-4 border-b border-border">
          <img 
            src={bizdevMonogram} 
            alt="Biz Dev App" 
            className="h-10 w-10 object-contain flex-shrink-0"
          />
        </div>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!isCollapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item: any) => {
                  // Hide admin-only items from non-admins
                  if (item.adminOnly && !isAdmin) return null;
                  
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.path} end className={getNavCls}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
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
