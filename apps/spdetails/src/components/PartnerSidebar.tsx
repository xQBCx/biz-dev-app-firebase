import { LayoutDashboard, Calendar, Users, DollarSign, Settings, LogOut, MapPin, Clock } from "lucide-react";
import { NavLink } from "./NavLink";
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

const items = [
  {
    title: "Dashboard",
    url: "/partner",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings",
    url: "/partner/bookings",
    icon: Calendar,
  },
  {
    title: "Jobs",
    url: "/partner/jobs",
    icon: MapPin,
  },
  {
    title: "Availability",
    url: "/partner/availability",
    icon: Clock,
  },
  {
    title: "Billing",
    url: "/partner/billing",
    icon: DollarSign,
  },
  {
    title: "Staff",
    url: "/partner/staff",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/partner/settings",
    icon: Settings,
  },
];

export function PartnerSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, setOpen } = useSidebar();

  const handleNavClick = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Partner Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  <span>{state === "collapsed" ? "" : "Logout"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
