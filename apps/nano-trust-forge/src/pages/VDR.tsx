import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";
import NDASignature from "@/components/vdr/NDASignature";
import DataRoom from "@/components/vdr/DataRoom";

const VDR = () => {
  const { dealSlug } = useParams<{ dealSlug: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch deal
  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ["deal", dealSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("slug", dealSlug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!dealSlug,
  });

  // Check investor access
  const { data: hasAccess } = useQuery({
    queryKey: ["investor-access", deal?.id, userId],
    queryFn: async () => {
      if (!deal?.id || !userId) return false;

      const { data, error } = await supabase
        .from("investor_access")
        .select("*")
        .eq("deal_id", deal.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!deal?.id && !!userId,
  });

  // Check NDA signature
  const { data: ndaSignature } = useQuery({
    queryKey: ["nda-signature", deal?.id, userId],
    queryFn: async () => {
      if (!deal?.id || !userId) return null;

      const { data, error } = await supabase
        .from("nda_signatures")
        .select("*")
        .eq("deal_id", deal.id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!deal?.id && !!userId,
  });

  if (dealLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="h-12 w-12 text-accent mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold">Deal Not Found</h2>
              <p className="text-muted-foreground">
                The requested deal does not exist or is no longer active.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You do not have permission to access this data room.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ndaSignature) {
    return <NDASignature deal={deal} userId={userId!} />;
  }

  return <DataRoom deal={deal} userId={userId!} />;
};

export default VDR;
