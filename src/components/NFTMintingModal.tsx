import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NFTMintingModalProps {
  card: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMintComplete?: () => void;
}

export const NFTMintingModal = ({
  card,
  open,
  onOpenChange,
  onMintComplete,
}: NFTMintingModalProps) => {
  const [network, setNetwork] = useState("ethereum");
  const [isMinting, setIsMinting] = useState(false);

  const calculateRarityScore = () => {
    let score = 0;
    
    // Material rarity
    const materialScores: Record<string, number> = {
      paper: 10,
      plastic: 20,
      aluminum: 40,
      silver: 70,
      gold: 100,
    };
    score += materialScores[card.material] || 0;
    
    // Edition rarity (lower edition numbers are rarer)
    if (card.edition_number && card.total_editions) {
      const editionRarity = (1 - (card.edition_number / card.total_editions)) * 30;
      score += editionRarity;
    }
    
    // Engagement score (likes + views)
    const engagementScore = Math.min(((card.likes_count + card.views_count) / 100) * 20, 20);
    score += engagementScore;
    
    return Math.round(score);
  };

  const handleMint = async () => {
    setIsMinting(true);
    try {
      // Simulate blockchain minting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const rarityScore = calculateRarityScore();
      const mockContractAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
      const mockTokenId = Math.floor(Math.random() * 1000000);
      const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      
      const { error } = await supabase
        .from("business_cards")
        .update({
          is_minted: true,
          minted_at: new Date().toISOString(),
          blockchain_network: network,
          nft_contract_address: mockContractAddress,
          nft_token_id: mockTokenId.toString(),
          mint_transaction_hash: mockTxHash,
          rarity_score: rarityScore,
          status: "minted",
        })
        .eq("id", card.id);

      if (error) throw error;

      toast.success(`NFT minted successfully! Rarity Score: ${rarityScore}/100`);
      onOpenChange(false);
      onMintComplete?.();
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mint as NFT</DialogTitle>
          <DialogDescription>
            Mint this business card as an NFT on the blockchain. This will make it
            tradeable and verifiable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="network">Blockchain Network</Label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger id="network">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
            <h4 className="font-semibold">Minting Details</h4>
            <div className="space-y-1">
              <p><span className="text-muted-foreground">Material:</span> <span className="capitalize font-medium">{card.material}</span></p>
              <p><span className="text-muted-foreground">Edition:</span> <span className="font-medium">{card.edition_number}/{card.total_editions}</span></p>
              <p><span className="text-muted-foreground">Estimated Rarity:</span> <span className="font-medium">{calculateRarityScore()}/100</span></p>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Note: This is a simulated minting process. In production, this would connect
            to a real blockchain wallet and smart contract.
          </p>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMinting}>
            Cancel
          </Button>
          <Button onClick={handleMint} disabled={isMinting}>
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint NFT"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
