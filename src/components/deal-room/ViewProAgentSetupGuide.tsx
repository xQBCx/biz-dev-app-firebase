import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { 
  Copy, 
  Check, 
  Bot, 
  Radar, 
  Brain, 
  Mail, 
  Calendar, 
  FileText,
  Zap,
  ArrowRight,
  ExternalLink,
  Code,
  Database
} from "lucide-react";

interface ViewProAgentSetupGuideProps {
  dealRoomId: string;
}

export const ViewProAgentSetupGuide = ({ dealRoomId }: ViewProAgentSetupGuideProps) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'eoskcsbytaurtqrnuraw';
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/log-external-agent-activity`;

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
    toast.success("Copied to clipboard");
  };

  const agents = [
    {
      id: "signal_scout",
      name: "Signal Scout Agent",
      icon: <Radar className="w-5 h-5" />,
      purpose: "Continuously monitor real-world change tied to target accounts and emit only high-signal events that justify outreach.",
      category: "signal_detection",
      signalTypes: [
        "New construction permits",
        "Major renovations / expansions",
        "Property acquisitions or dispositions",
        "Leadership changes (CEO, Ops, Facilities, Real Estate)",
        "Funding events (where relevant)",
        "Multi-location expansion indicators"
      ],
      outputSchema: `{
  "event_type": "PERMIT_ISSUED | ROLE_CHANGE | ACQUISITION",
  "company_id": "hubspot_company_id | null",
  "company_name": "string",
  "signal_strength": 0.0-1.0,
  "summary": "human-readable explanation",
  "source_url": "string",
  "recommended_action": "OUTREACH | WATCH | IGNORE",
  "timestamp": "ISO-8601"
}`,
      webhookPayload: {
        agent_slug: "signal_scout",
        platform: "lindy_ai",
        activity_type: "trigger_detected",
        outcome_type: "trigger_detected",
        deal_room_id: dealRoomId,
        target: {
          company_domain: "example.com"
        },
        metadata: {
          event_type: "PERMIT_ISSUED",
          signal_strength: 0.85,
          summary: "New commercial permit filed for 50,000 sqft expansion"
        }
      }
    },
    {
      id: "account_intel",
      name: "Account Intel Agent",
      icon: <Brain className="w-5 h-5" />,
      purpose: "Turn a raw signal into usable sales context.",
      category: "enrichment",
      actions: [
        "Identify decision-makers (Facilities, Ops, Real Estate, Ownership)",
        "Enrich missing data (industry, locations, recent activity)",
        "Generate 3-5 talking points tied directly to the signal"
      ],
      outputSchema: `{
  "company_id": "hubspot_id",
  "decision_makers": [...],
  "context_summary": "...",
  "talking_points": [...],
  "risk_notes": "...",
  "confidence_score": 0.0-1.0
}`,
      webhookPayload: {
        agent_slug: "account_intel",
        platform: "lindy_ai",
        activity_type: "enrichment_complete",
        outcome_type: "enrichment_complete",
        deal_room_id: dealRoomId,
        target: {
          contact_email: "john@example.com",
          company_domain: "example.com"
        },
        metadata: {
          decision_makers_found: 3,
          talking_points: ["Recent expansion", "New leadership", "Industry trends"],
          confidence_score: 0.92
        }
      }
    },
    {
      id: "sequence_draft",
      name: "Sequence + Draft Agent",
      icon: <Mail className="w-5 h-5" />,
      purpose: "Convert signal + intel into non-generic outreach drafts.",
      category: "outreach",
      constraints: [
        "Drafts only (no sending)",
        "Max 1-2 messages per signal",
        "Channel-aware tone (email vs LinkedIn)"
      ],
      outputSchema: `{
  "draft_id": "uuid",
  "channel": "EMAIL | LINKEDIN",
  "subject": "string",
  "body": "string",
  "associated_signal": "event_id",
  "approval_status": "PENDING"
}`,
      webhookPayload: {
        agent_slug: "sequence_draft",
        platform: "lindy_ai",
        activity_type: "draft_created",
        outcome_type: "draft_created",
        deal_room_id: dealRoomId,
        target: {
          contact_email: "john@example.com"
        },
        metadata: {
          channel: "EMAIL",
          subject: "Your recent expansion project",
          body_preview: "Hi John, I noticed your company recently filed permits for...",
          sequence_step: 1
        }
      }
    },
    {
      id: "booking_followup",
      name: "Booking + Follow-Up Agent",
      icon: <Calendar className="w-5 h-5" />,
      purpose: "Ensure nothing slips after outreach begins.",
      category: "scheduling",
      monitors: ["Opens", "Replies", "Bounces", "Calendar bookings"],
      actions: [
        "Create follow-up tasks",
        "Adjust cadence timing",
        "Push meetings to calendars",
        "Log attribution events (who/what caused booking)"
      ],
      webhookPayload: {
        agent_slug: "booking_followup",
        platform: "lindy_ai",
        activity_type: "meeting_booked",
        outcome_type: "meeting_set",
        deal_room_id: dealRoomId,
        target: {
          contact_email: "john@example.com",
          company_domain: "example.com"
        },
        metadata: {
          meeting_date: "2026-01-15T14:00:00Z",
          meeting_type: "Discovery Call",
          booked_via: "email_reply"
        }
      }
    },
    {
      id: "daily_prep",
      name: "Daily Prep Agent",
      icon: <FileText className="w-5 h-5" />,
      purpose: "Make humans sharper before meetings.",
      category: "intelligence",
      inputs: [
        "Today's calendar",
        "Recent signals",
        "Account intel",
        "Prior communications"
      ],
      outputBrief: [
        "Who you're meeting",
        "What changed recently",
        "What to review (links)",
        "3 smart questions to ask"
      ],
      webhookPayload: {
        agent_slug: "daily_prep",
        platform: "lindy_ai",
        activity_type: "brief_generated",
        outcome_type: "other",
        deal_room_id: dealRoomId,
        metadata: {
          meetings_today: 3,
          signals_since_last_brief: 5,
          accounts_researched: 3
        }
      }
    }
  ];

  const buildOrder = [
    { step: 1, agent: "Signal Scout", mode: "read-only, shadow" },
    { step: 2, agent: "Account Intel", mode: "HubSpot enrichment" },
    { step: 3, agent: "Sequence + Draft", mode: "draft-only" },
    { step: 4, agent: "Booking + Follow-Up", mode: "tasks only" },
    { step: 5, agent: "Daily Prep", mode: "read-only briefing" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          The View Pro Agent System Setup
        </h2>
        <p className="text-muted-foreground mt-1">
          Complete developer guide for implementing the 5-agent sales automation system
        </p>
      </div>

      {/* Global Constraints */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4" />
            Global Constraints & Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CRM</span>
                <span className="font-medium">HubSpot (Private App API)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Volume</span>
                <span className="font-medium">Max 2/company/week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Operating Mode</span>
                <Badge variant="secondary">Shadow → Gated</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From Address</span>
                <span className="font-medium">hello@theviewpro.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Review UI</span>
                <span className="font-medium">Biz Dev Deal Room</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Attribution</span>
                <Badge variant="outline">XODIAK Ready</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Endpoint */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium">Activity Logging Endpoint</span>
              </div>
              <code className="text-xs bg-background px-2 py-1 rounded block truncate">
                {webhookUrl}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(webhookUrl, 'webhook')}
            >
              {copiedSection === 'webhook' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Build Order */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Implementation Order</CardTitle>
          <CardDescription>Each agent builds on the previous one</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {buildOrder.map((item, index) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
                  <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0">
                    {item.step}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{item.agent}</p>
                    <p className="text-xs text-muted-foreground">{item.mode}</p>
                  </div>
                </div>
                {index < buildOrder.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Specifications */}
      <Tabs defaultValue="signal_scout" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          {agents.map((agent) => (
            <TabsTrigger 
              key={agent.id} 
              value={agent.id}
              className="flex flex-col gap-1 py-2 text-xs"
            >
              {agent.icon}
              <span className="hidden sm:inline">{agent.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {agents.map((agent) => (
          <TabsContent key={agent.id} value={agent.id} className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {agent.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.purpose}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  {/* Capabilities */}
                  <AccordionItem value="capabilities">
                    <AccordionTrigger className="text-sm">
                      Capabilities & Actions
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-sm">
                        {(agent.signalTypes || agent.actions || agent.monitors || agent.inputs || agent.constraints)?.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      {agent.outputBrief && (
                        <div className="mt-4">
                          <p className="font-medium text-sm mb-2">Daily Brief Output:</p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {agent.outputBrief.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Output Schema */}
                  {agent.outputSchema && (
                    <AccordionItem value="schema">
                      <AccordionTrigger className="text-sm">
                        Output Schema
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(agent.outputSchema!, `schema-${agent.id}`)}
                          >
                            {copiedSection === `schema-${agent.id}` ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                            {agent.outputSchema}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {/* Webhook Payload */}
                  <AccordionItem value="webhook">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Webhook Payload Example
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(
                            JSON.stringify(agent.webhookPayload, null, 2), 
                            `payload-${agent.id}`
                          )}
                        >
                          {copiedSection === `payload-${agent.id}` ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                          {JSON.stringify(agent.webhookPayload, null, 2)}
                        </pre>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        POST this payload to the webhook endpoint with your API key in the <code className="bg-muted px-1 rounded">x-api-key</code> header.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Attribution Note */}
      <Card className="bg-amber-500/10 border-amber-500/20">
        <CardContent className="pt-4">
          <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Attribution & Logging (Critical)
          </h4>
          <p className="text-sm text-amber-700/80">
            Every agent action emits: <strong>Agent ID</strong>, <strong>Action type</strong>, 
            <strong>Resource used</strong>, and <strong>Value proxy</strong> (signal strength, meeting booked, reply).
            This feeds partner compensation logic, credit-based accounting, and future XODIAK ledger integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
