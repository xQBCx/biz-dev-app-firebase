import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Building2,
  User,
  Bot,
  Clock,
  Target,
  Play,
  Loader2,
  Plus,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface AgentActivity {
  id: string;
  agent_slug: string;
  external_platform: string;
  activity_type: string;
  outcome_type: string | null;
  outcome_value: number | null;
  activity_data: Record<string, unknown>;
  target_contact_id: string | null;
  target_company_id: string | null;
  created_at: string;
  deal_room_id?: string;
  contact_name?: string;
  company_name?: string;
}

interface SignalDetailPanelProps {
  activity: AgentActivity | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const SignalDetailPanel = ({
  activity,
  open,
  onClose,
  onRefresh,
}: SignalDetailPanelProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAddingToCRM, setIsAddingToCRM] = useState(false);
  const [isRunningNextAgent, setIsRunningNextAgent] = useState(false);

  if (!activity) return null;

  const data = activity.activity_data || {};

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const copyAllDetails = async () => {
    const details = [
      `Agent: ${activity.agent_slug}`,
      `Activity: ${activity.activity_type}`,
      `Time: ${format(new Date(activity.created_at), "PPpp")}`,
      data.company_name && `Company: ${data.company_name}`,
      data.talking_point && `Talking Point: ${data.talking_point}`,
      data.source_url && `Source: ${data.source_url}`,
      data.signal_title && `Signal: ${data.signal_title}`,
      data.confidence && `Confidence: ${data.confidence}%`,
    ]
      .filter(Boolean)
      .join("\n");

    await copyToClipboard(details, "All details");
  };

  const handleAddToCRM = async () => {
    setIsAddingToCRM(true);
    try {
      // Call edge function to intelligently add to CRM with deduplication
      const { data: result, error } = await supabase.functions.invoke(
        "signal-to-crm",
        {
          body: {
            activity_id: activity.id,
            company_name: data.company_name,
            contact_email: data.contact_email,
            contact_name: data.contact_name,
            source_url: data.source_url,
            talking_point: data.talking_point,
            deal_room_id: activity.deal_room_id,
          },
        }
      );

      if (error) throw error;

      if (result?.existing) {
        toast.info(
          `Company "${result.company_name}" already exists in CRM - linked activity`
        );
      } else {
        toast.success(
          `Created company "${result?.company_name || data.company_name}" in CRM`
        );
      }
      onRefresh();
    } catch (err) {
      console.error("Error adding to CRM:", err);
      toast.error("Failed to add to CRM - edge function may not be deployed yet");
    } finally {
      setIsAddingToCRM(false);
    }
  };

  const handleRunNextAgent = async () => {
    setIsRunningNextAgent(true);
    try {
      // Trigger Account Intel agent for this signal
      const { error } = await supabase.functions.invoke("run-agent", {
        body: {
          agent_slug: "account_intel",
          trigger_type: "manual",
          context: {
            source_activity_id: activity.id,
            company_name: data.company_name,
            signal_data: data,
            deal_room_id: activity.deal_room_id,
          },
        },
      });

      if (error) throw error;
      toast.success("Account Intel agent triggered - enrichment in progress");
    } catch (err) {
      console.error("Error running next agent:", err);
      toast.error(
        "Account Intel agent not configured yet - George needs to register it"
      );
    } finally {
      setIsRunningNextAgent(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Signal Details
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyAllDetails}
              title="Copy all details"
            >
              {copiedField === "All details" ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)] mt-6">
          <div className="space-y-6">
            {/* Agent Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bot className="w-4 h-4" />
                Agent
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{activity.agent_slug}</Badge>
                <span className="text-xs text-muted-foreground">
                  via {activity.external_platform}
                </span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Detected
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {format(new Date(activity.created_at), "PPpp")}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })})
                </span>
              </div>
            </div>

            <Separator />

            {/* Company Name */}
            {data.company_name && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    Company
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(String(data.company_name), "Company")
                    }
                  >
                    {copiedField === "Company" ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="font-medium">{String(data.company_name)}</p>
              </div>
            )}

            {/* Signal Title */}
            {(data.signal_title || data.title) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Signal
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        String(data.signal_title || data.title),
                        "Signal"
                      )
                    }
                  >
                    {copiedField === "Signal" ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="font-medium">
                  {String(data.signal_title || data.title)}
                </p>
              </div>
            )}

            {/* Talking Point */}
            {data.talking_point && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Talking Point
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(String(data.talking_point), "Talking Point")
                    }
                  >
                    {copiedField === "Talking Point" ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {String(data.talking_point)}
                </p>
              </div>
            )}

            {/* Source URL */}
            {data.source_url && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Source Article
                </div>
                <a
                  href={String(data.source_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Source
                </a>
              </div>
            )}

            {/* Contact Info */}
            {data.contact_email && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    Contact
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(String(data.contact_email), "Contact")
                    }
                  >
                    {copiedField === "Contact" ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p>{String(data.contact_email)}</p>
              </div>
            )}

            {/* Confidence */}
            {data.confidence && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Confidence Score
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Number(data.confidence)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {Number(data.confidence)}%
                  </span>
                </div>
              </div>
            )}

            <Separator />

            {/* Raw Data */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Raw Data</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(data, null, 2), "Raw data")
                  }
                >
                  {copiedField === "Raw data" ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            onClick={handleAddToCRM}
            disabled={isAddingToCRM}
            className="flex-1"
          >
            {isAddingToCRM ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add to CRM
          </Button>
          <Button
            variant="outline"
            onClick={handleRunNextAgent}
            disabled={isRunningNextAgent}
            className="flex-1"
          >
            {isRunningNextAgent ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run Account Intel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
