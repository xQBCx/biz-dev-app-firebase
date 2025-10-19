import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Check, ChevronDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  is_active: boolean;
}

export const ClientSelector = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeClientId, activeClientName, setActiveClient, clearActiveClient } = useActiveClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setClients(data || []);

      // If no active client is set and there are clients, set the first one
      if (!activeClientId && data && data.length > 0) {
        setActiveClient(data[0].id, data[0].name);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setActiveClient(client.id, client.name);
    toast.success(`Switched to ${client.name}`);
  };

  const handleViewAllClients = () => {
    navigate("/clients");
  };

  const handleClearClient = () => {
    clearActiveClient();
    toast.success("Personal workspace activated");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden md:inline">
            {activeClientName || "Personal"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleClearClient}>
          <div className="flex items-center justify-between w-full">
            <span>Personal</span>
            {!activeClientId && <Check className="h-4 w-4" />}
          </div>
        </DropdownMenuItem>

        {clients.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Clients
            </DropdownMenuLabel>
            {clients.map((client) => (
              <DropdownMenuItem
                key={client.id}
                onClick={() => handleSelectClient(client)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span>{client.name}</span>
                    {client.industry && (
                      <span className="text-xs text-muted-foreground">
                        {client.industry}
                      </span>
                    )}
                  </div>
                  {activeClientId === client.id && <Check className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewAllClients}>
          <Plus className="h-4 w-4 mr-2" />
          Manage Clients
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
