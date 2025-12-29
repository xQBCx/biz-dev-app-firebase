import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  HelpCircle, 
  Package, 
  Layers, 
  Anchor, 
  Award, 
  Activity, 
  TrendingUp, 
  Repeat, 
  Zap, 
  LogOut,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KnowledgeItem {
  id: string;
  concept_key: string;
  title: string;
  plain_english_explanation: string;
  technical_explanation: string | null;
  examples: any;
  category: string;
  icon_name: string | null;
  display_order: number;
}

const iconMap: Record<string, any> = {
  Blend: Package,
  Package: Package,
  Layers: Layers,
  Anchor: Anchor,
  Award: Award,
  Activity: Activity,
  TrendingUp: TrendingUp,
  Repeat: Repeat,
  Zap: Zap,
  LogOut: LogOut,
};

interface BlenderKnowledgeHelperProps {
  conceptKey?: string;
  compact?: boolean;
  showTitle?: boolean;
}

export const BlenderKnowledgeHelper = ({ 
  conceptKey, 
  compact = false,
  showTitle = true 
}: BlenderKnowledgeHelperProps) => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    const { data } = await supabase
      .from("blender_knowledge_base")
      .select("*")
      .order("display_order");
    
    if (data) setKnowledge(data);
  };

  const openConcept = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return HelpCircle;
    return iconMap[iconName] || HelpCircle;
  };

  // If a specific concept key is provided, show just that tooltip
  if (conceptKey) {
    const item = knowledge.find(k => k.concept_key === conceptKey);
    if (!item) return null;

    const Icon = getIcon(item.icon_name);
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
              onClick={() => openConcept(item)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {item.plain_english_explanation.slice(0, 100)}...
            </p>
            <p className="text-xs text-primary mt-1">Click for full explanation</p>
          </TooltipContent>
        </Tooltip>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                {item.title}
              </DialogTitle>
            </DialogHeader>
            <KnowledgeDetailContent item={item} />
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    );
  }

  // Show full knowledge browser
  if (compact) {
    return (
      <div className="space-y-2">
        {showTitle && (
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Framework Concepts
          </h4>
        )}
        <div className="flex flex-wrap gap-2">
          {knowledge.map((item) => {
            const Icon = getIcon(item.icon_name);
            return (
              <Badge
                key={item.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => openConcept(item)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {item.title}
              </Badge>
            );
          })}
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {(() => {
                      const Icon = getIcon(selectedItem.icon_name);
                      return <Icon className="w-5 h-5 text-primary" />;
                    })()}
                    {selectedItem.title}
                  </DialogTitle>
                </DialogHeader>
                <KnowledgeDetailContent item={selectedItem} />
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full panel view
  const categories = [...new Set(knowledge.map(k => k.category))];

  return (
    <Card className="p-4">
      {showTitle && (
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Chemical Blender Framework
        </h3>
      )}
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="space-y-1">
                {knowledge
                  .filter(k => k.category === category)
                  .map((item) => {
                    const Icon = getIcon(item.icon_name);
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-auto py-2"
                        onClick={() => openConcept(item)}
                      >
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-left">{item.title}</span>
                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                      </Button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = getIcon(selectedItem.icon_name);
                    return <Icon className="w-5 h-5 text-primary" />;
                  })()}
                  {selectedItem.title}
                </DialogTitle>
              </DialogHeader>
              <KnowledgeDetailContent item={selectedItem} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const KnowledgeDetailContent = ({ item }: { item: KnowledgeItem }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Plain English</h4>
        <p className="text-sm leading-relaxed">{item.plain_english_explanation}</p>
      </div>

      {item.technical_explanation && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Technical Details</h4>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {item.technical_explanation}
          </p>
        </div>
      )}

      {item.examples && Array.isArray(item.examples) && item.examples.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Examples</h4>
          <div className="space-y-2">
            {(item.examples as any[]).map((example: any, idx: number) => (
              <Card key={idx} className="p-3 bg-muted/50">
                {Object.entries(example).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-muted-foreground capitalize">{key}: </span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t">
        <Badge variant="outline" className="capitalize">
          {item.category}
        </Badge>
      </div>
    </div>
  );
};