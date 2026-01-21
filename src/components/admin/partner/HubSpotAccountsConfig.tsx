import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Building2 } from "lucide-react";

export interface HubSpotAccount {
  account_id: string;
  account_name: string;
  deal_room_id?: string;
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
                    {account.deal_room_id && ` • Deal Room: ${account.deal_room_id.slice(0, 8)}...`}
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
                placeholder="e.g., 12345678"
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
            <Label className="text-xs">Deal Room ID (optional)</Label>
            <Input
              placeholder="Link to specific deal room"
              value={newAccount.deal_room_id}
              onChange={(e) => setNewAccount({ ...newAccount, deal_room_id: e.target.value })}
            />
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
