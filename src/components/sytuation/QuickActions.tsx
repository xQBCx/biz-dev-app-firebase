import { 
  Plus, 
  Brain, 
  Zap, 
  Search,
  LayoutGrid,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionsProps {
  userId?: string;
  onCreateSituation: () => void;
}

export function QuickActions({ userId, onCreateSituation }: QuickActionsProps) {
  return (
    <div className="border border-border rounded-lg bg-card h-fit sticky top-4">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          What do you need to handle?
        </p>
      </div>

      <div className="p-4 space-y-3">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={onCreateSituation}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Situation
        </Button>

        <Button className="w-full justify-start" variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          Ask AI
        </Button>

        <Button className="w-full justify-start" variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Search Context
        </Button>

        <Button className="w-full justify-start" variant="outline">
          <Sparkles className="h-4 w-4 mr-2" />
          Run Simulation
        </Button>
      </div>

      {/* Quick Tips */}
      <div className="p-4 border-t border-border bg-muted/30">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">How Sytuation Works</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Describe what's happening
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            AI analyzes context & risks
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Get recommended next steps
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            Track until resolved
          </li>
        </ul>
      </div>
    </div>
  );
}
