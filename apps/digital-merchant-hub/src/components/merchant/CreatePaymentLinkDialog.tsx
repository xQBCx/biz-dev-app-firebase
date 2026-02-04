import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  linkType: z.enum(["fixed_amount", "variable_amount", "reservation", "application_fee", "incidentals"]),
  amount: z.string().optional(),
  currency: z.string().default("USD"),
});

interface CreatePaymentLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId: string;
  onSuccess: () => void;
}

const CreatePaymentLinkDialog = ({ open, onOpenChange, merchantId, onSuccess }: CreatePaymentLinkDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    linkType: "fixed_amount",
    amount: "",
    currency: "USD",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = linkSchema.parse(formData);
      setIsLoading(true);

      // Generate a mock checkout URL (in production, this would integrate with actual processors)
      const checkoutUrl = `https://checkout.example.com/${merchantId}/${Date.now()}`;
      
      const { error } = await supabase.from("payment_links").insert({
        merchant_id: merchantId,
        link_type: validatedData.linkType,
        title: validatedData.title,
        description: validatedData.description || null,
        amount: validatedData.amount ? parseFloat(validatedData.amount) : null,
        currency: validatedData.currency,
        checkout_url: checkoutUrl,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Payment link created successfully.",
      });

      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        linkType: "fixed_amount",
        amount: "",
        currency: "USD",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create payment link",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create Payment Link</DialogTitle>
          <DialogDescription>
            Generate a new payment link for your customers
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Room Deposit"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description for this payment link"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkType">Link Type *</Label>
              <Select
                value={formData.linkType}
                onValueChange={(value) => setFormData({ ...formData, linkType: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  <SelectItem value="variable_amount">Variable Amount</SelectItem>
                  <SelectItem value="reservation">Reservation/Deposit</SelectItem>
                  <SelectItem value="application_fee">Application Fee</SelectItem>
                  <SelectItem value="incidentals">Incidentals/Add-ons</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.linkType === "fixed_amount" && (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Creating..." : "Create Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePaymentLinkDialog;