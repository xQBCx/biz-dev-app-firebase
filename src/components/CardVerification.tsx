import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const CardVerification = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifiedCard, setVerifiedCard] = useState<any>(null);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter a verification code");
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase
        .from("business_cards")
        .select("*")
        .eq("verification_code", verificationCode.toUpperCase())
        .single();

      if (error || !data) {
        toast.error("Invalid verification code");
        setVerifiedCard(null);
      } else {
        toast.success("Card verified successfully!");
        setVerifiedCard(data);
      }
    } catch (error) {
      toast.error("Verification failed");
      setVerifiedCard(null);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Verify Business Card
        </CardTitle>
        <CardDescription>
          Enter the verification code to confirm card authenticity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter verification code..."
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
            className="font-mono"
          />
          <Button onClick={handleVerify} disabled={verifying}>
            {verifying ? "Verifying..." : "Verify"}
          </Button>
        </div>

        {verifiedCard && (
          <div className="mt-6 p-6 border rounded-lg bg-muted/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <h3 className="text-lg font-semibold">Verified Card</h3>
              </div>
              <Badge variant={verifiedCard.is_minted ? "default" : "secondary"}>
                {verifiedCard.is_minted ? "NFT Minted" : "Physical Only"}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Serial Number</p>
                  <p className="font-mono font-bold">{verifiedCard.serial_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Material</p>
                  <p className="font-semibold capitalize">{verifiedCard.material}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Edition</p>
                  <p className="font-semibold">
                    {verifiedCard.edition_number}/{verifiedCard.total_editions}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rarity Score</p>
                  <p className="font-semibold">{verifiedCard.rarity_score}/100</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Views</p>
                  <p className="font-semibold">{verifiedCard.views_count}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Likes</p>
                  <p className="font-semibold">{verifiedCard.likes_count}</p>
                </div>
              </div>
              
              {verifiedCard.is_minted && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-muted-foreground mb-1">NFT Details</p>
                  <p className="text-xs font-mono break-all">
                    Network: {verifiedCard.blockchain_network}
                  </p>
                  {verifiedCard.nft_contract_address && (
                    <p className="text-xs font-mono break-all">
                      Contract: {verifiedCard.nft_contract_address}
                    </p>
                  )}
                  {verifiedCard.nft_token_id && (
                    <p className="text-xs font-mono break-all">
                      Token ID: {verifiedCard.nft_token_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {verifying === false && !verifiedCard && verificationCode && (
          <div className="mt-6 p-6 border rounded-lg bg-destructive/10">
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm text-destructive">
                No card found with this verification code
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
