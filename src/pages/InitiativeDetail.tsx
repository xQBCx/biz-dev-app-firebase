import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import {
  Rocket,
  ArrowLeft,
  Users,
  Building,
  CheckCircle,
  FolderOpen,
  Calendar,
  Workflow,
  Shield,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface Initiative {
  id: string;
  name: string;
  description: string | null;
  initiative_type: string;
  status: string;
  created_at: string;
  scaffolded_entities: any;
  generated_content: any;
  progress_percent: number | null;
}

interface ContributionEvent {
  id: string;
  event_hash: string;
  xodiak_anchor_status: string;
  created_at: string;
  payload: any;
}

const InitiativeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [anchorEvent, setAnchorEvent] = useState<ContributionEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (id && user) {
      loadInitiative();
    }
  }, [id, user]);

  const loadInitiative = async () => {
    if (!id || !user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("initiatives")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setInitiative(data);

      // Fetch XODIAK anchor status
      const { data: events } = await supabase
        .from("contribution_events")
        .select("id, event_hash, xodiak_anchor_status, created_at, payload")
        .eq("event_type", "workflow_triggered")
        .eq("actor_id", "initiative-architect-agi")
        .order("created_at", { ascending: false })
        .limit(10);

      // Find the event matching this initiative
      const matchingEvent = events?.find(
        (e: any) => e.payload?.initiative_id === id
      );
      if (matchingEvent) {
        setAnchorEvent(matchingEvent as ContributionEvent);
      }
    } catch (error) {
      console.error("Error loading initiative:", error);
      toast.error("Failed to load initiative");
      navigate("/initiatives");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitiative();
    setIsRefreshing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; label: string }> = {
      scaffolding: { class: "bg-yellow-500/10 text-yellow-500", label: "Scaffolding" },
      ready: { class: "bg-blue-500/10 text-blue-500", label: "Ready" },
      active: { class: "bg-green-500/10 text-green-500", label: "Active" },
      completed: { class: "bg-purple-500/10 text-purple-500", label: "Completed" },
      archived: { class: "bg-muted text-muted-foreground", label: "Archived" }
    };
    return config[status] || { class: "bg-muted text-muted-foreground", label: status };
  };

  const getAnchorStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any }> = {
      pending: { class: "bg-yellow-500/10 text-yellow-500", icon: Clock },
      queued: { class: "bg-blue-500/10 text-blue-500", icon: Clock },
      anchored: { class: "bg-green-500/10 text-green-500", icon: Shield }
    };
    return config[status] || { class: "bg-muted text-muted-foreground", icon: Clock };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <Card className="p-8 text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Initiative Not Found</h2>
          <Button onClick={() => navigate("/initiatives")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Initiatives
          </Button>
        </Card>
      </div>
    );
  }

  const statusBadge = getStatusBadge(initiative.status);
  const content = initiative.generated_content || {};
  const entities = initiative.scaffolded_entities || {};

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/initiatives")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{initiative.name}</h1>
              <Badge className={statusBadge.class}>{statusBadge.label}</Badge>
              {anchorEvent && (
                <Badge className={getAnchorStatusBadge(anchorEvent.xodiak_anchor_status).class}>
                  <Shield className="w-3 h-3 mr-1" />
                  XODIAK {anchorEvent.xodiak_anchor_status}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Created {new Date(initiative.created_at).toLocaleDateString()} • {initiative.initiative_type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WhitePaperIcon moduleKey="initiative-architect" moduleName="Initiative Architect" variant="button" />
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        {content.summary && (
          <Card className="p-6 mb-8 shadow-elevated border border-border">
            <h2 className="text-lg font-semibold mb-2">AI Summary</h2>
            <p className="text-muted-foreground">{content.summary}</p>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Contacts", value: entities.contacts || 0, icon: Users },
            { label: "Companies", value: entities.companies || 0, icon: Building },
            { label: "Tasks", value: entities.tasks || 0, icon: CheckCircle },
            { label: "Folders", value: entities.erp_folders || 0, icon: FolderOpen },
            { label: "Deal Room", value: entities.deal_room ? "Yes" : "No", icon: Workflow }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 shadow-elevated border border-border">
              <stat.icon className="w-5 h-5 mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-3xl">
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="erp">ERP</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="xodiak">XODIAK</TabsTrigger>
          </TabsList>

          <TabsContent value="crm">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contacts */}
              <Card className="p-6 shadow-elevated border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Contacts Created</h3>
                </div>
                <ScrollArea className="h-64">
                  {content.crm_contacts?.length > 0 ? (
                    <div className="space-y-3">
                      {content.crm_contacts.map((contact: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium">
                            {contact.first_name} {contact.last_name}
                          </div>
                          {contact.title && (
                            <div className="text-sm text-muted-foreground">{contact.title}</div>
                          )}
                          <Badge variant="outline" className="mt-2 text-xs">
                            {contact.role_in_initiative}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No contacts created</p>
                  )}
                </ScrollArea>
                <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/crm")}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in CRM
                </Button>
              </Card>

              {/* Companies */}
              <Card className="p-6 shadow-elevated border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Companies Created</h3>
                </div>
                <ScrollArea className="h-64">
                  {content.crm_companies?.length > 0 ? (
                    <div className="space-y-3">
                      {content.crm_companies.map((company: any, idx: number) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium">{company.name}</div>
                          {company.industry && (
                            <div className="text-sm text-muted-foreground">{company.industry}</div>
                          )}
                          <Badge variant="outline" className="mt-2 text-xs">
                            {company.role_in_initiative}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No companies created</p>
                  )}
                </ScrollArea>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Tasks Generated</h3>
              </div>
              <ScrollArea className="h-80">
                {content.tasks?.length > 0 ? (
                  <div className="space-y-3">
                    {content.tasks.map((task: any, idx: number) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due in {task.due_offset_days} days
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No tasks generated</p>
                )}
              </ScrollArea>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/tasks")}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View in Tasks
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="erp">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">ERP Folder Structure</h3>
              </div>
              <ScrollArea className="h-64">
                {content.erp_folders?.length > 0 ? (
                  <div className="space-y-2">
                    {content.erp_folders.map((folder: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{folder}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No folders created</p>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="workflows">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Workflow className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Suggested Workflows</h3>
              </div>
              <ScrollArea className="h-80">
                {content.workflows?.length > 0 ? (
                  <div className="space-y-4">
                    {content.workflows.map((workflow: any, idx: number) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                        <div className="font-medium mb-1">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {workflow.description}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          <strong>Trigger:</strong> {workflow.trigger}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.steps?.map((step: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {i + 1}. {step}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No workflows suggested</p>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Calendar Events</h3>
              </div>
              <ScrollArea className="h-64">
                {content.calendar_events?.length > 0 ? (
                  <div className="space-y-3">
                    {content.calendar_events.map((event: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>In {event.offset_days} days</span>
                          <span>•</span>
                          <span>{event.duration_hours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No calendar events scheduled</p>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="xodiak">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">XODIAK Ledger Proof</h3>
              </div>
              {anchorEvent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Anchor Status</span>
                      <Badge className={getAnchorStatusBadge(anchorEvent.xodiak_anchor_status).class}>
                        {anchorEvent.xodiak_anchor_status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Event Hash</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                            {anchorEvent.event_hash?.substring(0, 16)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(anchorEvent.event_hash)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Logged At</span>
                        <span>{new Date(anchorEvent.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This initiative's scaffolding has been cryptographically logged to the XODIAK
                    ledger, providing immutable proof of the AI-generated project structure and
                    all created entities.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No XODIAK anchor event found yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The event may still be processing
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={() => navigate("/deal-rooms/new")}>
            Create Deal Room
          </Button>
          <Button onClick={() => navigate("/initiatives")}>
            Back to All Initiatives
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InitiativeDetail;
