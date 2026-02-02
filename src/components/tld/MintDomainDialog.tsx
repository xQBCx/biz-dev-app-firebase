import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MintDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tldId: string;
}

const categories = [
  { value: "trades", label: "Trades & Industries" },
  { value: "tech", label: "Technology" },
  { value: "health", label: "Health & Wellness" },
  { value: "transport", label: "Vehicles & Transport" },
  { value: "realestate", label: "Real Estate" },
  { value: "communications", label: "Communications" },
  { value: "premium", label: "Premium Brand" },
  { value: "other", label: "Other" },
];

export function MintDomainDialog({
  open,
  onOpenChange,
  tldId,
}: MintDomainDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    domain_name: "",
    category: "other",
    price_usd: "",
    is_internal: true,
    is_premium: false,
  });

  // Fetch TLD info for full domain display
  const { data: tld } = useQuery({
    queryKey: ["tld", tldId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("owned_tlds")
        .select("tld_name")
        .eq("id", tldId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const createDomain = useMutation({
    mutationFn: async () => {
      const domainName = formData.domain_name.toLowerCase().replace(/\s+/g, "");
      const fullDomain = `${domainName}.${tld?.tld_name}`;

      const { error } = await supabase.from("tld_registered_domains").insert({
        tld_id: tldId,
        domain_name: domainName,
        full_domain: fullDomain,
        owner_type: formData.is_internal ? "internal" : "available",
        owner_user_id: formData.is_internal ? user?.id : null,
        status: formData.is_internal ? "allocated" : "available",
        category: formData.category,
        price_usd: formData.price_usd ? parseFloat(formData.price_usd) : null,
        price_xdk: formData.price_usd ? parseFloat(formData.price_usd) : null, // 1:1 XDK ratio
        is_premium: formData.is_premium,
        pricing_tier: formData.is_premium ? "ultra_premium" : "standard",
        registration_date: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tld-domains"] });
      queryClient.invalidateQueries({ queryKey: ["tld-domain-stats"] });
      toast.success("Domain registered successfully!");
      onOpenChange(false);
      setFormData({
        domain_name: "",
        category: "other",
        price_usd: "",
        is_internal: true,
        is_premium: false,
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("unique")) {
        toast.error("Domain already exists");
      } else {
        toast.error("Failed to register domain", { description: error.message });
      }
    },
  });

  const fullDomainPreview = formData.domain_name
    ? `${formData.domain_name.toLowerCase().replace(/\s+/g, "")}.${tld?.tld_name || ""}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Register New Domain</DialogTitle>
          <DialogDescription>
            Create a new second-level domain under your TLD
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="domain_name">Domain Name *</Label>
            <Input
              id="domain_name"
              placeholder="e.g., roofing"
              value={formData.domain_name}
              onChange={(e) =>
                setFormData({ ...formData, domain_name: e.target.value })
              }
            />
            {fullDomainPreview && (
              <p className="text-sm text-primary font-medium">
                {fullDomainPreview}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Internal Use</Label>
              <p className="text-xs text-muted-foreground">
                Allocate to your own business (free)
              </p>
            </div>
            <Switch
              checked={formData.is_internal}
              onCheckedChange={(v) =>
                setFormData({ ...formData, is_internal: v })
              }
            />
          </div>

          {!formData.is_internal && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Premium Domain</Label>
                  <p className="text-xs text-muted-foreground">
                    High-value brand name ($1M+)
                  </p>
                </div>
                <Switch
                  checked={formData.is_premium}
                  onCheckedChange={(v) =>
                    setFormData({ ...formData, is_premium: v })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder={formData.is_premium ? "10000000" : "500"}
                  value={formData.price_usd}
                  onChange={(e) =>
                    setFormData({ ...formData, price_usd: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  XDK price will be set to same value (1:1 ratio)
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createDomain.mutate()}
            disabled={!formData.domain_name || createDomain.isPending}
          >
            {createDomain.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Register Domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
