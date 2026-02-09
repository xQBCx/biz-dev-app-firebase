import { useState, useEffect } from "react";
import { supabase } from "packages/supabase-client/src";
import { useAuth } from "@/contexts/AuthContext";

export interface ConsentSession {
  id: string;
  initiator_id: string;
  partner_id: string | null;
  status: "pending" | "verified" | "expired" | "revoked";
  initiated_at: string;
  verified_at: string | null;
  expires_at: string;
  revoked_at: string | null;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface SessionWithProfiles extends ConsentSession {
  initiator?: {
    full_name: string | null;
  };
  partner?: {
    full_name: string | null;
  };
}

export const useConsentSessions = () => {
  const [sessions, setSessions] = useState<SessionWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("consent_sessions")
      .select(`
        *,
        initiator:profiles!consent_sessions_initiator_id_fkey(full_name),
        partner:profiles!consent_sessions_partner_id_fkey(full_name)
      `)
      .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching sessions:", error);
      setIsLoading(false);
      return;
    }
    
    setSessions(data as SessionWithProfiles[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  // Subscribe to realtime updates for consent sessions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('consent-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consent_sessions',
        },
        async (payload) => {
          const record = payload.new as ConsentSession | null;
          const oldRecord = payload.old as ConsentSession | null;
          
          // Only refetch if this session involves the current user
          const isRelevant = 
            record?.initiator_id === user.id || 
            record?.partner_id === user.id ||
            oldRecord?.initiator_id === user.id ||
            oldRecord?.partner_id === user.id;
          
          if (isRelevant) {
            console.log('Session update detected, refetching...');
            await fetchSessions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createSession = async () => {
    if (!user) return { data: null, error: new Error("Not authenticated") };
    
    const { data, error } = await supabase
      .from("consent_sessions")
      .insert({
        initiator_id: user.id,
        status: "pending",
      })
      .select()
      .single();
    
    if (!error) {
      await fetchSessions();
    }
    
    return { data: data as ConsentSession | null, error };
  };

  const joinSession = async (shareToken: string) => {
    if (!user) return { data: null, error: new Error("Not authenticated") };
    
    // First find the session by share token
    const { data: session, error: fetchError } = await supabase
      .from("consent_sessions")
      .select("*")
      .eq("share_token", shareToken)
      .maybeSingle();
    
    if (fetchError || !session) {
      return { data: null, error: fetchError || new Error("Session not found") };
    }
    
    // Check if session is still valid
    if (session.status !== "pending") {
      return { data: null, error: new Error("Session is no longer available") };
    }
    
    if (new Date(session.expires_at) < new Date()) {
      return { data: null, error: new Error("Session has expired") };
    }
    
    if (session.initiator_id === user.id) {
      return { data: null, error: new Error("You cannot join your own session") };
    }
    
    if (session.partner_id) {
      return { data: null, error: new Error("Session already has a partner") };
    }
    
    // Update the session with the partner
    const { data: updatedSession, error: updateError } = await supabase
      .from("consent_sessions")
      .update({ partner_id: user.id })
      .eq("id", session.id)
      .select()
      .single();
    
    if (!updateError) {
      await fetchSessions();
    }
    
    return { data: updatedSession as ConsentSession | null, error: updateError };
  };

  const updateSessionStatus = async (
    sessionId: string, 
    status: "pending" | "verified" | "expired" | "revoked"
  ) => {
    const updateData: Record<string, unknown> = { status };
    
    if (status === "verified") {
      updateData.verified_at = new Date().toISOString();
    } else if (status === "revoked") {
      updateData.revoked_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from("consent_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();
    
    if (!error) {
      await fetchSessions();
    }
    
    return { data: data as ConsentSession | null, error };
  };

  const getSessionByToken = async (shareToken: string) => {
    const { data, error } = await supabase
      .from("consent_sessions")
      .select(`
        *,
        initiator:profiles!consent_sessions_initiator_id_fkey(full_name),
        partner:profiles!consent_sessions_partner_id_fkey(full_name)
      `)
      .eq("share_token", shareToken)
      .maybeSingle();
    
    return { data: data as SessionWithProfiles | null, error };
  };

  const generateShareUrl = (shareToken: string) => {
    return `${window.location.origin}/join/${shareToken}`;
  };

  return {
    sessions,
    isLoading,
    fetchSessions,
    createSession,
    joinSession,
    updateSessionStatus,
    getSessionByToken,
    generateShareUrl,
  };
};
