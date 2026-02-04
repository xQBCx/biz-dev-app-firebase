import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Copy, Check, Code, Zap, FileJson, ExternalLink } from "lucide-react";

interface AgentIntegrationGuideProps {
  dealRoomId: string;
  agentSlug?: string;
}

export const AgentIntegrationGuide = ({ dealRoomId, agentSlug = "your_agent_slug" }: AgentIntegrationGuideProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'eoskcsbytaurtqrnuraw';
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/log-external-agent-activity`;

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success("Copied to clipboard");
  };

  const curlExample = `curl -X POST '${webhookUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: YOUR_API_KEY' \\
  -d '{
    "agent_slug": "${agentSlug}",
    "platform": "lindy_ai",
    "activity_type": "outreach_sent",
    "outcome_type": "meeting_set",
    "deal_room_id": "${dealRoomId}",
    "target": {
      "contact_email": "john@example.com",
      "company_domain": "example.com"
    },
    "metadata": {
      "subject": "Partnership Discussion",
      "sequence_step": 1
    }
  }'`;

  const payloadExample = `{
  "agent_slug": "signal_scout",
  "platform": "lindy_ai",
  "activity_type": "trigger_detected",
  "outcome_type": "trigger_detected",
  "deal_room_id": "${dealRoomId}",
  "target": {
    "contact_email": "jane@acme.com",
    "company_domain": "acme.com",
    "deal_id": "optional_deal_id"
  },
  "metadata": {
    "trigger_type": "new_permit",
    "signal_strength": "high",
    "details": "New commercial permit filed in target region"
  }
}`;

  const outcomeTypes = [
    { value: "meeting_set", label: "Meeting Set", credit: "$250", description: "A meeting was successfully booked" },
    { value: "reply_received", label: "Reply Received", credit: "$50", description: "Prospect replied to outreach" },
    { value: "trigger_detected", label: "Trigger Detected", credit: "$10-25", description: "Signal or trigger event identified" },
    { value: "enrichment_complete", label: "Enrichment Complete", credit: "$5-15", description: "Contact/company data enriched" },
    { value: "draft_created", label: "Draft Created", credit: "$5", description: "Email/message draft generated" },
    { value: "other", label: "Other", credit: "Variable", description: "Custom outcome type" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          Integration Guide
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure your external agents to send activity events to this deal room
        </p>
      </div>

      <Tabs defaultValue="endpoint" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoint" className="gap-1">
            <Zap className="w-4 h-4" />
            Endpoint
          </TabsTrigger>
          <TabsTrigger value="payload" className="gap-1">
            <FileJson className="w-4 h-4" />
            Payload
          </TabsTrigger>
          <TabsTrigger value="outcomes" className="gap-1">
            <ExternalLink className="w-4 h-4" />
            Outcomes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoint" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary">POST</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(webhookUrl, 'url')}
              >
                {copiedSection === 'url' ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <code className="text-sm bg-muted px-3 py-2 rounded block break-all">
              {webhookUrl}
            </code>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">cURL Example</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(curlExample, 'curl')}
              >
                {copiedSection === 'curl' ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {curlExample}
            </pre>
          </Card>

          <Card className="p-4 bg-amber-500/10 border-amber-500/20">
            <h4 className="font-medium text-amber-600 mb-2">Required Headers</h4>
            <ul className="text-sm space-y-1">
              <li><code className="bg-background px-1 rounded">Content-Type: application/json</code></li>
              <li><code className="bg-background px-1 rounded">x-api-key: YOUR_API_KEY</code> - Get this from the agent registration</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="payload" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Example Payload</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(payloadExample, 'payload')}
              >
                {copiedSection === 'payload' ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {payloadExample}
            </pre>
          </Card>

          <Card className="p-4">
            <h4 className="font-medium mb-3">Payload Fields</h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2 items-start">
                <code className="text-primary">agent_slug</code>
                <span className="col-span-2">Required. Unique identifier for the agent</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <code className="text-primary">platform</code>
                <span className="col-span-2">Required. lindy_ai, airia, zapier, make, n8n, or custom</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <code className="text-primary">activity_type</code>
                <span className="col-span-2">Required. Descriptive action name (e.g., "outreach_sent")</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <code className="text-primary">outcome_type</code>
                <span className="col-span-2">Optional. Triggers credit attribution (see Outcomes tab)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <code className="text-primary">deal_room_id</code>
                <span className="col-span-2">Required. Links activity to this deal room: <code className="text-xs bg-muted px-1 rounded">{dealRoomId}</code></span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <code className="text-primary">target</code>
                <span className="col-span-2">Optional. Contact/company to link (auto-matched to CRM)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <code className="text-primary">metadata</code>
                <span className="col-span-2">Optional. Additional context for the activity</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <Card className="p-4">
            <h4 className="font-medium mb-3">Outcome Types & Default Credits</h4>
            <p className="text-sm text-muted-foreground mb-4">
              When an activity includes an outcome_type, the system automatically applies attribution rules to calculate credits.
            </p>
            <div className="space-y-3">
              {outcomeTypes.map((outcome) => (
                <div key={outcome.value} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-primary text-sm">{outcome.value}</code>
                      <span className="font-medium">{outcome.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{outcome.description}</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600">
                    {outcome.credit}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-primary/5 border-primary/20">
            <h4 className="font-medium text-primary mb-2">Custom Attribution Rules</h4>
            <p className="text-sm">
              You can override default credit amounts by configuring custom attribution rules in the Deal Room's 
              <strong> Credits</strong> tab. Rules can be set per agent, per outcome type, or per deal room.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
