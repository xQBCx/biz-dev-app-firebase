import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReferrals } from "@/hooks/useReferrals";
import { Share2, Copy, Check, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export function ReferralCard() {
  const { referralCode, referrals, loading, getReferralLink, copyReferralLink } = useReferrals();
  const [copied, setCopied] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleCopy = async () => {
    const success = await copyReferralLink();
    if (success) {
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const link = getReferralLink();
    if (!link) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join ISO Flash",
          text: "Get photos on demand! Use my referral link to join ISO Flash:",
          url: link
        });
      } catch (error) {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (loading || !referralCode) return null;

  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <h3 className="font-bold">Earn 2.5% for Life</h3>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Referral Network</DialogTitle>
              <DialogDescription>
                You earn 2.5% of every transaction from people you refer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{referralCode.total_referrals}</p>
                  <p className="text-xs text-muted-foreground">Referrals</p>
                </div>
                <div className="p-4 rounded-lg bg-muted text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">${referralCode.total_lifetime_earnings.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Earned</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center p-4 rounded-lg bg-card border border-border">
                <div className="p-2 bg-white rounded-lg mb-3">
                  <QRCodeSVG 
                    value={getReferralLink() || ""}
                    size={120}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan to join with your code
                </p>
              </div>

              {/* Referral code */}
              <div className="p-3 rounded-lg bg-muted text-center">
                <p className="text-xs text-muted-foreground mb-1">Your code</p>
                <p className="text-xl font-mono font-bold text-primary">{referralCode.code}</p>
              </div>

              {/* Recent referrals */}
              {referrals.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Recent Referrals</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {referrals.slice(0, 5).map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-2 rounded-lg bg-card">
                        <span className="text-sm">
                          {referral.referred_profile?.full_name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${referral.total_earnings.toFixed(2)} earned
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Share your link and earn from everyone who joins
      </p>

      {/* Code display */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-background/50">
        <span className="flex-1 text-sm font-mono truncate">{getReferralLink()}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="flex-shrink-0"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      {/* Share button */}
      <Button 
        className="w-full" 
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share & Earn
      </Button>
    </div>
  );
}
