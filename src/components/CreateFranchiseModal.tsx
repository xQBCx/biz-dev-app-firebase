import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface CreateFranchiseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateFranchiseModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateFranchiseModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    brand_name: "",
    description: "",
    industry: "",
    investment_min: "",
    investment_max: "",
    franchise_fee: "",
    royalty_fee_percent: "",
    training_duration_weeks: "",
    territories_available: "",
    year_established: "",
    website: "",
    contact_email: "",
    contact_phone: "",
    support_provided: "",
  });

  const industries = [
    "Food & Beverage",
    "Retail",
    "Health & Fitness",
    "Education & Training",
    "Home Services",
    "Automotive",
    "Real Estate",
    "Technology",
    "Hospitality",
    "Professional Services",
  ];

  const createFranchise = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("franchises").insert({
        user_id: user.id,
        name: data.name,
        brand_name: data.brand_name,
        description: data.description,
        industry: data.industry,
        investment_min: parseFloat(data.investment_min),
        investment_max: parseFloat(data.investment_max),
        franchise_fee: parseFloat(data.franchise_fee),
        royalty_fee_percent: data.royalty_fee_percent ? parseFloat(data.royalty_fee_percent) : null,
        training_provided: true,
        training_duration_weeks: data.training_duration_weeks ? parseInt(data.training_duration_weeks) : null,
        territories_available: data.territories_available ? parseInt(data.territories_available) : 0,
        year_established: data.year_established ? parseInt(data.year_established) : null,
        website: data.website,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        support_provided: data.support_provided,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Franchise listing created! It will be reviewed and published soon.");
      setFormData({
        name: "",
        brand_name: "",
        description: "",
        industry: "",
        investment_min: "",
        investment_max: "",
        franchise_fee: "",
        royalty_fee_percent: "",
        training_duration_weeks: "",
        territories_available: "",
        year_established: "",
        website: "",
        contact_email: "",
        contact_phone: "",
        support_provided: "",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create franchise listing");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFranchise.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Franchise Listing</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Franchise Name *</Label>
              <Input
                id="name"
                placeholder="Your Franchise"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name *</Label>
              <Input
                id="brand_name"
                placeholder="Brand Display Name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your franchise opportunity..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_established">Year Established</Label>
              <Input
                id="year_established"
                type="number"
                placeholder="2020"
                value={formData.year_established}
                onChange={(e) => setFormData({ ...formData, year_established: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment_min">Min Investment *</Label>
              <Input
                id="investment_min"
                type="number"
                placeholder="50000"
                value={formData.investment_min}
                onChange={(e) => setFormData({ ...formData, investment_min: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment_max">Max Investment *</Label>
              <Input
                id="investment_max"
                type="number"
                placeholder="150000"
                value={formData.investment_max}
                onChange={(e) => setFormData({ ...formData, investment_max: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="franchise_fee">Franchise Fee *</Label>
              <Input
                id="franchise_fee"
                type="number"
                placeholder="25000"
                value={formData.franchise_fee}
                onChange={(e) => setFormData({ ...formData, franchise_fee: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="royalty_fee_percent">Royalty Fee %</Label>
              <Input
                id="royalty_fee_percent"
                type="number"
                step="0.1"
                placeholder="5.0"
                value={formData.royalty_fee_percent}
                onChange={(e) => setFormData({ ...formData, royalty_fee_percent: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training_duration_weeks">Training Duration (weeks)</Label>
              <Input
                id="training_duration_weeks"
                type="number"
                placeholder="4"
                value={formData.training_duration_weeks}
                onChange={(e) => setFormData({ ...formData, training_duration_weeks: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="territories_available">Territories Available</Label>
              <Input
                id="territories_available"
                type="number"
                placeholder="10"
                value={formData.territories_available}
                onChange={(e) => setFormData({ ...formData, territories_available: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="support_provided">Ongoing Support</Label>
            <Textarea
              id="support_provided"
              placeholder="Describe the ongoing support you provide..."
              rows={3}
              value={formData.support_provided}
              onChange={(e) => setFormData({ ...formData, support_provided: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://..."
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email *</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="contact@example.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createFranchise.isPending}>
              {createFranchise.isPending ? "Creating..." : "Create Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
