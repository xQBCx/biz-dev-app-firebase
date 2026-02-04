import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TechSidebar } from "@/components/TechSidebar";
import { useToast } from "@/hooks/use-toast";

export default function Tech() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        // Check if user is admin
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminRole) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Check if user is a field technician
        const { data: membership } = await supabase
          .from("organization_members")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "field_technician")
          .maybeSingle();

        if (membership) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        toast({
          title: "Access Denied",
          description: "You don't have field technician privileges",
          variant: "destructive",
        });
        navigate("/");
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <TechSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Field Tech</h1>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}