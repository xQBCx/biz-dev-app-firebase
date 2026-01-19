import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Wand2, 
  Calendar, 
  Copy, 
  RefreshCw,
  CheckCircle2,
  Loader2,
  Target,
  BookOpen,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { XEvent } from "@/hooks/useXEvents";

interface XEventAGIIntegrationProps {
  event: XEvent;
  registrationCount?: number;
}

const XEventAGIIntegration = ({ event, registrationCount = 0 }: XEventAGIIntegrationProps) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [seriesCount, setSeriesCount] = useState(4);
  const [seriesGoal, setSeriesGoal] = useState("");
  const [generatedSeries, setGeneratedSeries] = useState<any[]>([]);
  const [linkedInitiative, setLinkedInitiative] = useState<any>(null);

  const generateEventSeries = async () => {
    if (!seriesGoal.trim()) {
      toast.error("Please provide a goal for the event series");
      return;
    }

    setIsGenerating(true);
    try {
      // Check if we have an existing initiative linked to this event
      const { data: existingInitiative } = await supabase
        .from('initiatives')
        .select('*')
        .eq('id', event.initiative_id || '')
        .maybeSingle();

      if (existingInitiative) {
        setLinkedInitiative(existingInitiative);
        toast.info("Found existing initiative linked to this event");
        setIsGenerating(false);
        return;
      }

      // Create a new initiative from the event using safe cast
      const { data: initiative, error } = await (supabase
        .from('initiatives') as any)
        .insert({
          user_id: user?.id,
          name: `${event.name} Series`,
          type: 'event_series',
          status: 'ready',
          description: seriesGoal,
          generated_content: {
            base_event: {
              id: event.id,
              name: event.name,
              category: event.category,
            },
            series_goal: seriesGoal,
            series_count: seriesCount,
            generated_at: new Date().toISOString(),
          }
        })
        .select()
        .single();

      if (error) throw error;

      setLinkedInitiative(initiative);

      // Generate example series events
      const baseDate = new Date(event.start_date);
      const series = Array.from({ length: seriesCount }, (_, i) => {
        const eventDate = new Date(baseDate);
        eventDate.setMonth(eventDate.getMonth() + i + 1);
        return {
          number: i + 1,
          name: `${event.name} - Part ${i + 2}`,
          suggestedDate: eventDate.toISOString(),
          theme: `Session ${i + 2}: Advanced Topics`,
          status: 'planned'
        };
      });

      setGeneratedSeries(series);
      toast.success(`Initiative created with ${seriesCount} event series`);

    } catch (error) {
      console.error('Error generating series:', error);
      toast.error("Failed to generate event series");
    } finally {
      setIsGenerating(false);
    }
  };

  const createFromSeries = async (seriesItem: any) => {
    toast.success(`Creating event: ${seriesItem.name}`);
    // This would navigate to create event with pre-filled data
  };

  return (
    <div className="space-y-6">
      {/* AGI Header */}
      <Card className="p-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AGI Initiative Architect</h3>
              <p className="text-sm text-muted-foreground">
                Transform this event into a strategic initiative with automated series generation
              </p>
            </div>
          </div>
          {linkedInitiative && (
            <Badge className="bg-emerald-500/20 text-emerald-600">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Initiative Linked
            </Badge>
          )}
        </div>
      </Card>

      {/* Current Event Context */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Source Event Context
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Category</p>
            <p className="font-medium capitalize">{event.category.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Visibility</p>
            <p className="font-medium capitalize">{event.visibility}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Registrations</p>
            <p className="font-medium">{registrationCount} attendees</p>
          </div>
        </div>
      </Card>

      {/* Series Generator */}
      {!linkedInitiative ? (
        <Card className="p-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            Generate Event Series
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Series Goal / Objective</Label>
              <Textarea
                value={seriesGoal}
                onChange={(e) => setSeriesGoal(e.target.value)}
                placeholder="e.g., Train professionals on advanced business development techniques through monthly workshops..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Follow-up Events</Label>
              <Input
                type="number"
                min={1}
                max={12}
                value={seriesCount}
                onChange={(e) => setSeriesCount(parseInt(e.target.value) || 1)}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                The AGI will generate {seriesCount} additional events in the series
              </p>
            </div>

            <Button 
              onClick={generateEventSeries}
              disabled={isGenerating || !seriesGoal.trim()}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Series...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Initiative & Series
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Linked Initiative Details */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Linked Initiative
              </h4>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Re-scaffold
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <p className="font-medium">{linkedInitiative.name}</p>
              <p className="text-sm text-muted-foreground">{linkedInitiative.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <Badge variant="outline">{linkedInitiative.type}</Badge>
                <Badge variant="outline">{linkedInitiative.status}</Badge>
              </div>
            </div>
          </Card>

          {/* Generated Series */}
          {generatedSeries.length > 0 && (
            <Card className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Generated Event Series
              </h4>

              <div className="space-y-3">
                {generatedSeries.map((item, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {item.number}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.theme}</p>
                        <p className="text-xs text-muted-foreground">
                          Suggested: {new Date(item.suggestedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.status}</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => createFromSeries(item)}
                      >
                        Create Event
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Cross-Module Actions */}
      <Card className="p-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Cross-Module Actions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start gap-2" size="sm">
            <Copy className="w-4 h-4" />
            Clone to New Event
          </Button>
          <Button variant="outline" className="justify-start gap-2" size="sm">
            <Target className="w-4 h-4" />
            Create Deal Room Template
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default XEventAGIIntegration;
