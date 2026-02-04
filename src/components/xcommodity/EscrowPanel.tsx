import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wallet, Lock, Unlock, CheckCircle, Clock, 
  ArrowRight, Shield, AlertTriangle, Loader2,
  DollarSign, FileCheck, Send
} from "lucide-react";
import { toast } from "sonner";

interface EscrowStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "completed" | "active" | "pending";
  description: string;
}

interface EscrowPanelProps {
  dealId: string;
  escrowAmount: number;
  currentStep: number;
  isBuyer: boolean;
  onDepositComplete?: () => void;
  onReleaseComplete?: () => void;
}

export function EscrowPanel({ 
  dealId, 
  escrowAmount, 
  currentStep, 
  isBuyer,
  onDepositComplete,
  onReleaseComplete
}: EscrowPanelProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState(escrowAmount.toString());

  const steps: EscrowStep[] = [
    {
      id: "deposit",
      label: "Buyer Deposit",
      icon: <DollarSign className="h-5 w-5" />,
      status: currentStep > 0 ? "completed" : currentStep === 0 ? "active" : "pending",
      description: "Buyer deposits escrow funds into smart contract"
    },
    {
      id: "verification",
      label: "POP Verification",
      icon: <FileCheck className="h-5 w-5" />,
      status: currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "pending",
      description: "Seller provides Proof of Product verification"
    },
    {
      id: "approval",
      label: "Buyer Approval",
      icon: <CheckCircle className="h-5 w-5" />,
      status: currentStep > 2 ? "completed" : currentStep === 2 ? "active" : "pending",
      description: "Buyer reviews and approves the verification"
    },
    {
      id: "release",
      label: "Release Funds",
      icon: <Send className="h-5 w-5" />,
      status: currentStep > 3 ? "completed" : currentStep === 3 ? "active" : "pending",
      description: "Escrow funds released to seller"
    }
  ];

  const connectWallet = async () => {
    setProcessing(true);
    try {
      // In production, this would use wagmi/viem for actual wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      setWalletConnected(true);
      toast.success("Wallet connected successfully");
    } catch (error) {
      toast.error("Failed to connect wallet");
    } finally {
      setProcessing(false);
    }
  };

  const depositFunds = async () => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setProcessing(true);
    try {
      // In production, this would interact with the escrow smart contract
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Funds deposited to escrow successfully!");
      if (onDepositComplete) onDepositComplete();
    } catch (error) {
      toast.error("Failed to deposit funds");
    } finally {
      setProcessing(false);
    }
  };

  const releaseFunds = async () => {
    setProcessing(true);
    try {
      // In production, this would trigger the smart contract release
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Funds released to seller!");
      if (onReleaseComplete) onReleaseComplete();
    } catch (error) {
      toast.error("Failed to release funds");
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Smart Escrow
        </CardTitle>
        <CardDescription>
          Secure transaction via blockchain escrow contract
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Escrow Amount */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Escrow Amount</span>
            <Badge variant="secondary">
              {currentStep > 0 ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
              {currentStep > 0 ? "Locked" : "Unlocked"}
            </Badge>
          </div>
          <p className="text-3xl font-bold mt-2">{formatCurrency(escrowAmount)}</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full shrink-0
                ${step.status === "completed" ? "bg-green-500 text-white" : 
                  step.status === "active" ? "bg-primary text-primary-foreground animate-pulse" : 
                  "bg-muted text-muted-foreground"}
              `}>
                {step.status === "completed" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                    {step.label}
                  </span>
                  {step.status === "active" && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="w-px h-8 bg-border ml-5 mt-10 absolute" />
              )}
            </div>
          ))}
        </div>

        {/* Wallet Connection */}
        {!walletConnected && isBuyer && currentStep === 0 && (
          <div className="space-y-4 pt-4 border-t">
            <Button 
              onClick={connectWallet} 
              className="w-full" 
              variant="outline"
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              Connect Wallet
            </Button>
          </div>
        )}

        {/* Buyer Actions */}
        {isBuyer && currentStep === 0 && walletConnected && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Deposit Amount (USD)</Label>
              <Input 
                type="number" 
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <Button 
              onClick={depositFunds} 
              className="w-full"
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              Deposit to Escrow
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Funds will be locked until seller provides verified proof of product
            </p>
          </div>
        )}

        {/* Buyer Approval */}
        {isBuyer && currentStep === 2 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-500">Action Required</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Review the seller's proof of product. Once approved, escrow funds will be released.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" disabled={processing}>
                Request Changes
              </Button>
              <Button onClick={releaseFunds} disabled={processing}>
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approve & Release
              </Button>
            </div>
          </div>
        )}

        {/* Seller Waiting State */}
        {!isBuyer && currentStep === 0 && (
          <div className="p-4 bg-muted rounded-lg text-center">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Waiting for buyer to deposit escrow funds
            </p>
          </div>
        )}

        {/* Completed State */}
        {currentStep >= 4 && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium text-green-500">Escrow Complete</p>
            <p className="text-sm text-muted-foreground">
              Funds have been released to the seller
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
