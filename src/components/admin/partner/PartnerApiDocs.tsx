import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PartnerApiDocsProps {
  partnerName?: string;
}

const API_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-agent-integration`;

const CODE_EXAMPLES = {
  hubspot_create_contact: `{
  "action": "hubspot_create_contact",
  "execution_context": {
    "hubspot_account_id": "YOUR_PORTAL_ID",
    "contact_data": {
      "email": "john@example.com",
      "firstname": "John",
      "lastname": "Smith",
      "company": "Example Corp",
      "jobtitle": "Property Manager",
      "signal_source": "permit_filing",
      "signal_details": "New 200-unit development approved"
    }
  }
}`,
  hubspot_create_deal: `{
  "action": "hubspot_create_deal",
  "execution_context": {
    "hubspot_account_id": "YOUR_PORTAL_ID",
    "deal_data": {
      "dealname": "Example Deal - 200 Units",
      "pipeline": "default",
      "dealstage": "appointmentscheduled",
      "amount": "50000"
    },
    "associations": []
  }
}`,
  hubspot_update_contact: `{
  "action": "hubspot_update_contact",
  "execution_context": {
    "hubspot_account_id": "YOUR_PORTAL_ID",
    "contact_id": "123456",
    "contact_data": {
      "company": "Updated Company Name",
      "jobtitle": "Senior Manager"
    }
  }
}`,
  hubspot_create_task: `{
  "action": "hubspot_create_task",
  "execution_context": {
    "hubspot_account_id": "YOUR_PORTAL_ID",
    "task_data": {
      "hs_task_subject": "Follow up on proposal",
      "hs_task_body": "Review the submitted proposal",
      "hs_task_priority": "HIGH",
      "hs_task_status": "NOT_STARTED"
    },
    "associations": {
      "contact_id": "123456"
    }
  }
}`,
  log_signal: `{
  "action": "log_signal",
  "execution_context": {
    "signal_type": "permit_filing",
    "signal_source": "Signal Scout Agent",
    "entity_data": {
      "company_name": "Luxury Apartments LLC",
      "location": "Austin, TX",
      "permit_type": "New Construction",
      "units": 200
    },
    "confidence_score": 0.92,
    "hubspot_account_id": "YOUR_PORTAL_ID"
  }
}`,
  emit_contribution: `{
  "action": "emit_contribution",
  "execution_context": {
    "event_type": "signal_detected",
    "agent_slug": "partner_optimo_signal_scout",
    "description": "Detected new development opportunity",
    "compute_credits": 1,
    "action_credits": 5
  }
}`,
};

const ACTIONS = [
  { name: "hubspot_create_contact", desc: "Create a new contact in HubSpot", agent: "Signal Scout, Account Intel" },
  { name: "hubspot_create_deal", desc: "Create a new deal in HubSpot", agent: "Signal Scout" },
  { name: "hubspot_update_contact", desc: "Update existing contact properties", agent: "Account Intel" },
  { name: "hubspot_update_deal", desc: "Update existing deal properties", agent: "Account Intel" },
  { name: "hubspot_create_engagement", desc: "Log emails/calls/meetings", agent: "Sequence + Draft" },
  { name: "hubspot_create_task", desc: "Create follow-up tasks", agent: "Booking + Follow-Up" },
  { name: "hubspot_get_timeline", desc: "Read contact/deal activity", agent: "Daily Prep" },
  { name: "log_signal", desc: "Log detected signals to Biz Dev", agent: "Signal Scout" },
  { name: "emit_contribution", desc: "Track credits for agent activity", agent: "All agents" },
  { name: "trigger_settlement", desc: "Trigger settlement workflow", agent: "Operations" },
];

export function PartnerApiDocs({ partnerName }: PartnerApiDocsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Partner API Documentation
          {partnerName && <Badge variant="outline">{partnerName}</Badge>}
        </CardTitle>
        <CardDescription>
          Complete API reference for partner integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Endpoint Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">API Endpoint</h3>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <code className="flex-1 text-xs break-all">POST {API_ENDPOINT}</code>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(API_ENDPOINT, "Endpoint")}
            >
              {copied === "Endpoint" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Authentication Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Authentication</h3>
          <div className="p-3 bg-muted rounded-md space-y-2">
            <p className="text-xs text-muted-foreground">Include your API token in the request header:</p>
            <code className="block text-xs bg-background p-2 rounded">
              X-Partner-API-Key: pit_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            </code>
          </div>
        </div>

        {/* Actions Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Available Actions</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Action</th>
                  <th className="px-3 py-2 text-left font-medium">Description</th>
                  <th className="px-3 py-2 text-left font-medium">Used By</th>
                </tr>
              </thead>
              <tbody>
                {ACTIONS.map((action, i) => (
                  <tr key={action.name} className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                    <td className="px-3 py-2">
                      <code className="text-xs">{action.name}</code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{action.desc}</td>
                    <td className="px-3 py-2 text-xs">{action.agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Code Examples */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Request Examples</h3>
          <Tabs defaultValue="hubspot_create_contact" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1">
              {Object.keys(CODE_EXAMPLES).map((key) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {key.replace(/_/g, " ")}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(CODE_EXAMPLES).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <div className="relative">
                  <pre className="p-4 bg-muted rounded-md overflow-x-auto text-xs">
                    {code}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code, key)}
                  >
                    {copied === key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Error Codes */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Error Codes</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted rounded-md">
              <span className="font-mono text-destructive">401</span>
              <span className="ml-2 text-muted-foreground">Invalid or missing API key</span>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <span className="font-mono text-destructive">403</span>
              <span className="ml-2 text-muted-foreground">Access denied to resource</span>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <span className="font-mono text-destructive">429</span>
              <span className="ml-2 text-muted-foreground">Rate limit exceeded</span>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <span className="font-mono text-destructive">500</span>
              <span className="ml-2 text-muted-foreground">Server error</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
