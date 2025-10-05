import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface CardTradingModalProps {
  card: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTradeComplete?: () => void;
}

export const CardTradingModal = ({
  card,
  open,
  onOpenChange,
  onTradeComplete,
}: CardTradingModalProps) => {
  const { user } = useAuth();
  const [toEmail, setToEmail] = useState("");
  const [tradePrice, setTradePrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTrade = async () => {
    if (!toEmail.trim()) {
      toast.error("Please enter recipient's email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find recipient user
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", toEmail)
        .single();

      if (!profiles) {
        toast.error("Recipient not found");
        setIsSubmitting(false);
        return;
      }

      // Create trade record
      const { error: tradeError } = await supabase.from("card_trades").insert({
        card_id: card.id,
        from_user_id: user?.id,
        to_user_id: profiles.id,
        trade_price: tradePrice ? parseFloat(tradePrice) : null,
        notes: notes,
      });

      if (tradeError) throw tradeError;

      // Update card status
      const { error: updateError } = await supabase
        .from("business_cards")
        .update({ status: "traded" })
        .eq("id", card.id);

      if (updateError) throw updateError;

      toast.success("Trade initiated successfully!");
      onOpenChange(false);
      onTradeComplete?.();
      
      // Reset form
      setToEmail("");
      setTradePrice("");
      setNotes("");
    } catch (error) {
      console.error("Trade error:", error);
      toast.error("Failed to initiate trade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trade Business Card</DialogTitle>
          <DialogDescription>
            Transfer this card to another user. This action will update the card status.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="recipient@example.com"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Trade Price (Optional)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={tradePrice}
              onChange={(e) => setTradePrice(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this trade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleTrade} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Initiate Trade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
