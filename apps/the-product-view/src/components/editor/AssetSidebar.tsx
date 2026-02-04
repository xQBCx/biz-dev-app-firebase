import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Armchair,
  Flower2,
  Lightbulb,
  Utensils,
  Palette,
  Search,
  Plus,
  Sparkles,
} from "lucide-react";

interface Asset {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  price?: number;
}

interface AssetSidebarProps {
  onAddAsset: (type: string) => void;
}

const assetCategories = [
  { id: "furniture", name: "Furniture", icon: Armchair, color: "text-primary" },
  { id: "flowers", name: "Flowers", icon: Flower2, color: "text-rose-500" },
  { id: "lighting", name: "Lighting", icon: Lightbulb, color: "text-amber-500" },
  { id: "tableware", name: "Tableware", icon: Utensils, color: "text-blue-500" },
  { id: "decor", name: "Décor", icon: Palette, color: "text-purple-500" },
];

const sampleAssets: Asset[] = [
  { id: "1", name: "Round Table", category: "furniture", price: 150 },
  { id: "2", name: "Chiavari Chair", category: "furniture", price: 12 },
  { id: "3", name: "Rose Centerpiece", category: "flowers", price: 85 },
  { id: "4", name: "String Lights", category: "lighting", price: 200 },
  { id: "5", name: "Gold Charger Plate", category: "tableware", price: 8 },
  { id: "6", name: "Lavender Bouquet", category: "flowers", price: 120 },
  { id: "7", name: "Candelabra", category: "lighting", price: 45 },
  { id: "8", name: "Linen Napkins", category: "tableware", price: 3 },
];

export const AssetSidebar = ({ onAddAsset }: AssetSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredAssets = sampleAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || asset.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="h-full flex flex-col shadow-elegant border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Assets</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col" onValueChange={setActiveCategory}>
        <TabsList className="mx-4 mt-4 grid grid-cols-3 gap-1">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="furniture" className="text-xs">Furniture</TabsTrigger>
          <TabsTrigger value="flowers" className="text-xs">Flowers</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 px-4">
          <TabsContent value="all" className="mt-4 space-y-2">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onAdd={() => onAddAsset(asset.category)} />
            ))}
          </TabsContent>

          <TabsContent value="furniture" className="mt-4 space-y-2">
            {filteredAssets
              .filter((a) => a.category === "furniture")
              .map((asset) => (
                <AssetCard key={asset.id} asset={asset} onAdd={() => onAddAsset("table")} />
              ))}
          </TabsContent>

          <TabsContent value="flowers" className="mt-4 space-y-2">
            {filteredAssets
              .filter((a) => a.category === "flowers")
              .map((asset) => (
                <AssetCard key={asset.id} asset={asset} onAdd={() => onAddAsset("flower")} />
              ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Browse Marketplace
        </Button>
      </div>
    </Card>
  );
};

const AssetCard = ({ asset, onAdd }: { asset: Asset; onAdd: () => void }) => {
  const getCategoryIcon = () => {
    const category = assetCategories.find((c) => c.id === asset.category);
    if (!category) return null;
    const Icon = category.icon;
    return <Icon className={`w-4 h-4 ${category.color}`} />;
  };

  return (
    <div className="group p-3 rounded-lg border border-border hover:border-primary/50 hover:shadow-soft transition-smooth bg-card">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          {getCategoryIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1 truncate">{asset.name}</h4>
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              {asset.category}
            </Badge>
            {asset.price && (
              <span className="text-xs text-muted-foreground">${asset.price}</span>
            )}
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-smooth"
          onClick={onAdd}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
