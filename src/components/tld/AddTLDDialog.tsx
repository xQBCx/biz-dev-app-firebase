import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddTLDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTLDDialog({ open, onOpenChange }: AddTLDDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tld_name: "",
    provider: "freename",
    blockchain_network: "polygon",
    token_id: "",
    owner_wallet_address: "",
    acquisition_date: new Date().toISOString().split("T")[0],
    acquisition_cost_usd: "",
  });

  const createTLD = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("owned_tlds").insert({
        tld_name: formData.tld_name.toLowerCase().replace(/^\./, ""),
        display_name: `.${formData.tld_name.toLowerCase().replace(/^\./, "")}`,
        provider: formData.provider,
        blockchain_network: formData.blockchain_network || null,
        token_id: formData.token_id || null,
        owner_wallet_address: formData.owner_wallet_address || null,
        owner_user_id: user?.id,
        acquisition_date: formData.acquisition_date || null,
        acquisition_cost_usd: formData.acquisition_cost_usd
          ? parseFloat(formData.acquisition_cost_usd)
          : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owned-tlds"] });
      toast.success("TLD added successfully!");
      onOpenChange(false);
      setFormData({
        tld_name: "",
        provider: "freename",
        blockchain_network: "polygon",
        token_id: "",
        owner_wallet_address: "",
        acquisition_date: new Date().toISOString().split("T")[0],
        acquisition_cost_usd: "",
      });
    },
    onError: (error: any) => {
      toast.error("Failed to add TLD", { description: error.message });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New TLD</DialogTitle>
          <DialogDescription>
            Register a Top-Level Domain you've acquired to start managing it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tld_name">TLD Name *</Label>
            <Input
              id="tld_name"
              placeholder="e.g., globalnet"
              value={formData.tld_name}
              onChange={(e) =>
                setFormData({ ...formData, tld_name: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Enter without the leading dot
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(v) => setFormData({ ...formData, provider: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freename">Freename</SelectItem>
                  <SelectItem value="unstoppable">Unstoppable Domains</SelectItem>
                  <SelectItem value="ens">ENS</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Blockchain Network</Label>
              <Select
                value={formData.blockchain_network}
                onValueChange={(v) =>
                  setFormData({ ...formData, blockchain_network: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="bsc">BSC</SelectItem>
                  <SelectItem value="aurora">Aurora</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token_id">NFT Token ID</Label>
            <Input
              id="token_id"
              placeholder="Token ID from the blockchain"
              value={formData.token_id}
              onChange={(e) =>
                setFormData({ ...formData, token_id: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet">Owner Wallet Address</Label>
            <Input
              id="wallet"
              placeholder="0x..."
              value={formData.owner_wallet_address}
              onChange={(e) =>
                setFormData({ ...formData, owner_wallet_address: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Acquisition Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.acquisition_date}
                onChange={(e) =>
                  setFormData({ ...formData, acquisition_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Acquisition Cost (USD)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
                value={formData.acquisition_cost_usd}
                onChange={(e) =>
                  setFormData({ ...formData, acquisition_cost_usd: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createTLD.mutate()}
            disabled={!formData.tld_name || createTLD.isPending}
          >
            {createTLD.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add TLD
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
