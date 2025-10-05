import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Share2, CheckCircle2, Sparkles, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CardTradingModal } from "./CardTradingModal";
import { NFTMintingModal } from "./NFTMintingModal";

interface BusinessCardDisplayProps {
  card: any;
  isOwner: boolean;
  onUpdate?: () => void;
}

export function BusinessCardDisplay({ card, isOwner, onUpdate }: BusinessCardDisplayProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showMintModal, setShowMintModal] = useState(false);

  const materialStyles = {
    paper: {
      bg: "bg-white dark:bg-card",
      shadow: "shadow-sm",
      border: "border-2 border-border",
    },
    plastic: {
      bg: "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900",
      shadow: "shadow-md",
      border: "border border-blue-200 dark:border-blue-800",
    },
    aluminum: {
      bg: "bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700",
      shadow: "shadow-lg shadow-slate-300/50 dark:shadow-slate-900/50",
      border: "border-2 border-slate-300 dark:border-slate-600",
    },
    silver: {
      bg: "bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600",
      shadow: "shadow-xl shadow-gray-300/60 dark:shadow-gray-900/60",
      border: "border-2 border-gray-300 dark:border-gray-500",
    },
    gold: {
      bg: "bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-300 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-700",
      shadow: "shadow-2xl shadow-yellow-400/70 dark:shadow-yellow-900/70",
      border: "border-2 border-yellow-400 dark:border-yellow-600",
    },
  };

  const rarityBadges = {
    paper: { label: "Common", variant: "secondary" as const },
    plastic: { label: "Uncommon", variant: "secondary" as const },
    aluminum: { label: "Rare", variant: "default" as const },
    silver: { label: "Epic", variant: "default" as const },
    gold: { label: "Legendary", variant: "default" as const },
  };

  const handlePublish = async () => {
    const { error } = await supabase
      .from("business_cards")
      .update({ status: "active" })
      .eq("id", card.id);

    if (error) {
      toast.error("Failed to publish card");
    } else {
      toast.success("Card published successfully!");
      onUpdate?.();
    }
  };

  const handleCollect = async () => {
    if (!user) {
      toast.error("Please sign in to collect cards");
      return;
    }

    const { error } = await supabase
      .from("card_collections")
      .insert({
        card_id: card.id,
        collector_id: user.id,
        acquisition_method: "collect",
      });

    if (error) {
      toast.error("Failed to collect card");
    } else {
      toast.success("Added to your collection!");
      onUpdate?.();
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like cards");
      return;
    }

    const { error } = await supabase
      .from("business_cards")
      .update({ likes_count: (card.likes_count || 0) + 1 })
      .eq("id", card.id);

    if (error) {
      toast.error("Failed to like card");
    } else {
      setIsLiked(true);
      toast.success("Card liked!");
      onUpdate?.();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/cards/${card.id}`);
    toast.success("Link copied to clipboard!");
  };

  const materialStyle = materialStyles[card.material as keyof typeof materialStyles];

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="relative">
        <div
          className={`aspect-[1.75/1] p-6 flex flex-col justify-between ${materialStyle.bg} ${materialStyle.shadow} ${materialStyle.border}`}
          style={{
            backgroundColor: card.background_color,
            color: card.text_color,
          }}
        >
          <div>
            <h3 className="text-xl font-bold mb-1">{card.card_name}</h3>
            {card.title && <p className="text-sm opacity-80">{card.title}</p>}
          </div>
          <div>
            {card.company_name && <p className="font-semibold text-lg mb-2">{card.company_name}</p>}
            <div className="space-y-1 text-sm opacity-80">
              {card.email && <p>{card.email}</p>}
              {card.phone && <p>{card.phone}</p>}
              {card.website && <p>{card.website}</p>}
            </div>
          </div>
          <div className="flex justify-between items-end text-xs opacity-60">
            <span className="capitalize">{card.material}</span>
            {card.serial_number && <span>{card.serial_number}</span>}
          </div>
        </div>

        <div className="absolute top-2 right-2 flex gap-2">
          {card.is_minted && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Minted
            </Badge>
          )}
          <Badge variant={rarityBadges[card.material as keyof typeof rarityBadges].variant}>
            {rarityBadges[card.material as keyof typeof rarityBadges].label}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {card.views_count || 0} views
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {card.likes_count || 0} likes
          </span>
        </div>

        {card.verification_code && (
          <div className="text-xs text-muted-foreground font-mono">
            Verification: {card.verification_code.slice(0, 8)}...
          </div>
        )}

        <div className="flex gap-2">
          {isOwner ? (
            <>
              {!card.is_minted && card.status === "active" && (
                <Button size="sm" className="flex-1 gap-1" onClick={() => setShowMintModal(true)}>
                  <Sparkles className="h-4 w-4" />
                  Mint as NFT
                </Button>
              )}
              {(card.status === "active" || card.status === "minted") && (
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setShowTradeModal(true)}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Trade
                </Button>
              )}
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleLike}
                disabled={isLiked}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                Like
              </Button>
              <Button variant="default" size="sm" className="flex-1" onClick={handleCollect}>
                Collect
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {card.status === "draft" && isOwner && (
          <Button variant="default" size="sm" className="w-full" onClick={handlePublish}>
            Publish Card
          </Button>
        )}
      </div>

      <CardTradingModal
        card={card}
        open={showTradeModal}
        onOpenChange={setShowTradeModal}
        onTradeComplete={onUpdate}
      />

      <NFTMintingModal
        card={card}
        open={showMintModal}
        onOpenChange={setShowMintModal}
        onMintComplete={onUpdate}
      />
    </Card>
  );
}