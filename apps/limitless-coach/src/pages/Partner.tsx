import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PartnerSidebar } from "@/components/PartnerSidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Partner() {
  const [loading, setLoading] = useState(true);
  const [isPartner, setIsPartner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

        // Check if user is admin first (admins can preview all portals)
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (adminRole) {
          setIsAdmin(true);
          setIsPartner(true);
          setLoading(false);
          return;
        }

        // Otherwise check for partner role
        const { data, error } = await supabase
          .from("business_members")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "partner")
          .maybeSingle();

        if (error) {
          toast({
            title: "Error",
            description: "Failed to verify partner access",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        if (!data) {
          toast({
            title: "Access Denied",
            description: "You don't have partner privileges",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsPartner(true);
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
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isPartner) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <PartnerSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Partner Dashboard</h1>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="ml-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            )}
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
