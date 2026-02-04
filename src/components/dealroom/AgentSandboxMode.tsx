import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FlaskConical, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Mail,
  Database,
  Webhook,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SandboxEvent {
  id: string;
  timestamp: Date;
  agentSlug: string;
  action: string;
  wouldHaveTriggered: string;
  payload: Record<string, unknown>;
  status: "captured" | "simulated";
}

interface AgentSandboxModeProps {
  dealRoomId: string;
}

export const AgentSandboxMode = ({ dealRoomId }: AgentSandboxModeProps) => {
  const { toast } = useToast();
  const [sandboxEnabled, setSandboxEnabled] = useState(false);
  const [capturedEvents, setCapturedEvents] = useState<SandboxEvent[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      agentSlug: "lindy-outreach",
      action: "send_email",
      wouldHaveTriggered: "Email to prospect@company.com",
      payload: { to: "prospect@company.com", subject: "Partnership Opportunity" },
      status: "captured"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      agentSlug: "hubspot-sync",
      action: "create_contact",
      wouldHaveTriggered: "HubSpot contact creation",
      payload: { email: "lead@example.com", name: "John Doe" },
      status: "simulated"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      agentSlug: "calendar-agent",
      action: "schedule_meeting",
      wouldHaveTriggered: "Calendar invite sent",
      payload: { attendees: ["user@example.com"], time: "2024-01-15T14:00:00Z" },
      status: "captured"
    }
  ]);

  const handleToggleSandbox = (enabled: boolean) => {
    setSandboxEnabled(enabled);
    toast({
      title: enabled ? "Sandbox Mode Enabled" : "Sandbox Mode Disabled",
      description: enabled 
        ? "Agent actions will be captured without triggering real events"
        : "Agents will now execute real actions",
    });
  };

  const handleReplayEvent = (event: SandboxEvent) => {
    toast({
      title: "Event Replayed",
      description: `Simulated ${event.action} from ${event.agentSlug}`,
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "send_email":
        return <Mail className="h-4 w-4" />;
      case "create_contact":
      case "update_deal":
        return <Database className="h-4 w-4" />;
      case "webhook":
        return <Webhook className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Sandbox Mode</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={sandboxEnabled ? "default" : "outline"} className={sandboxEnabled ? "bg-purple-500" : ""}>
              {sandboxEnabled ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={sandboxEnabled}
              onCheckedChange={handleToggleSandbox}
            />
          </div>
        </div>
        <CardDescription>
          Test agent workflows without triggering real emails, CRM updates, or external API calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sandboxEnabled && (
          <div className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <AlertTriangle className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-purple-700 dark:text-purple-300">
              All agent actions are being captured. No real events will be triggered.
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-foreground">{capturedEvents.length}</div>
            <div className="text-xs text-muted-foreground">Captured Events</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-foreground">
              {capturedEvents.filter(e => e.status === "simulated").length}
            </div>
            <div className="text-xs text-muted-foreground">Simulated</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-foreground">0</div>
            <div className="text-xs text-muted-foreground">Real Actions Blocked</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Captured Event Log
          </h4>
          <ScrollArea className="h-[250px] border rounded-lg">
            <div className="p-3 space-y-2">
              {capturedEvents.map((event) => (
                <div 
                  key={event.id}
                  className="p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-border transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-background rounded-md">
                        {getActionIcon(event.action)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{event.agentSlug}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.action}
                          </Badge>
                          {event.status === "captured" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Would have triggered: {event.wouldHaveTriggered}
                        </p>
                        <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-1 rounded">
                          {JSON.stringify(event.payload).slice(0, 60)}...
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleReplayEvent(event)}
                        className="h-7 text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Replay
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Export Captured Events
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Clear Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
