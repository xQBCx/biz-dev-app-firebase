import { Home, Users, Package, DollarSign, Globe, Building, User, LayoutDashboard, Workflow, Mail, CreditCard, Store, FileCheck, Gift, Plug, Zap, Shield, FileText, Activity } from "lucide-react";
import { NavLink } from "react-router-dom";
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
    label: "XODIAK Platform",
    items: [
      { path: "/xodiak", label: "XODIAK", icon: Zap },
      { path: "/xodiak/erp", label: "XODIAK ERP", icon: LayoutDashboard },
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
      { path: "/business-cards", label: "Cards", icon: CreditCard },
      { path: "/franchises", label: "Franchises", icon: Store },
      { path: "/my-applications", label: "Applications", icon: FileCheck },
    ]
  },
  {
    label: "Tools & Services",
    items: [
      { path: "/tools", label: "Tasks", icon: Package },
      { path: "/activity", label: "Activity", icon: Activity },
      { path: "/messages", label: "Messages", icon: Mail },
      { path: "/ai-gift-cards", label: "AI Gift Cards", icon: Gift },
      { path: "/social", label: "Network", icon: Users },
      { path: "/integrations", label: "Integrations", icon: Plug },
      { path: "/funding", label: "Funding", icon: DollarSign },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
                {group.items.map((item) => {
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
