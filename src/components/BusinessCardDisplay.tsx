import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Share2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BusinessCardDisplayProps {
  card: any;
  isOwner: boolean;
}

export function BusinessCardDisplay({ card, isOwner }: BusinessCardDisplayProps) {
  const materialColors = {
    paper: "bg-white dark:bg-gray-800",
    plastic: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
    aluminum: "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600",
    silver: "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500",
    gold: "bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-600 dark:to-yellow-500",
  };

  const rarityBadges = {
    paper: { label: "Common", variant: "secondary" as const },
    plastic: { label: "Uncommon", variant: "secondary" as const },
    aluminum: { label: "Rare", variant: "default" as const },
    silver: { label: "Epic", variant: "default" as const },
    gold: { label: "Legendary", variant: "default" as const },
  };

  const handleShare = () => {
    toast.success("Link copied to clipboard!");
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <div
          className={`aspect-[1.75/1] p-6 flex flex-col justify-between ${
            materialColors[card.material as keyof typeof materialColors]
          }`}
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
              <Button variant="outline" size="sm" className="flex-1">
                Edit
              </Button>
              {!card.is_minted && (
                <Button size="sm" className="flex-1 gap-1">
                  <Sparkles className="h-4 w-4" />
                  Mint as NFT
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                <Heart className="h-4 w-4 mr-1" />
                Collect
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {card.status === "draft" && isOwner && (
          <Button variant="secondary" size="sm" className="w-full">
            Publish Card
          </Button>
        )}
      </div>
    </Card>
  );
}