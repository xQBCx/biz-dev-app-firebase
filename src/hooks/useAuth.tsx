import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useActiveClient } from "@/hooks/useActiveClient";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { clearActiveClient } = useActiveClient();

  useEffect(() => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.error("Auth check timed out after 10 seconds");
      setLoading(false);
    }, 10000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        clearTimeout(timeout);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error getting session:", error);
        } else {
          console.log("Got session:", session?.user?.email);
        }
        clearTimeout(timeout);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to get session:", error);
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    clearActiveClient();
    // Clear local state immediately
    setUser(null);
    setSession(null);
    // Sign out from Supabase (global scope signs out all tabs/devices)
    await supabase.auth.signOut({ scope: 'global' });
    // Navigate to auth page directly to avoid race conditions
    navigate("/auth");
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
};
