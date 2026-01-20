import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useInstincts } from "@/hooks/useInstincts";
import { useActiveClient } from "@/hooks/useActiveClient";
import { useCRMGovernments } from "@/hooks/useCRMGovernments";
import { useCRMRegions } from "@/hooks/useCRMRegions";
import { supabase } from "@/integrations/supabase/client";
import { AIAssistant } from "@/components/AIAssistant";
import { ContactImportModal } from "@/components/ContactImportModal";
import { PDFContactImport } from "@/components/PDFContactImport";
import { LindyAIWorkflows } from "@/components/LindyAIWorkflows";
import { CRMAnalytics } from "@/components/crm/CRMAnalytics";
import { CRMGovernmentCard } from "@/components/crm/CRMGovernmentCard";
import { CRMRegionCard } from "@/components/crm/CRMRegionCard";
import { CRMGovernmentForm } from "@/components/crm/CRMGovernmentForm";
import { CRMRegionForm } from "@/components/crm/CRMRegionForm";
import { CRMContactMerge } from "@/components/crm/CRMContactMerge";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Building2,
  Target,
  CheckSquare,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Zap,
  FileText,
  FileSpreadsheet,
  BarChart3,
  Landmark,
  X,
  Merge
} from "lucide-react";
import { toast } from "sonner";

const CRM = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initiativeFilter = searchParams.get("initiative_id");
  const { user, loading, isAuthenticated } = useAuth();
  const { activeClientId, activeClientName } = useActiveClient();
  const { trackEntityCreated, trackClick } = useInstincts();
  const { governments, createGovernment, researchGovernment } = useCRMGovernments();
  const { regions, createRegion, researchRegion } = useCRMRegions();
  const [activeTab, setActiveTab] = useState("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyMap, setCompanyMap] = useState<Map<string, string>>(new Map());
  const [deals, setDeals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPDFImportModal, setShowPDFImportModal] = useState(false);
  const [showGovernmentForm, setShowGovernmentForm] = useState(false);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [initiativeName, setInitiativeName] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalCompanies: 0,
    totalDeals: 0,
    totalRevenue: 0,
    openDeals: 0,
    pendingActivities: 0
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  // Fetch initiative name if filtering
  useEffect(() => {
    if (initiativeFilter) {
      supabase
        .from("initiatives")
        .select("name")
        .eq("id", initiativeFilter)
        .single()
        .then(({ data }) => {
          if (data) setInitiativeName(data.name);
        });
    } else {
      setInitiativeName(null);
    }
  }, [initiativeFilter]);

  useEffect(() => {
    if (user) {
      loadCRMData();
    }
  }, [user, activeClientId, initiativeFilter]);

  const loadCRMData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Build queries with optional client_id filter
      let contactsQuery = supabase.from("crm_contacts").select("*").eq("user_id", user.id);
      let companiesQuery = supabase.from("crm_companies").select("*").eq("user_id", user.id);
      let dealsQuery = supabase.from("crm_deals").select("*").eq("user_id", user.id);
      let activitiesQuery = supabase.from("crm_activities").select("*").eq("user_id", user.id);
      const integrationsQuery = supabase.from("crm_integrations").select("*").eq("user_id", user.id);

      // Apply initiative filter if present (takes precedence)
      if (initiativeFilter) {
        contactsQuery = contactsQuery.eq("initiative_id", initiativeFilter);
        companiesQuery = companiesQuery.eq("initiative_id", initiativeFilter);
      } else if (activeClientId) {
        // Apply client filter if a workspace is selected
        contactsQuery = contactsQuery.eq("client_id", activeClientId);
        companiesQuery = companiesQuery.eq("client_id", activeClientId);
        dealsQuery = dealsQuery.eq("client_id", activeClientId);
        activitiesQuery = activitiesQuery.eq("client_id", activeClientId);
      } else {
        // Personal workspace: show only records without a client_id
        contactsQuery = contactsQuery.is("client_id", null);
        companiesQuery = companiesQuery.is("client_id", null);
        dealsQuery = dealsQuery.is("client_id", null);
        activitiesQuery = activitiesQuery.is("client_id", null);
      }

      const [contactsRes, companiesRes, dealsRes, activitiesRes, integrationsRes] = await Promise.all([
        contactsQuery,
        companiesQuery,
        dealsQuery,
        activitiesQuery,
        integrationsQuery
      ]);

      if (contactsRes.error) throw contactsRes.error;
      if (companiesRes.error) throw companiesRes.error;
      if (dealsRes.error) throw dealsRes.error;
      if (activitiesRes.error) throw activitiesRes.error;
      if (integrationsRes.error) throw integrationsRes.error;

      setContacts(contactsRes.data || []);
      setCompanies(companiesRes.data || []);
      
      // Build company ID to name map
      const newCompanyMap = new Map<string, string>();
      for (const company of companiesRes.data || []) {
        newCompanyMap.set(company.id, company.name);
      }
      setCompanyMap(newCompanyMap);
      
      setDeals(dealsRes.data || []);
      setActivities(activitiesRes.data || []);
      setIntegrations(integrationsRes.data || []);

      // Calculate stats
      const totalRevenue = (dealsRes.data || [])
        .filter((d: any) => d.status === "won")
        .reduce((sum: number, d: any) => sum + (parseFloat(d.amount) || 0), 0);

      const openDeals = (dealsRes.data || []).filter((d: any) => d.status === "open").length;
      const pendingActivities = (activitiesRes.data || []).filter((a: any) => a.status === "pending").length;

      setStats({
        totalContacts: contactsRes.data?.length || 0,
        totalCompanies: companiesRes.data?.length || 0,
        totalDeals: dealsRes.data?.length || 0,
        totalRevenue,
        openDeals,
        pendingActivities
      });

    } catch (error) {
      console.error("Error loading CRM data:", error);
      toast.error("Failed to load CRM data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    const csv = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Department', 'Lead Status'].join(','),
      ...contacts.map(c => [
        c.first_name, c.last_name, c.email, c.phone || '', c.title || '', 
        c.department || '', c.lead_status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Contacts exported successfully");
  };

  const handleImport = () => {
    setShowImportModal(true);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const filteredContacts = contacts.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompanies = companies.filter(c =>
    `${c.name} ${c.industry}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDeals = deals.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearInitiativeFilter = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Initiative Filter Banner */}
        {initiativeFilter && initiativeName && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Filtered by Initiative</p>
                  <p className="font-semibold text-lg">{initiativeName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearInitiativeFilter}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filter
              </Button>
            </div>
          </div>
        )}
        {/* Workspace Indicator */}
        {activeClientId && !initiativeFilter && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Workspace</p>
                  <p className="font-semibold text-lg">{activeClientName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/clients")}
              >
                Switch Workspace
              </Button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2">Proprietary CRM</h1>
              <p className="text-muted-foreground">Manage your contacts, deals, and customer relationships</p>
            </div>
            <WhitePaperIcon moduleKey="crm" moduleName="CRM" variant="button" />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowImportModal(true)}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Import from Excel/CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPDFImportModal(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Import from PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => navigate("/integrations")}>
              <Settings className="w-4 h-4 mr-2" />
              Integrations
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Contacts", value: stats.totalContacts, icon: Users, color: "text-blue-500" },
            { label: "Companies", value: stats.totalCompanies, icon: Building2, color: "text-purple-500" },
            { label: "Total Deals", value: stats.totalDeals, icon: Target, color: "text-orange-500" },
            { label: "Revenue", value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "text-green-500" },
            { label: "Open Deals", value: stats.openDeals, icon: TrendingUp, color: "text-amber-500" },
            { label: "Pending Tasks", value: stats.pendingActivities, icon: CheckSquare, color: "text-red-500" }
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 shadow-elevated border border-border">
              <stat.icon className={`w-6 h-6 mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts, companies, or deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8 max-w-5xl">
            <TabsTrigger value="contacts">
              <Users className="w-4 h-4 mr-2" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="companies">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="governments">
              <Building2 className="w-4 h-4 mr-2" />
              Govts
            </TabsTrigger>
            <TabsTrigger value="regions">
              <MapPin className="w-4 h-4 mr-2" />
              Regions
            </TabsTrigger>
            <TabsTrigger value="deals">
              <Target className="w-4 h-4 mr-2" />
              Deals
            </TabsTrigger>
            <TabsTrigger value="activities">
              <CheckSquare className="w-4 h-4 mr-2" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Zap className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Contacts ({filteredContacts.length})</h2>
                {selectedContacts.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedContacts.length} selected
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {selectedContacts.length >= 2 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowMergeModal(true)}
                    className="gap-2"
                  >
                    <Merge className="w-4 h-4" />
                    Merge Selected ({selectedContacts.length})
                  </Button>
                )}
                {selectedContacts.length > 0 && (
                  <Button variant="outline" onClick={selectAllContacts}>
                    Deselect All
                  </Button>
                )}
                <Button onClick={() => navigate("/crm/contacts/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>

            {filteredContacts.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Contacts Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your network by adding your first contact
                </p>
                <Button onClick={() => navigate("/crm/contacts/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
              </Card>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    checked={selectedContacts.length === filteredContacts.length}
                    onCheckedChange={selectAllContacts}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      className={`p-6 shadow-elevated border transition-all cursor-pointer ${
                        selectedContacts.includes(contact.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:shadow-glow'
                      }`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
                          toggleContactSelection(contact.id);
                        } else {
                          navigate(`/crm/contacts/${contact.id}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onCheckedChange={() => toggleContactSelection(contact.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {contact.first_name[0]}{contact.last_name[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold">{contact.first_name} {contact.last_name}</h3>
                            {contact.title && <p className="text-sm text-muted-foreground">{contact.title}</p>}
                            {contact.company_id && companyMap.get(contact.company_id) && (
                              <p className="text-xs text-primary">{companyMap.get(contact.company_id)}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary">{contact.lead_status}</Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{contact.email || <span className="italic">No email</span>}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.lead_score > 0 && (
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Lead Score:</span>
                            <Badge variant="outline">{contact.lead_score}/100</Badge>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Companies ({filteredCompanies.length})</h2>
              <Button onClick={() => navigate("/crm/companies/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </div>

            {filteredCompanies.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Companies Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add companies to track your business relationships
                </p>
                <Button onClick={() => navigate("/crm/companies/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Company
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.map((company) => (
                  <Card key={company.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate(`/crm/companies/${company.id}`)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-10 h-10 text-primary" />
                        <div>
                          <h3 className="font-semibold">{company.name}</h3>
                          {company.industry && <p className="text-sm text-muted-foreground">{company.industry}</p>}
                        </div>
                      </div>
                      <Badge>{company.status}</Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      {company.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ExternalLink className="w-4 h-4" />
                          <span className="truncate">{company.website}</span>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{company.email}</span>
                        </div>
                      )}
                      {company.annual_revenue && (
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-semibold">${(company.annual_revenue / 1000000).toFixed(1)}M</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Deals ({filteredDeals.length})</h2>
              <Button onClick={() => navigate("/crm/deals/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Deal
              </Button>
            </div>

            {filteredDeals.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Deals Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Track your sales opportunities and close more deals
                </p>
                <Button onClick={() => navigate("/crm/deals/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Deal
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Pipeline View */}
                <div className="grid md:grid-cols-4 gap-4">
                  {["qualification", "proposal", "negotiation", "closed"].map((stage) => {
                    const stageDeals = filteredDeals.filter(d => d.stage === stage);
                    const stageValue = stageDeals.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                    
                    return (
                      <div key={stage}>
                        <div className="mb-3">
                          <h3 className="font-semibold capitalize mb-1">{stage}</h3>
                          <p className="text-sm text-muted-foreground">{stageDeals.length} deals · ${(stageValue / 1000).toFixed(1)}K</p>
                        </div>
                        <div className="space-y-2">
                          {stageDeals.map((deal) => (
                            <Card 
                              key={deal.id} 
                              className="p-4 shadow-elevated border border-border hover:shadow-glow transition-all cursor-pointer"
                              onClick={() => navigate(`/crm/deals/${deal.id}`)}
                            >
                              <h4 className="font-semibold mb-2">{deal.name}</h4>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">${(parseFloat(deal.amount) || 0).toLocaleString()}</span>
                                <Badge variant="outline">{deal.probability}%</Badge>
                              </div>
                              {deal.expected_close_date && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(deal.expected_close_date).toLocaleDateString()}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Activities ({activities.length})</h2>
              <Button onClick={() => navigate("/crm/activities/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            {activities.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <CheckSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Track calls, meetings, and tasks with your contacts
                </p>
                <Button onClick={() => navigate("/crm/activities/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Activity
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Card key={activity.id} className="p-4 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{activity.activity_type}</Badge>
                          <h3 className="font-semibold">{activity.subject}</h3>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                        )}
                        {activity.due_date && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(activity.due_date).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Governments Tab */}
          <TabsContent value="governments" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Governments ({governments.length})</h2>
              <Button onClick={() => setShowGovernmentForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Government
              </Button>
            </div>
            {governments.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Landmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Government Entities Yet</h3>
                <p className="text-muted-foreground mb-6">Track government relationships for procurement and grants</p>
                <Button onClick={() => setShowGovernmentForm(true)}><Plus className="w-4 h-4 mr-2" />Add Government</Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {governments.map((gov) => (
                  <CRMGovernmentCard key={gov.id} government={gov} onResearch={researchGovernment} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Regions ({regions.length})</h2>
              <Button onClick={() => setShowRegionForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Region
              </Button>
            </div>
            {regions.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Regions Yet</h3>
                <p className="text-muted-foreground mb-6">Track geographic regions, resources, and sustainability data</p>
                <Button onClick={() => setShowRegionForm(true)}><Plus className="w-4 h-4 mr-2" />Add Region</Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.map((region) => (
                  <CRMRegionCard key={region.id} region={region} onResearch={researchRegion} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <CRMAnalytics
              contacts={contacts}
              companies={companies}
              deals={deals}
              activities={activities}
            />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="mt-6 space-y-4">
            <LindyAIWorkflows />
          </TabsContent>
        </Tabs>
      </div>

      <ContactImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportComplete={loadCRMData}
      />

      <PDFContactImport
        open={showPDFImportModal}
        onOpenChange={setShowPDFImportModal}
        onSuccess={loadCRMData}
      />

      <AIAssistant context={{ type: "crm" }} position="bottom-right" />

      {/* Contact Merge Modal */}
      <CRMContactMerge
        contacts={filteredContacts.filter(c => selectedContacts.includes(c.id))}
        open={showMergeModal}
        onOpenChange={setShowMergeModal}
        onMergeComplete={() => {
          loadCRMData();
          setSelectedContacts([]);
          setShowMergeModal(false);
        }}
      />
    </div>
  );
};

export default CRM;
