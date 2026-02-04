import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";
import { ProcessShowcase } from "@/components/ProcessShowcase";
import { BusinessSolutions } from "@/components/BusinessSolutions";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, []);

  return (
    <div className="min-h-screen">
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="bg-background shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      )}
      <Hero />
      <BeforeAfterShowcase />
      <ProcessShowcase />
      <Services />
      <BusinessSolutions />
      <Footer />
    </div>
  );
};

export default Index;