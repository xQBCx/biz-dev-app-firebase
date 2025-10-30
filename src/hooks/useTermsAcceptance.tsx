import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useTermsAcceptance = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      if (authLoading) return;
      
      if (!user) {
        setHasAcceptedTerms(true); // Not logged in, don't show terms
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_terms_acceptance")
          .select("id")
          .eq("user_id", user.id)
          .eq("terms_version", "1.0")
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking terms acceptance:", error);
        }

        setHasAcceptedTerms(!!data);
      } catch (error) {
        console.error("Error in checkTermsAcceptance:", error);
        setHasAcceptedTerms(false);
      } finally {
        setLoading(false);
      }
    };

    checkTermsAcceptance();
  }, [user, authLoading]);

  const markTermsAccepted = () => {
    setHasAcceptedTerms(true);
  };

  return {
    hasAcceptedTerms,
    loading: loading || authLoading,
    markTermsAccepted,
  };
};
