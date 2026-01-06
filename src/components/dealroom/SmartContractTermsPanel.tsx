import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { downloadTermsAsText, copyTermsToClipboard } from "@/utils/exportTerms";
import { VoiceNarrationButton } from "@/components/voice/VoiceNarrationButton";
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Library,
  Grip,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Share2
} from "lucide-react";

interface Term {
  id: string;
  deal_room_id: string;
  section_type: string;
  section_order: number;
  title: string;
  content: string;
  is_required: boolean;
  is_editable: boolean;
  agreed_by: Record<string, boolean> | null;
  created_at: string;
}

interface Clause {
  id: string;
  clause_name: string;
  clause_type: string;
  content_template: string;
  variables: unknown;
  description: string | null;
  is_standard: boolean;
  industry: string | null;
}

interface SmartContractTermsPanelProps {
  dealRoomId: string;
  dealRoomName?: string;
  isAdmin: boolean;
  participants: Array<{ id: string; name: string; email: string; user_id: string | null }>;
}

const sectionTypeConfig: Record<string, { label: string; order: number }> = {
  recitals: { label: "Recitals", order: 1 },
  definitions: { label: "Definitions", order: 2 },
  representations: { label: "Representations & Warranties", order: 3 },
  covenants: { label: "Covenants", order: 4 },
  conditions: { label: "Conditions", order: 5 },
  payment_terms: { label: "Payment Terms", order: 6 },
  ip_ownership: { label: "IP Ownership", order: 7 },
  confidentiality: { label: "Confidentiality", order: 8 },
  termination: { label: "Termination", order: 9 },
  dispute_resolution: { label: "Dispute Resolution", order: 10 },
  miscellaneous: { label: "Miscellaneous", order: 11 },
};

export const SmartContractTermsPanel = ({ dealRoomId, dealRoomName = 'Deal Room Contract', isAdmin, participants }: SmartContractTermsPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [terms, setTerms] = useState<Term[]>([]);
  const [clauseLibrary, setClauseLibrary] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClauseLibrary, setShowClauseLibrary] = useState(false);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");
  
  const [newTerm, setNewTerm] = useState({
    section_type: "recitals",
    title: "",
    content: "",
    is_required: true,
  });
  
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch terms
      const { data: termsData, error: termsError } = await supabase
        .from("deal_room_terms")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .order("section_order", { ascending: true });
      
      if (termsError) throw termsError;
      setTerms((termsData || []).map(t => ({
        ...t,
        agreed_by: (t.agreed_by as Record<string, boolean>) || {}
      })));
      
      // Fetch clause library
      const { data: clausesData, error: clausesError } = await supabase
        .from("smart_contract_clause_library")
        .select("*")
        .order("clause_type", { ascending: true });
      
      if (clausesError) throw clausesError;
      setClauseLibrary(clausesData || []);
    } catch (error) {
      console.error("Error fetching terms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromLibrary = async (clause: Clause) => {
    // Replace variables in template
    let content = clause.content_template;
    const variables = Array.isArray(clause.variables) ? clause.variables as string[] : [];
    
    variables.forEach((variable) => {
      const value = variableValues[variable] || `[${variable}]`;
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    try {
      const maxOrder = terms.filter(t => t.section_type === clause.clause_type).length;
      
      const { error } = await supabase
        .from("deal_room_terms")
        .insert({
          deal_room_id: dealRoomId,
          section_type: clause.clause_type,
          section_order: maxOrder + 1,
          title: clause.clause_name,
          content: content,
          is_required: true,
        });

      if (error) throw error;

      toast({
        title: "Term Added",
        description: `"${clause.clause_name}" has been added to your contract.`,
      });

      setShowClauseLibrary(false);
      setVariableValues({});
      fetchData();
    } catch (error) {
      console.error("Error adding term:", error);
      toast({
        title: "Error",
        description: "Failed to add term.",
        variant: "destructive",
      });
    }
  };

  const handleAddCustomTerm = async () => {
    if (!newTerm.title.trim() || !newTerm.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a title and content for the term.",
        variant: "destructive",
      });
      return;
    }

    try {
      const maxOrder = terms.filter(t => t.section_type === newTerm.section_type).length;
      
      const { error } = await supabase
        .from("deal_room_terms")
        .insert({
          deal_room_id: dealRoomId,
          section_type: newTerm.section_type,
          section_order: maxOrder + 1,
          title: newTerm.title.trim(),
          content: newTerm.content.trim(),
          is_required: newTerm.is_required,
        });

      if (error) throw error;

      toast({
        title: "Term Added",
        description: "Custom term has been added to your contract.",
      });

      setShowAddTerm(false);
      setNewTerm({ section_type: "recitals", title: "", content: "", is_required: true });
      fetchData();
    } catch (error) {
      console.error("Error adding custom term:", error);
      toast({
        title: "Error",
        description: "Failed to add term.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    try {
      const { error } = await supabase
        .from("deal_room_terms")
        .delete()
        .eq("id", termId);

      if (error) throw error;

      toast({
        title: "Term Removed",
        description: "The term has been removed from the contract.",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting term:", error);
      toast({
        title: "Error",
        description: "Failed to remove term.",
        variant: "destructive",
      });
    }
  };

  const handleAgreeToTerm = async (termId: string) => {
    if (!user) return;

    const term = terms.find(t => t.id === termId);
    if (!term) return;

    const newAgreedBy = { ...((term.agreed_by as Record<string, boolean>) || {}), [user.id]: true };

    try {
      const { error } = await supabase
        .from("deal_room_terms")
        .update({ agreed_by: newAgreedBy })
        .eq("id", termId);

      if (error) throw error;

      toast({
        title: "Agreement Recorded",
        description: "Your agreement to this term has been recorded.",
      });
      fetchData();
    } catch (error) {
      console.error("Error recording agreement:", error);
      toast({
        title: "Error",
        description: "Failed to record agreement.",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (termId: string) => {
    setExpandedTerms(prev => {
      const next = new Set(prev);
      if (next.has(termId)) {
        next.delete(termId);
      } else {
        next.add(termId);
      }
      return next;
    });
  };

  // Group terms by section type
  const termsBySection = terms.reduce((acc, term) => {
    if (!acc[term.section_type]) {
      acc[term.section_type] = [];
    }
    acc[term.section_type].push(term);
    return acc;
  }, {} as Record<string, Term[]>);

  // Calculate agreement status
  const getAgreementStatus = (term: Term) => {
    const participantUserIds = participants.filter(p => p.user_id).map(p => p.user_id!);
    const agreedBy = (term.agreed_by as Record<string, boolean>) || {};
    const agreedCount = participantUserIds.filter(uid => agreedBy[uid]).length;
    return {
      agreed: agreedCount,
      total: participantUserIds.length,
      complete: agreedCount === participantUserIds.length && participantUserIds.length > 0,
    };
  };

  const filteredSections = selectedSectionFilter === "all" 
    ? Object.keys(sectionTypeConfig)
    : [selectedSectionFilter];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  const handleExport = () => {
    downloadTermsAsText({
      dealName: dealRoomName,
      terms,
      participants,
      includeAgreementStatus: true,
    });
    toast({
      title: "Export Complete",
      description: "Your contract has been downloaded as a text file.",
    });
  };

  const handleCopy = async () => {
    const success = await copyTermsToClipboard({
      dealName: dealRoomName,
      terms,
      participants,
      includeAgreementStatus: true,
    });
    toast({
      title: success ? "Copied to Clipboard" : "Copy Failed",
      description: success 
        ? "Contract text copied. Paste it anywhere to share."
        : "Failed to copy to clipboard.",
      variant: success ? "default" : "destructive",
    });
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold">Smart Contract Terms</h3>
          <Badge variant="secondary" className="text-xs">{terms.length} terms</Badge>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {terms.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-xs sm:text-sm">
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Download as Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {isAdmin && (
            <>
              <Dialog open={showClauseLibrary} onOpenChange={setShowClauseLibrary}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Library className="w-4 h-4" />
                    Clause Library
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Smart Contract Clause Library</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="all">
                    <TabsList className="flex-wrap h-auto">
                      <TabsTrigger value="all">All</TabsTrigger>
                      {Object.entries(sectionTypeConfig).map(([key, config]) => (
                        <TabsTrigger key={key} value={key}>{config.label}</TabsTrigger>
                      ))}
                    </TabsList>
                    <ScrollArea className="h-[400px] mt-4">
                      <div className="space-y-3">
                        {clauseLibrary
                          .filter(clause => {
                            const activeTab = document.querySelector('[data-state="active"]')?.getAttribute('value');
                            return activeTab === "all" || clause.clause_type === activeTab;
                          })
                          .map((clause) => {
                            const variables = Array.isArray(clause.variables) ? clause.variables as string[] : [];
                            return (
                              <div key={clause.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">{clause.clause_name}</span>
                                      <Badge variant="outline">{sectionTypeConfig[clause.clause_type]?.label}</Badge>
                                      {clause.is_standard && <Badge className="bg-green-500/20 text-green-400">Standard</Badge>}
                                    </div>
                                    {clause.description && (
                                      <p className="text-sm text-muted-foreground mb-2">{clause.description}</p>
                                    )}
                                    <div className="text-xs bg-muted/50 p-2 rounded mt-2 max-h-20 overflow-hidden">
                                      {clause.content_template.slice(0, 200)}...
                                    </div>
                                    
                                    {variables.length > 0 && (
                                      <div className="mt-3 space-y-2">
                                        <span className="text-xs font-medium text-muted-foreground">Fill in variables:</span>
                                        <div className="grid grid-cols-2 gap-2">
                                          {variables.map((variable) => (
                                            <Input
                                              key={variable}
                                              placeholder={variable.replace(/_/g, ' ')}
                                              value={variableValues[variable] || ''}
                                              onChange={(e) => setVariableValues({
                                                ...variableValues,
                                                [variable]: e.target.value,
                                              })}
                                              className="h-8 text-sm"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <Button size="sm" onClick={() => handleAddFromLibrary(clause)}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </Tabs>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showAddTerm} onOpenChange={setShowAddTerm}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Custom Term
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Term</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Section Type</label>
                      <Select
                        value={newTerm.section_type}
                        onValueChange={(v) => setNewTerm({ ...newTerm, section_type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(sectionTypeConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Title</label>
                      <Input
                        placeholder="e.g., Commission Split Agreement"
                        value={newTerm.title}
                        onChange={(e) => setNewTerm({ ...newTerm, title: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Content</label>
                      <Textarea
                        placeholder="Enter the full legal text of this term..."
                        value={newTerm.content}
                        onChange={(e) => setNewTerm({ ...newTerm, content: e.target.value })}
                        rows={6}
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowAddTerm(false)}>Cancel</Button>
                      <Button onClick={handleAddCustomTerm}>Add Term</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Section Filter */}
      <div className="mb-4">
        <Select value={selectedSectionFilter} onValueChange={setSelectedSectionFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {Object.entries(sectionTypeConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {terms.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No contract terms defined yet.</p>
          {isAdmin && <p className="text-sm mt-1">Use the Clause Library or add custom terms to build your smart contract.</p>}
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-6">
            {filteredSections
              .filter(section => termsBySection[section]?.length > 0)
              .sort((a, b) => sectionTypeConfig[a].order - sectionTypeConfig[b].order)
              .map((sectionType) => (
                <div key={sectionType}>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Grip className="w-4 h-4" />
                    {sectionTypeConfig[sectionType]?.label || sectionType}
                  </h4>
                  
                  <div className="space-y-2">
                    {termsBySection[sectionType].map((term) => {
                      const isExpanded = expandedTerms.has(term.id);
                      const agreementStatus = getAgreementStatus(term);
                      const hasAgreed = user && (term.agreed_by as Record<string, boolean>)?.[user.id];
                      
                      return (
                        <div key={term.id} className="border rounded-lg overflow-hidden">
                          <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => toggleExpand(term.id)}
                          >
                            <div className="flex items-center gap-3">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              <span className="font-medium">{term.title}</span>
                              {term.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={agreementStatus.complete 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-yellow-500/20 text-yellow-400"
                                }
                              >
                                {agreementStatus.agreed}/{agreementStatus.total} agreed
                              </Badge>
                              
                              {hasAgreed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Clock className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="border-t p-4 bg-muted/20">
                              <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="whitespace-pre-wrap text-sm flex-1">{term.content}</p>
                                  <VoiceNarrationButton 
                                    text={`${term.title}. ${term.content}`}
                                    showPersonaSelector={true}
                                    defaultPersona="biz"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-xs text-muted-foreground">
                                  Agreed by: {Object.keys((term.agreed_by as Record<string, boolean>) || {}).filter(k => (term.agreed_by as Record<string, boolean>)?.[k]).length} participant(s)
                                </div>
                                
                                <div className="flex gap-2">
                                  {isAdmin && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTerm(term.id);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Remove
                                    </Button>
                                  )}
                                  
                                  {!hasAgreed && (
                                    <Button 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAgreeToTerm(term.id);
                                      }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      I Agree to This Term
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
