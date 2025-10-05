import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BusinessCardCreator } from "@/components/BusinessCardCreator";
import { BusinessCardDisplay } from "@/components/BusinessCardDisplay";

export default function BusinessCards() {
  const { user } = useAuth();
  const [showCreator, setShowCreator] = useState(false);

  const { data: myCards, refetch: refetchMyCards } = useQuery({
    queryKey: ["my-business-cards", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_cards")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: featuredCards } = useQuery({
    queryKey: ["featured-business-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_cards")
        .select("*")
        .in("status", ["active", "minted", "traded"])
        .order("views_count", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
  });

  const materialPricing = {
    paper: { price: 0, display: "Free" },
    plastic: { price: 5, display: "$5" },
    aluminum: { price: 25, display: "$25" },
    silver: { price: 100, display: "$100" },
    gold: { price: 500, display: "$500" },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Collectible Business Cards
          </h1>
          <p className="text-muted-foreground mt-2">
            Create, collect, and trade verified business cards as digital collectibles
          </p>
        </div>
        <Button onClick={() => setShowCreator(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Card
        </Button>
      </div>

      {showCreator && (
        <BusinessCardCreator
          onClose={() => {
            setShowCreator(false);
            refetchMyCards();
          }}
        />
      )}

      <div className="mb-8">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2">
          <div className="flex items-start gap-4">
            <Sparkles className="h-8 w-8 text-purple-600 mt-1" />
            <div>
              <h3 className="text-xl font-semibold mb-2">The Future of Business Cards</h3>
              <p className="text-muted-foreground mb-4">
                Your business card isn't just contact info—it's a collectible asset. Choose from different materials, 
                mint them as NFTs, and watch their value grow as your business succeeds. Early cards from successful 
                entrepreneurs become highly valuable collector's items.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                {Object.entries(materialPricing).map(([material, { price, display }]) => (
                  <div key={material} className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="font-semibold capitalize">{material}</div>
                    <div className="text-sm text-muted-foreground">{display}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="my-cards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-cards">My Cards</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="collection">My Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="my-cards" className="space-y-6">
          {myCards && myCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCards.map((card) => (
                <BusinessCardDisplay key={card.id} card={card} isOwner={true} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any business cards yet</p>
              <Button onClick={() => setShowCreator(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Card
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          {featuredCards && featuredCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCards.map((card) => (
                <BusinessCardDisplay key={card.id} card={card} isOwner={false} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No cards in the gallery yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Collection feature coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}