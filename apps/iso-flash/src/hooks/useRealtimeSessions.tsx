import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useRealtimeSessions(userId: string | undefined) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    // Listen for sessions as photographer
    const photographerChannel = supabase
      .channel('photographer-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `photographer_id=eq.${userId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["photographer-sessions", userId] });
        }
      )
      .subscribe();

    // Listen for sessions as client
    const clientChannel = supabase
      .channel('client-sessions')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `client_id=eq.${userId}`
        },
        (payload: any) => {
          // If session just became active, notify and navigate
          if (payload.new.status === 'active' && payload.old.status === 'pending') {
            toast.success("Flasher accepted! Opening chat...", {
              description: "Your session is now active"
            });
            
            setTimeout(() => {
              navigate(`/chat/${payload.new.id}`);
            }, 1000);
          }
          
          queryClient.invalidateQueries({ queryKey: ["user-sessions", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(photographerChannel);
      supabase.removeChannel(clientChannel);
    };
  }, [userId, queryClient, navigate]);
}
