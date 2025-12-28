import { Helmet } from "react-helmet-async";
import { Brain, Sparkles, Link2, Target, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AINotificationsPanel } from "@/components/ai/AINotificationsPanel";
import { CrossModuleLinks } from "@/components/ai/CrossModuleLinks";
import { OutcomeTracker } from "@/components/ai/OutcomeTracker";
import { SuccessPatterns } from "@/components/ai/SuccessPatterns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

const AIIntelligence = () => {
  const [isRunning, setIsRunning] = useState(false);

  const runBackgroundAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-background-agent", {
        body: { manual: true },
      });

      if (error) throw error;

      toast.success("Background agent completed", {
        description: `Processed ${data?.tasksProcessed || 0} tasks, discovered ${data?.linksDiscovered || 0} links`,
      });
    } catch (error) {
      console.error("Error running background agent:", error);
      toast.error("Failed to run background agent");
    } finally {
      setIsRunning(false);
    }
  };

  const runMetaCognition = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-meta-cognition", {
        body: { manual: true },
      });

      if (error) throw error;

      toast.success("Meta-cognition analysis complete", {
        description: `Generated ${data?.improvementsGenerated || 0} insights`,
      });
    } catch (error) {
      console.error("Error running meta-cognition:", error);
      toast.error("Failed to run meta-cognition");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Intelligence | BizDev</title>
        <meta name="description" content="AI-powered intelligence and insights for your business" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              AI Intelligence Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Self-learning AI that improves through feedback and pattern recognition
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={runBackgroundAgent}
              disabled={isRunning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
              Run Agent
            </Button>
            <Button
              variant="outline"
              onClick={runMetaCognition}
              disabled={isRunning}
            >
              <Lightbulb className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
              Analyze
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="outcomes" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Outcomes
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <AINotificationsPanel />
              <div className="space-y-6">
                <OutcomeTracker />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links">
            <CrossModuleLinks />
          </TabsContent>

          <TabsContent value="outcomes">
            <OutcomeTracker />
          </TabsContent>

          <TabsContent value="patterns">
            <SuccessPatterns />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default AIIntelligence;
