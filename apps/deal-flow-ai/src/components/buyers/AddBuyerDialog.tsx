import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddBuyerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddBuyerDialog({ open, onOpenChange, onSuccess }: AddBuyerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    target_counties: "",
    min_price: "",
    max_price: "",
    property_types: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("buyers").insert({
        user_id: user.id,
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        target_counties: formData.target_counties || null,
        min_price: formData.min_price ? parseFloat(formData.min_price) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price) : null,
        property_types: formData.property_types || null,
        notes: formData.notes || null,
        status: "ACTIVE",
      });

      if (error) throw error;

      toast.success("Buyer added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        target_counties: "",
        min_price: "",
        max_price: "",
        property_types: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to add buyer");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Buyer</DialogTitle>
          <DialogDescription>
            Add a cash buyer to your database
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Smith"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(512) 555-0123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="buyer@email.com"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Preferences</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="target_counties">Target Counties</Label>
                <Input
                  id="target_counties"
                  value={formData.target_counties}
                  onChange={(e) => setFormData({ ...formData, target_counties: e.target.value })}
                  placeholder="Travis, Williamson, Hays"
                />
                <p className="text-xs text-muted-foreground">Comma-separated list</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="min_price">Min Price</Label>
                  <Input
                    id="min_price"
                    type="number"
                    value={formData.min_price}
                    onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_price">Max Price</Label>
                  <Input
                    id="max_price"
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                    placeholder="500000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_types">Property Types</Label>
                <Input
                  id="property_types"
                  value={formData.property_types}
                  onChange={(e) => setFormData({ ...formData, property_types: e.target.value })}
                  placeholder="SFR, Multifamily"
                />
                <p className="text-xs text-muted-foreground">Comma-separated list</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this buyer..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Buyer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
