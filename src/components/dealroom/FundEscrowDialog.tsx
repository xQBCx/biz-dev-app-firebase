import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DollarSign, Loader2, Wallet, Zap } from "lucide-react";

interface FundEscrowDialogProps {
  dealRoomId: string;
  dealRoomName?: string;
  currentBalance?: number;
  trigger?: React.ReactNode;
}

export function FundEscrowDialog({
  dealRoomId,
  dealRoomName,
  currentBalance = 0,
  trigger,
}: FundEscrowDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [xdkConversion, setXdkConversion] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleFund = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amountNum < 10) {
      toast.error("Minimum funding amount is $10");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("escrow-fund-checkout", {
        body: {
          deal_room_id: dealRoomId,
          amount: amountNum,
          currency: "USD",
          xdk_conversion: xdkConversion,
          description: description || undefined,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe Checkout in new tab
        window.open(data.url, "_blank");
        toast.success("Redirecting to payment...", {
          description: "Complete the payment in the new tab to fund your escrow.",
        });
        setOpen(false);
        setAmount("");
        setDescription("");
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Funding error:", error);
      toast.error("Failed to initiate funding", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const projectedBalance = currentBalance + (parseFloat(amount) || 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <DollarSign className="h-4 w-4" />
            Fund Escrow
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Fund Escrow
          </DialogTitle>
          <DialogDescription>
            {dealRoomName
              ? `Add funds to the escrow for "${dealRoomName}"`
              : "Add funds to the deal room escrow wallet"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Balance Display */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <span className="font-semibold">{formatCurrency(currentBalance)}</span>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                min="10"
                step="0.01"
              />
            </div>
            <p className="text-xs text-muted-foreground">Minimum $10.00</p>
          </div>

          {/* XDK Conversion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <Label htmlFor="xdk-conversion" className="font-medium">
                  Convert to XDK
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Enable blockchain-backed settlements on XODIAK
              </p>
            </div>
            <Switch
              id="xdk-conversion"
              checked={xdkConversion}
              onCheckedChange={setXdkConversion}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="e.g., Q1 2026 retainer funding"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Projected Balance */}
          {parseFloat(amount) > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-sm font-medium">Projected Balance</span>
              <span className="font-bold text-primary">
                {formatCurrency(projectedBalance)}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleFund} disabled={isLoading || !amount}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Fund {amount ? formatCurrency(parseFloat(amount)) : "Escrow"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
