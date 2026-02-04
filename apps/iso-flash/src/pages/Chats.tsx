import { BottomNav } from "@/components/BottomNav";
import { MessageSquare, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function Chats() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sessions = [] } = useQuery({
    queryKey: ["user-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("sessions")
        .select("*, photographer:profiles!photographer_id(*), client:profiles!client_id(*), messages(content, created_at)")
        .or(`client_id.eq.${user.id},photographer_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
      </header>


      {/* Conversations List */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((session: any) => {
              const otherPerson = user?.id === session.client_id ? session.photographer : session.client;
              const lastMessage = session.messages?.[session.messages.length - 1];
              
              return (
                <div
                  key={session.id}
                  onClick={() => navigate(`/chat/${session.id}`)}
                  className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary">
                          {otherPerson?.full_name?.[0] || "U"}
                        </span>
                      </div>
                      {session.status === "active" && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-card animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold truncate">{otherPerson?.full_name || "User"}</p>
                        {otherPerson?.rating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 text-warning fill-warning" />
                            <span>{otherPerson.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content || session.location_name || "New session"}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground capitalize">
                        {session.status}
                      </span>
                      {session.status === "active" && (
                        <div className="px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-medium">
                          Active
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-2">No messages yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Send a Flash signal to connect with nearby photographers
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
