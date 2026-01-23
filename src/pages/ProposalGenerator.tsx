import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import {
  FileText,
  Plus,
  Send,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  Filter,
  LayoutTemplate,
  Building2,
  User,
  ArrowLeft,
  Rocket
} from "lucide-react";
import { toast } from "sonner";

interface ProposalTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  structure: any;
  branding: any;
  is_default: boolean;
  created_at: string;
}

interface GeneratedProposal {
  id: string;
  title: string;
  proposal_number: string | null;
  template_id: string | null;
  deal_room_id: string | null;
  target_company_id: string | null;
  target_contact_id: string | null;
  initiative_id?: string | null;
  generated_content: any;
  pricing: any;
  status: string;
  pdf_url: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  created_at: string;
}

interface Initiative {
  id: string;
  name: string;
  description: string | null;
}

const ProposalGenerator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initiativeId = searchParams.get('initiative');
  const dealRoomIdParam = searchParams.get('deal_room');
  
  const { user, loading, isAuthenticated } = useAuth();
  const { activeClientId } = useActiveClient();
  const [activeTab, setActiveTab] = useState("proposals");
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [proposals, setProposals] = useState<GeneratedProposal[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [dealRooms, setDealRooms] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [linkedInitiative, setLinkedInitiative] = useState<Initiative | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [newProposal, setNewProposal] = useState({
    title: "",
    template_type: "partnership",
    target_company_id: "",
    target_contact_id: "",
    deal_room_id: dealRoomIdParam || "",
    initiative_id: initiativeId || "",
    custom_prompt: ""
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeClientId]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: templatesData } = await supabase.from("proposal_templates").select("*").eq("user_id", user.id);
      const { data: proposalsData } = await supabase.from("generated_proposals").select("*").eq("user_id", user.id);
      const { data: companiesData } = await supabase.from("crm_companies").select("id, name").eq("user_id", user.id);
      const { data: contactsData } = await supabase.from("crm_contacts").select("id, first_name, last_name, email").eq("user_id", user.id);
      const dealRoomsResult = await supabase.from("deal_rooms" as any).select("id, name").eq("creator_id", user.id);
      const dealRoomsData = dealRoomsResult.data as unknown as { id: string; name: string }[] | null;
      const { data: initiativesData } = await supabase.from("initiatives").select("id, name, description").eq("user_id", user.id).order("created_at", { ascending: false });

      setTemplates((templatesData || []) as ProposalTemplate[]);
      setProposals((proposalsData || []) as GeneratedProposal[]);
      setCompanies(companiesData || []);
      setContacts(contactsData || []);
      setDealRooms(dealRoomsData || []);
      setInitiatives((initiativesData || []) as Initiative[]);
      
      // If linked to initiative, load its details
      if (initiativeId) {
        const { data: initiative } = await supabase
          .from("initiatives")
          .select("id, name, description")
          .eq("id", initiativeId)
          .single();
        if (initiative) {
          setLinkedInitiative(initiative);
          // Pre-fill proposal title
          setNewProposal(prev => ({
            ...prev,
            title: `Proposal: ${initiative.name}`,
            initiative_id: initiative.id,
            custom_prompt: initiative.description || ""
          }));
          // Auto-open dialog if from initiative
          setShowNewProposal(true);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load proposal data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (!user || !newProposal.title) {
      toast.error("Please provide a title");
      return;
    }

    setIsGenerating(true);
    try {
      // Create the proposal record
      const proposalNumber = `PROP-${Date.now().toString(36).toUpperCase()}`;
      
      const insertData: any = {
        user_id: user.id,
        title: newProposal.title,
        proposal_number: proposalNumber,
        generated_content: {
          template_type: newProposal.template_type,
          custom_prompt: newProposal.custom_prompt,
          sections: []
        },
        status: "draft"
      };
      
      if (activeClientId) insertData.client_id = activeClientId;
      if (newProposal.target_company_id) insertData.target_company_id = newProposal.target_company_id;
      if (newProposal.target_contact_id) insertData.target_contact_id = newProposal.target_contact_id;
      if (newProposal.deal_room_id) insertData.deal_room_id = newProposal.deal_room_id;
      if (newProposal.initiative_id) insertData.initiative_id = newProposal.initiative_id;

      const { data: proposal, error } = await supabase.from("generated_proposals").insert(insertData).select().single();

      if (error) throw error;

      // Call generate-proposal edge function
      const { error: genError } = await supabase.functions.invoke("generate-proposal", {
        body: { 
          proposal_id: proposal.id,
          template_type: newProposal.template_type,
          custom_prompt: newProposal.custom_prompt,
          target_company_id: newProposal.target_company_id,
          target_contact_id: newProposal.target_contact_id,
          deal_room_id: newProposal.deal_room_id
        }
      });

      if (genError) {
        console.warn("Generation function not yet deployed:", genError);
        toast.info("Proposal created - AI generation coming soon");
      } else {
        toast.success("Proposal generated successfully!");
      }

      setShowNewProposal(false);
      setNewProposal({
        title: "",
        template_type: "partnership",
        target_company_id: "",
        target_contact_id: "",
        deal_room_id: "",
        initiative_id: "",
        custom_prompt: ""
      });
      // Navigate to initiative if we came from one
      if (initiativeId) {
        navigate(`/initiatives/${initiativeId}`);
      } else {
        loadData();
      }
    } catch (error) {
      console.error("Error generating proposal:", error);
      toast.error("Failed to generate proposal");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateProposalStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === "sent") updates.sent_at = new Date().toISOString();
      
      const { error } = await supabase
        .from("generated_proposals")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast.success(`Proposal marked as ${status}`);
      loadData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-muted text-muted-foreground";
      case "review": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "sent": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "viewed": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "accepted": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTemplateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      executive_landing: "Executive Landing",
      investment_tour: "Investment Tour",
      consulting: "Consulting",
      property: "Property",
      workshop: "Workshop",
      partnership: "Partnership",
      service: "Service",
      custom: "Custom"
    };
    return labels[type] || type;
  };

  const stats = {
    total: proposals.length,
    draft: proposals.filter(p => p.status === "draft").length,
    sent: proposals.filter(p => p.status === "sent").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    viewed: proposals.filter(p => p.status === "viewed").length
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Back button when linked to initiative or deal room */}
        {(linkedInitiative || dealRoomIdParam) && (
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => linkedInitiative ? navigate(`/initiatives/${linkedInitiative.id}`) : navigate(`/deal-rooms/${dealRoomIdParam}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {linkedInitiative ? linkedInitiative.name : 'Deal Room'}
          </Button>
        )}
        
        {/* Initiative Context Banner */}
        {linkedInitiative && (
          <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Creating proposal for: {linkedInitiative.name}</p>
                {linkedInitiative.description && (
                  <p className="text-sm text-muted-foreground">{linkedInitiative.description}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <FileText className="w-10 h-10 text-primary" />
                AI Proposal Generator
              </h1>
              <p className="text-muted-foreground">
                Generate professional, branded proposals powered by AI
              </p>
            </div>
            <WhitePaperIcon moduleKey="proposal-generator" moduleName="Proposal Generator" variant="button" />
          </div>
          <Dialog open={showNewProposal} onOpenChange={setShowNewProposal}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Proposal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Generate New Proposal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Proposal Title</Label>
                  <Input
                    placeholder="e.g., Executive Landing Package for ABC Corp"
                    value={newProposal.title}
                    onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Type</Label>
                    <Select
                      value={newProposal.template_type}
                      onValueChange={(v) => setNewProposal({ ...newProposal, template_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive_landing">Executive Landing</SelectItem>
                        <SelectItem value="investment_tour">Investment Tour</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Link to Initiative (optional)</Label>
                    <Select
                      value={newProposal.initiative_id || "none"}
                      onValueChange={(v) => setNewProposal({ ...newProposal, initiative_id: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select initiative" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {initiatives.map((init) => (
                          <SelectItem key={init.id} value={init.id}>{init.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link to Deal Room (optional)</Label>
                    <Select
                      value={newProposal.deal_room_id || "none"}
                      onValueChange={(v) => setNewProposal({ ...newProposal, deal_room_id: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select deal room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {dealRooms.map((dr) => (
                          <SelectItem key={dr.id} value={dr.id}>{dr.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Company (optional)</Label>
                    <Select
                      value={newProposal.target_company_id || "none"}
                      onValueChange={(v) => setNewProposal({ ...newProposal, target_company_id: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Contact (optional)</Label>
                    <Select
                      value={newProposal.target_contact_id || "none"}
                      onValueChange={(v) => setNewProposal({ ...newProposal, target_contact_id: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Custom Instructions (optional)</Label>
                  <Textarea
                    placeholder="Add specific details, pricing, or requirements for this proposal..."
                    value={newProposal.custom_prompt}
                    onChange={(e) => setNewProposal({ ...newProposal, custom_prompt: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleGenerateProposal} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Proposal
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Proposals", value: stats.total, icon: FileText, color: "text-blue-500" },
            { label: "Drafts", value: stats.draft, icon: Clock, color: "text-muted-foreground" },
            { label: "Sent", value: stats.sent, icon: Send, color: "text-purple-500" },
            { label: "Viewed", value: stats.viewed, icon: Eye, color: "text-yellow-500" },
            { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "text-green-500" }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 shadow-elevated border border-border">
              <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="proposals">
              <FileText className="w-4 h-4 mr-2" />
              Proposals
            </TabsTrigger>
            <TabsTrigger value="templates">
              <LayoutTemplate className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="mt-6">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredProposals.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Proposals Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Generate your first AI-powered proposal
                </p>
                <Button onClick={() => setShowNewProposal(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Proposal
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredProposals.map((proposal) => (
                  <Card key={proposal.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
                          {proposal.proposal_number && (
                            <span className="text-xs text-muted-foreground font-mono">
                              {proposal.proposal_number}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{proposal.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created {new Date(proposal.created_at).toLocaleDateString()}</span>
                          {proposal.sent_at && (
                            <span className="flex items-center gap-1">
                              <Send className="w-3 h-3" />
                              Sent {new Date(proposal.sent_at).toLocaleDateString()}
                            </span>
                          )}
                          {proposal.viewed_at && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Viewed {new Date(proposal.viewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        {proposal.pdf_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={proposal.pdf_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </a>
                          </Button>
                        )}
                        {proposal.status === "draft" && (
                          <Button 
                            size="sm"
                            onClick={() => updateProposalStatus(proposal.id, "sent")}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { type: "executive_landing", name: "Executive Landing Package", desc: "Short-term office, car service, welcome brief" },
                { type: "investment_tour", name: "Investment Tour", desc: "Curated meetings with vetted opportunities" },
                { type: "consulting", name: "Consulting Engagement", desc: "Professional advisory services" },
                { type: "property", name: "Property Management", desc: "Luxury accommodation proposal" },
                { type: "workshop", name: "Workshop Partnership", desc: "Educational program partnership" },
                { type: "partnership", name: "Business Partnership", desc: "General partnership proposal" }
              ].map((template) => (
                <Card 
                  key={template.type} 
                  className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all cursor-pointer"
                  onClick={() => {
                    setNewProposal({ ...newProposal, template_type: template.type });
                    setShowNewProposal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <LayoutTemplate className="w-8 h-8 text-primary" />
                    <Badge variant="outline">{template.type}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.desc}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProposalGenerator;
