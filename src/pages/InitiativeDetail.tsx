import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  RefreshCw,
  BookOpen,
  Play,
  Target,
  FileText
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

interface CRMContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  title: string | null;
  tags: string[] | null;
}

interface CRMCompany {
  id: string;
  name: string;
  industry: string | null;
  description: string | null;
}

const InitiativeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [anchorEvent, setAnchorEvent] = useState<ContributionEvent | null>(null);
  const [linkedContacts, setLinkedContacts] = useState<CRMContact[]>([]);
  const [linkedCompanies, setLinkedCompanies] = useState<CRMCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRescaffolding, setIsRescaffolding] = useState(false);

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

      // Fetch linked CRM contacts
      const { data: contacts } = await supabase
        .from("crm_contacts")
        .select("id, first_name, last_name, email, title, tags")
        .eq("initiative_id", id);
      setLinkedContacts(contacts || []);

      // Fetch linked CRM companies
      const { data: companies } = await supabase
        .from("crm_companies")
        .select("id, name, industry, description")
        .eq("initiative_id", id);
      setLinkedCompanies(companies || []);

      // Fetch XODIAK anchor status - query by payload containing initiative_id
      const { data: events } = await supabase
        .from("contribution_events")
        .select("id, event_hash, xodiak_anchor_status, created_at, payload")
        .eq("event_type", "workflow_triggered")
        .order("created_at", { ascending: false })
        .limit(50);

      // Find the event matching this initiative by checking payload
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

  const handleRescaffold = async () => {
    if (!initiative) return;
    setIsRescaffolding(true);
    try {
      const { error } = await supabase.functions.invoke("initiative-architect", {
        body: {
          initiative_id: initiative.id,
          goal_statement: initiative.description || initiative.name,
          initiative_type: initiative.initiative_type
        }
      });
      if (error) throw error;
      toast.success("Re-scaffolding initiated - refreshing in a few seconds...");
      // Poll for completion
      setTimeout(() => loadInitiative(), 5000);
    } catch (error) {
      console.error("Error re-scaffolding:", error);
      toast.error("Failed to re-scaffold initiative");
    } finally {
      setIsRescaffolding(false);
    }
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
  const curriculum = content.curriculum;

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
            {initiative.status === "scaffolding" && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleRescaffold} 
                disabled={isRescaffolding}
              >
                <Play className={`w-4 h-4 mr-2 ${isRescaffolding ? "animate-pulse" : ""}`} />
                {isRescaffolding ? "Re-scaffolding..." : "Re-scaffold"}
              </Button>
            )}
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Contacts", value: linkedContacts.length || entities.contacts || 0, icon: Users },
            { label: "Companies", value: linkedCompanies.length || entities.companies || 0, icon: Building },
            { label: "Tasks", value: entities.tasks || 0, icon: CheckCircle },
            { label: "Folders", value: entities.erp_folders || 0, icon: FolderOpen },
            { label: "Deal Room", value: entities.deal_room ? "Yes" : "No", icon: Workflow },
            { label: "Curriculum", value: curriculum ? "Yes" : "No", icon: BookOpen }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 shadow-elevated border border-border">
              <stat.icon className="w-5 h-5 mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue={curriculum ? "curriculum" : "crm"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 max-w-4xl">
            <TabsTrigger value="curriculum" disabled={!curriculum}>
              <BookOpen className="w-4 h-4 mr-1" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="erp">ERP</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="xodiak">XODIAK</TabsTrigger>
          </TabsList>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum">
            {curriculum ? (
              <div className="space-y-6">
                {/* Curriculum Header */}
                <Card className="p-6 shadow-elevated border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{curriculum.title}</h2>
                      <p className="text-muted-foreground">{curriculum.overview}</p>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      <Target className="w-3 h-3 mr-1" />
                      {curriculum.target_audience}
                    </Badge>
                  </div>
                  
                  {/* Learning Objectives */}
                  {curriculum.learning_objectives?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Learning Objectives
                      </h3>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {curriculum.learning_objectives.map((obj: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>

                {/* Modules */}
                {curriculum.modules?.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Course Modules</h3>
                    {curriculum.modules.map((module: any, idx: number) => (
                      <Card key={idx} className="p-6 shadow-elevated border border-border">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge className="mb-2">Module {module.number || idx + 1}</Badge>
                            <h4 className="text-lg font-semibold">{module.title}</h4>
                          </div>
                          <Badge variant="outline">{module.duration}</Badge>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                          {/* Topics */}
                          <div>
                            <h5 className="font-medium text-sm mb-2 text-muted-foreground">Topics</h5>
                            <ul className="space-y-1">
                              {module.topics?.map((topic: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Activities */}
                          <div>
                            <h5 className="font-medium text-sm mb-2 text-muted-foreground">Activities</h5>
                            <ul className="space-y-1">
                              {module.activities?.map((activity: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <Play className="w-3 h-3 text-blue-500 mt-0.5" />
                                  {activity}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Materials */}
                          <div>
                            <h5 className="font-medium text-sm mb-2 text-muted-foreground">Materials Needed</h5>
                            <ul className="space-y-1">
                              {module.materials_needed?.map((material: string, i: number) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <FileText className="w-3 h-3 text-muted-foreground mt-0.5" />
                                  {material}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Expected Outcomes */}
                {curriculum.outcomes?.length > 0 && (
                  <Card className="p-6 shadow-elevated border border-border">
                    <h3 className="font-semibold mb-3">Expected Outcomes</h3>
                    <ul className="space-y-2">
                      {curriculum.outcomes.map((outcome: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Target className="w-4 h-4 text-primary mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Curriculum Generated</h3>
                <p className="text-muted-foreground mb-4">
                  This initiative type may not include curriculum content.
                </p>
                <Button onClick={handleRescaffold} disabled={isRescaffolding}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-scaffold with Curriculum
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="crm">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contacts */}
              <Card className="p-6 shadow-elevated border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Linked Contacts ({linkedContacts.length})</h3>
                  </div>
                </div>
                <ScrollArea className="h-64">
                  {linkedContacts.length > 0 ? (
                    <div className="space-y-3">
                      {linkedContacts.map((contact) => (
                        <div 
                          key={contact.id} 
                          className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => navigate(`/crm/contacts/${contact.id}`)}
                        >
                          <div className="font-medium">
                            {contact.first_name} {contact.last_name}
                          </div>
                          {contact.title && (
                            <div className="text-sm text-muted-foreground">{contact.title}</div>
                          )}
                          {contact.email && (
                            <div className="text-xs text-muted-foreground">{contact.email}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : content.crm_contacts?.length > 0 ? (
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
                <Button 
                  variant="outline" 
                  className="w-full mt-4" 
                  onClick={() => navigate(`/crm?initiative_id=${initiative.id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in CRM (Filtered)
                </Button>
              </Card>

              {/* Companies */}
              <Card className="p-6 shadow-elevated border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Linked Companies ({linkedCompanies.length})</h3>
                  </div>
                </div>
                <ScrollArea className="h-64">
                  {linkedCompanies.length > 0 ? (
                    <div className="space-y-3">
                      {linkedCompanies.map((company) => (
                        <div 
                          key={company.id} 
                          className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => navigate(`/crm/companies/${company.id}`)}
                        >
                          <div className="font-medium">{company.name}</div>
                          {company.industry && (
                            <div className="text-sm text-muted-foreground">{company.industry}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : content.crm_companies?.length > 0 ? (
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

            {/* Deal Room Link */}
            {entities.deal_room_id && (
              <Card className="p-6 mt-6 shadow-elevated border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Workflow className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Deal Room Created</h3>
                      <p className="text-sm text-muted-foreground">
                        A deal room was scaffolded for this initiative
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/deal-rooms/${entities.deal_room_id}`)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Deal Room
                  </Button>
                </div>
              </Card>
            )}
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
                <h3 className="font-semibold">XODIAK Blockchain Proof</h3>
              </div>

              {anchorEvent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Anchor Status</span>
                      <Badge className={getAnchorStatusBadge(anchorEvent.xodiak_anchor_status).class}>
                        {anchorEvent.xodiak_anchor_status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Event Hash</span>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-background px-2 py-1 rounded">
                            {anchorEvent.event_hash.substring(0, 16)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(anchorEvent.event_hash)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Timestamp</span>
                        <span>{new Date(anchorEvent.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-500">Immutable Proof</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          This initiative's origin and scaffolding is cryptographically anchored to XODIAK,
                          providing immutable proof of when and how this project was conceived.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-medium mb-2">Awaiting XODIAK Anchor</h4>
                  <p className="text-sm text-muted-foreground">
                    The blockchain proof for this initiative is being processed.
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InitiativeDetail;