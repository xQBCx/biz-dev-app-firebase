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

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddPropertyDialog({ open, onOpenChange, onSuccess }: AddPropertyDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    county: "",
    list_price: "",
    seller_name: "",
    seller_phone: "",
    seller_email: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("properties").insert({
        user_id: user.id,
        address: formData.address,
        city: formData.city || null,
        state: formData.state || null,
        zip: formData.zip || null,
        county: formData.county || null,
        list_price: formData.list_price ? parseFloat(formData.list_price) : null,
        seller_name: formData.seller_name || null,
        seller_phone: formData.seller_phone || null,
        seller_email: formData.seller_email || null,
        notes: formData.notes || null,
        status: "NEW_LEAD",
      });

      if (error) throw error;

      toast.success("Property added successfully");
      onSuccess();
      onOpenChange(false);
      setFormData({
        address: "",
        city: "",
        state: "",
        zip: "",
        county: "",
        list_price: "",
        seller_name: "",
        seller_phone: "",
        seller_email: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to add property");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
          <DialogDescription>
            Add a new property lead to your pipeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Austin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="TX"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="78701"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                placeholder="Travis"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="list_price">List Price</Label>
            <Input
              id="list_price"
              type="number"
              value={formData.list_price}
              onChange={(e) => setFormData({ ...formData, list_price: e.target.value })}
              placeholder="250000"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Seller Information</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="seller_name">Seller Name</Label>
                <Input
                  id="seller_name"
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="seller_phone">Phone</Label>
                  <Input
                    id="seller_phone"
                    value={formData.seller_phone}
                    onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                    placeholder="(512) 555-0123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seller_email">Email</Label>
                  <Input
                    id="seller_email"
                    type="email"
                    value={formData.seller_email}
                    onChange={(e) => setFormData({ ...formData, seller_email: e.target.value })}
                    placeholder="seller@email.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this property..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
