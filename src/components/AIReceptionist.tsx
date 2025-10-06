import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Brain, Save, Sparkles } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ReceptionistConfig = Database['public']['Tables']['ai_receptionist_config']['Row'];


export const AIReceptionist = () => {
  const [config, setConfig] = useState<ReceptionistConfig | null>(null);
  const [configText, setConfigText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_receptionist_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setConfig(data as ReceptionistConfig);
        setConfigText(data.config_text || "");
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Failed to load receptionist configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Parse natural language into structured rules via AI
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-receptionist-config', {
        body: { configText }
      });

      if (parseError) throw parseError;

      // Save or update configuration
      let result;
      if (config?.id) {
        result = await supabase
          .from('ai_receptionist_config')
          .update({
            config_text: configText,
            parsed_rules: parseResult.rules as any,
            is_active: true
          })
          .eq('id', config.id);
      } else {
        result = await supabase
          .from('ai_receptionist_config')
          .insert([{
            user_id: user.id,
            config_text: configText,
            parsed_rules: parseResult.rules as any,
            is_active: true
          }]);
      }

      if (result.error) throw result.error;

      toast.success('AI Receptionist configuration saved');
      loadConfig();
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const examplePrompt = `When someone calls my phone:

Option 1: EMERGENCY
- Route directly to me immediately
- I'll get a special notification so I know to answer right away

Option 2: BUSINESS CALL
- Ask if they're an existing client or new prospect
- For existing clients: Check if they have payment method on file
  - If yes: Bill them at their pre-determined rate when I answer
  - If no: Get payment method first, then connect
- For new prospects: Ask what they need help with
  - If it's a complex deal: Connect them to me immediately so I can close
  - If it's simple inquiry: Schedule a callback appointment

Option 3: PERSONAL CALL (Family & Friends)
- Take a message
- Send me a notification to call them back later
- Don't interrupt my work time unless they say it's urgent`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            AI Receptionist
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your intelligent call routing in natural language
          </p>
        </div>
        {config?.is_active && (
          <Badge variant="default" className="gap-1">
            <Phone className="w-3 h-3" />
            Active
          </Badge>
        )}
      </div>

      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading configuration...</p>
        </Card>
      ) : (
        <>
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Natural Language Configuration</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Describe how you want your AI receptionist to handle calls in plain English. 
                  The AI will understand your instructions and create the routing logic automatically.
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    See example configuration
                  </summary>
                  <pre className="mt-2 p-3 bg-background rounded text-xs overflow-x-auto">
                    {examplePrompt}
                  </pre>
                </details>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="config">Your Call Routing Instructions</Label>
                <Textarea
                  id="config"
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  placeholder="Describe how you want calls to be handled..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <Button 
                onClick={saveConfig} 
                disabled={isSaving || !configText.trim()}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </Card>

          {config?.parsed_rules && typeof config.parsed_rules === 'object' && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Current Configuration</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">Emergency Routing</div>
                  <div className="text-xs text-muted-foreground">
                    {(config.parsed_rules as any)?.emergency?.description || "Direct connection with priority alert"}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">Business Calls</div>
                  <div className="text-xs text-muted-foreground">
                    {(config.parsed_rules as any)?.business?.description || "Client verification and billing setup"}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">Personal Calls</div>
                  <div className="text-xs text-muted-foreground">
                    {(config.parsed_rules as any)?.personal?.description || "Message taking and callback scheduling"}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
