import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Building2, Loader2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface HubSpotAccount {
  account_id: string;
  account_name: string;
  deal_room_id?: string;
}

interface DealRoom {
  id: string;
  name: string;
  status: string;
}

interface ExistingAccountOption {
  account_id: string;
  account_name: string;
  used_by_count: number;
}

interface HubSpotAccountsConfigProps {
  accounts: HubSpotAccount[];
  onChange: (accounts: HubSpotAccount[]) => void;
  compact?: boolean;
}

export function HubSpotAccountsConfig({ accounts, onChange, compact }: HubSpotAccountsConfigProps) {
  const [newAccount, setNewAccount] = useState<HubSpotAccount>({
    account_id: "",
    account_name: "",
    deal_room_id: "",
  });
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [loadingDealRooms, setLoadingDealRooms] = useState(true);
  const [existingAccounts, setExistingAccounts] = useState<ExistingAccountOption[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    const fetchDealRooms = async () => {
      setLoadingDealRooms(true);
      const { data, error } = await supabase
        .from("deal_rooms")
        .select("id, name, status")
        .order("name");
      
      if (!error && data) {
        setDealRooms(data);
      }
      setLoadingDealRooms(false);
    };
    fetchDealRooms();
  }, []);

  // Fetch existing HubSpot accounts from all partner integrations
  useEffect(() => {
    const fetchExistingAccounts = async () => {
      setLoadingExisting(true);
      try {
        const { data, error } = await supabase
          .from("partner_integrations")
          .select("allowed_hubspot_accounts");

        if (!error && data) {
          // Flatten and deduplicate accounts, counting usage
          const accountMap = new Map<string, ExistingAccountOption>();
          
          data.forEach((partner) => {
            const hubspotAccounts = (partner.allowed_hubspot_accounts as unknown as HubSpotAccount[]) || [];
            hubspotAccounts.forEach((account) => {
              if (account.account_id) {
                const existing = accountMap.get(account.account_id);
                if (existing) {
                  existing.used_by_count++;
                } else {
                  accountMap.set(account.account_id, {
                    account_id: account.account_id,
                    account_name: account.account_name,
                    used_by_count: 1,
                  });
                }
              }
            });
          });

          setExistingAccounts(Array.from(accountMap.values()));
        }
      } catch (error) {
        console.error("Error fetching existing accounts:", error);
      } finally {
        setLoadingExisting(false);
      }
    };
    fetchExistingAccounts();
  }, []);

  const handleQuickAdd = (accountId: string) => {
    const existing = existingAccounts.find((a) => a.account_id === accountId);
    if (existing) {
      setNewAccount({
        account_id: existing.account_id,
        account_name: existing.account_name,
        deal_room_id: "",
      });
    }
  };

  const getDealRoomName = (dealRoomId: string | undefined) => {
    if (!dealRoomId) return null;
    const room = dealRooms.find(r => r.id === dealRoomId);
    return room?.name || dealRoomId.slice(0, 8) + "...";
  };

  const handleAddAccount = () => {
    if (!newAccount.account_id || !newAccount.account_name) return;
    
    onChange([...accounts, { ...newAccount }]);
    setNewAccount({ account_id: "", account_name: "", deal_room_id: "" });
  };

  const handleRemoveAccount = (index: number) => {
    const updated = accounts.filter((_, i) => i !== index);
    onChange(updated);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Allowed HubSpot Accounts
        </Label>
        
        {accounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {accounts.map((account, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1">
                {account.account_name} ({account.account_id})
                {account.deal_room_id && (
                  <span className="text-xs opacity-70">• {getDealRoomName(account.deal_room_id)}</span>
                )}
                <button
                  onClick={() => handleRemoveAccount(index)}
                  className="ml-1 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Portal ID"
            value={newAccount.account_id}
            onChange={(e) => setNewAccount({ ...newAccount, account_id: e.target.value })}
            className="text-sm"
          />
          <Input
            placeholder="Account Name"
            value={newAccount.account_name}
            onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAccount}
            disabled={!newAccount.account_id || !newAccount.account_name}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Find Portal ID in HubSpot → Settings → Account Defaults
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Allowed HubSpot Accounts
        </CardTitle>
        <CardDescription className="text-xs">
          Configure which HubSpot accounts this partner can route data to
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length > 0 && (
          <div className="space-y-2">
            {accounts.map((account, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium">{account.account_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Portal ID: {account.account_id}
                    {account.deal_room_id && ` • Deal Room: ${getDealRoomName(account.deal_room_id)}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAccount(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 p-3 border border-dashed rounded-md">
          <p className="text-xs font-medium text-muted-foreground">Add HubSpot Account</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Portal ID *</Label>
              <Input
                placeholder="e.g., 7005509"
                value={newAccount.account_id}
                onChange={(e) => setNewAccount({ ...newAccount, account_id: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Account Name *</Label>
              <Input
                placeholder="e.g., The View Pro"
                value={newAccount.account_name}
                onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Deal Room (optional - restricts access to specific room)</Label>
            {loadingDealRooms ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading Deal Rooms...
              </div>
            ) : (
              <Select
                value={newAccount.deal_room_id || "none"}
                onValueChange={(value) => setNewAccount({ ...newAccount, deal_room_id: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Deal Room (or leave for all rooms)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Deal Rooms (no restriction)</SelectItem>
                  {dealRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <span>{room.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {room.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddAccount}
            disabled={!newAccount.account_id || !newAccount.account_name}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
