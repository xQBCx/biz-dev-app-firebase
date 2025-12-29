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
import { Building2, Check, ChevronDown, Plus, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  is_active: boolean;
  isSpawnedBusiness?: boolean;
  businessId?: string;
}

export const ClientSelector = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeClientId, activeClientName, userId, setActiveClient, clearActiveClient } = useActiveClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // If stored userId doesn't match current user, clear workspace
      if (userId && userId !== user.id) {
        clearActiveClient();
      }
      loadClients();
    } else {
      // Clear active client when user logs out
      clearActiveClient();
    }
  }, [user]);

  const loadClients = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Load clients owned by the user
      const { data: ownedClients, error: ownedError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("name");

      if (ownedError) throw ownedError;

      // Load spawned businesses to identify which clients are businesses
      const { data: spawnedBusinesses, error: businessError } = await supabase
        .from("spawned_businesses")
        .select("id, client_id")
        .eq("user_id", user.id)
        .not("client_id", "is", null);

      if (businessError) throw businessError;

      // Create a map of client_id to business_id
      const businessClientMap = new Map(
        (spawnedBusinesses || []).map(b => [b.client_id, b.id])
      );

      // Load clients the user has been granted access to
      const { data: sharedClients, error: sharedError } = await supabase
        .from("client_users")
        .select("client_id, clients(id, name, domain, industry, is_active)")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (sharedError) throw sharedError;

      // Combine owned and shared clients, marking which are spawned businesses
      const shared = (sharedClients || [])
        .map(cu => cu.clients)
        .filter(c => c && c.is_active);
      
      const allClients = [...(ownedClients || []), ...shared].map(client => ({
        ...client,
        isSpawnedBusiness: businessClientMap.has(client.id),
        businessId: businessClientMap.get(client.id)
      }));
      
      setClients(allClients);

      // If active client is set but user no longer has access, clear it
      if (activeClientId && !allClients.find(c => c.id === activeClientId)) {
        clearActiveClient();
      }
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    if (!user) return;
    setActiveClient(client.id, client.name, user.id);
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

        {clients.filter(c => c.isSpawnedBusiness).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
              <Rocket className="h-3 w-3" />
              Spawned Businesses
            </DropdownMenuLabel>
            {clients.filter(c => c.isSpawnedBusiness).map((client) => (
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

        {clients.filter(c => !c.isSpawnedBusiness).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Clients
            </DropdownMenuLabel>
            {clients.filter(c => !c.isSpawnedBusiness).map((client) => (
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
