import { LayoutDashboard, Calendar, LogOut, BarChart3, Building2, Users, Eye, Home, Briefcase, UserCog, Megaphone, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar },
  { title: "Marketing", url: "/admin/marketing", icon: Megaphone },
  { title: "Knowledge Base", url: "/admin/marketing/knowledge", icon: BookOpen },
  { title: "Partners", url: "/admin/partners", icon: Building2 },
  { title: "Staff", url: "/admin/staff", icon: Users },
];

const previewItems = [
  { title: "Customer Site", url: "/", icon: Home },
  { title: "Booking Flow", url: "/booking", icon: Calendar },
  { title: "Partner Portal", url: "/partner", icon: Briefcase },
  { title: "Staff Portal", url: "/staff", icon: UserCog },
];

export function AdminSidebar() {
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavClick = () => {
    // Close sidebar on mobile when navigating
    setOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/auth");
    }
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      onClick={handleNavClick}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <Eye className="h-3 w-3 mr-1 inline" />
            {!isCollapsed && "Preview Pages"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {previewItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      onClick={handleNavClick}
                      className="hover:bg-muted/50 flex items-center"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-2">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
