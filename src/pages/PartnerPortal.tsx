import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import { PartnerTeamManager } from "@/components/partner/PartnerTeamManager";
import {
  Users,
  Plus,
  DollarSign,
  Handshake,
  TrendingUp,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  Settings,
  Info,
  UsersRound
} from "lucide-react";
import { toast } from "sonner";

interface Partner {
  id: string;
  partner_name: string;
  partner_type: string;
  services_offered: string[];
  commission_structure: any;
  email: string | null;
  phone: string | null;
  access_token: string;
  is_active: boolean;
  onboarded_at: string | null;
  created_at: string;
}

interface Commission {
  id: string;
  partner_id: string;
  contribution_type: string;
  description: string | null;
  commission_rate: number;
  base_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

const PartnerPortal = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { activeClientId } = useActiveClient();
  const [activeTab, setActiveTab] = useState("partners");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [myPartnerIntegration, setMyPartnerIntegration] = useState<any>(null);

  const [newPartner, setNewPartner] = useState({
    partner_name: "",
    partner_type: "consulting",
    email: "",
    phone: "",
    services: "",
    default_rate: "10",
    contact_id: "",
    company_id: ""
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
      const [partnersRes, commissionsRes, contactsRes, companiesRes, myIntegrationRes] = await Promise.all([
        supabase.from("registered_partners").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("partner_commissions").select("*"),
        supabase.from("crm_contacts").select("id, first_name, last_name").eq("user_id", user.id),
        supabase.from("crm_companies").select("id, name").eq("user_id", user.id),
        // Check if user is part of a partner integration (as owner or team member)
        supabase.from("partner_team_members")
          .select(`
            id,
            role,
            partner_integration_id,
            partner_integrations (
              id,
              partner_name,
              is_active
            )
          `)
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle()
      ]);

      if (partnersRes.error) throw partnersRes.error;

      setPartners(partnersRes.data || []);
      setCommissions(commissionsRes.data || []);
      setContacts(contactsRes.data || []);
      setCompanies(companiesRes.data || []);
      
      // Set partner integration info for Team tab
      if (myIntegrationRes.data?.partner_integrations) {
        setMyPartnerIntegration({
          id: myIntegrationRes.data.partner_integration_id,
          name: (myIntegrationRes.data.partner_integrations as any).partner_name,
          role: myIntegrationRes.data.role,
          isActive: (myIntegrationRes.data.partner_integrations as any).is_active
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load partner data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPartner = async () => {
    if (!user || !newPartner.partner_name) {
      toast.error("Please provide a partner name");
      return;
    }

    try {
      const { error } = await supabase.from("registered_partners").insert({
        user_id: user.id,
        partner_name: newPartner.partner_name,
        partner_type: newPartner.partner_type,
        email: newPartner.email || null,
        phone: newPartner.phone || null,
        services_offered: newPartner.services.split(",").map(s => s.trim()).filter(Boolean),
        commission_structure: { default_rate: parseFloat(newPartner.default_rate) || 10 },
        contact_id: newPartner.contact_id || null,
        company_id: newPartner.company_id || null
      });

      if (error) throw error;

      toast.success("Partner added successfully");
      setShowAddPartner(false);
      setNewPartner({
        partner_name: "",
        partner_type: "consulting",
        email: "",
        phone: "",
        services: "",
        default_rate: "10",
        contact_id: "",
        company_id: ""
      });
      loadData();
    } catch (error) {
      console.error("Error adding partner:", error);
      toast.error("Failed to add partner");
    }
  };

  const copyPortalLink = (accessToken: string) => {
    const link = `${window.location.origin}/partner-portal/${accessToken}`;
    navigator.clipboard.writeText(link);
    toast.success("Portal link copied to clipboard");
  };

  const getPartnerTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      legal: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      industrial: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      real_estate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      consulting: "bg-green-500/10 text-green-500 border-green-500/20",
      technology: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      financial: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      marketing: "bg-pink-500/10 text-pink-500 border-pink-500/20"
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const getCommissionStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "approved": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "paid": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "disputed": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.is_active).length,
    totalCommissions: commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    pendingCommissions: commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + (c.commission_amount || 0), 0),
    paidCommissions: commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Handshake className="w-10 h-10 text-primary" />
                Partner Portal
              </h1>
              <p className="text-muted-foreground">
                Manage partners, track commissions, and attribution
              </p>
            </div>
            <WhitePaperIcon moduleKey="partner-portal" moduleName="Partner Portal" variant="button" />
          </div>
          <Dialog open={showAddPartner} onOpenChange={setShowAddPartner}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register New Partner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Partner Name</Label>
                  <Input
                    placeholder="e.g., John Graves Legal Services"
                    value={newPartner.partner_name}
                    onChange={(e) => setNewPartner({ ...newPartner, partner_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Partner Type</Label>
                    <Select
                      value={newPartner.partner_type}
                      onValueChange={(v) => setNewPartner({ ...newPartner, partner_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Commission Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newPartner.default_rate}
                      onChange={(e) => setNewPartner({ ...newPartner, default_rate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="partner@example.com"
                      value={newPartner.email}
                      onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={newPartner.phone}
                      onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Services Offered (comma-separated)</Label>
                  <Input
                    placeholder="e.g., Legal review, Contract drafting, M&A support"
                    value={newPartner.services}
                    onChange={(e) => setNewPartner({ ...newPartner, services: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link to CRM Contact</Label>
                    <Select
                      value={newPartner.contact_id}
                      onValueChange={(v) => setNewPartner({ ...newPartner, contact_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.first_name} {c.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Link to CRM Company</Label>
                    <Select
                      value={newPartner.company_id}
                      onValueChange={(v) => setNewPartner({ ...newPartner, company_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddPartner} className="w-full">
                  Register Partner
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Partners", value: stats.totalPartners, icon: Users, color: "text-blue-500" },
            { label: "Active", value: stats.activePartners, icon: CheckCircle, color: "text-green-500" },
            { label: "Total Commissions", value: `$${(stats.totalCommissions / 1000).toFixed(1)}K`, icon: DollarSign, color: "text-emerald-500" },
            { label: "Pending", value: `$${(stats.pendingCommissions / 1000).toFixed(1)}K`, icon: Clock, color: "text-yellow-500" },
            { label: "Paid Out", value: `$${(stats.paidCommissions / 1000).toFixed(1)}K`, icon: TrendingUp, color: "text-purple-500" }
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
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="partners">
              <Users className="w-4 h-4 mr-2" />
              Partners ({partners.length})
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Commissions ({commissions.length})
            </TabsTrigger>
            <TabsTrigger value="team">
              <UsersRound className="w-4 h-4 mr-2" />
              My Team
            </TabsTrigger>
          </TabsList>

          {/* Partners Tab */}
          <TabsContent value="partners" className="mt-6">
            {partners.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Handshake className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Partners Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Register partners to track referrals and commissions
                </p>
                <Button onClick={() => setShowAddPartner(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Partner
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((partner) => (
                  <Card key={partner.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{partner.partner_name}</h3>
                        <Badge className={getPartnerTypeColor(partner.partner_type)}>
                          {partner.partner_type}
                        </Badge>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${partner.is_active ? 'bg-green-500' : 'bg-muted'}`} />
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      {partner.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{partner.email}</span>
                        </div>
                      )}
                      {partner.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{partner.phone}</span>
                        </div>
                      )}
                      {partner.services_offered.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {partner.services_offered.slice(0, 2).map((service, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{service}</Badge>
                          ))}
                          {partner.services_offered.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{partner.services_offered.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyPortalLink(partner.access_token)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Portal Link
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="mt-6">
            {commissions.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Commissions Yet</h3>
                <p className="text-muted-foreground">
                  Commissions will appear here when deals close with partner attribution
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {commissions.map((commission) => {
                  const partner = partners.find(p => p.id === commission.partner_id);
                  return (
                    <Card key={commission.id} className="p-6 shadow-elevated border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCommissionStatusColor(commission.status)}>
                              {commission.status}
                            </Badge>
                            <Badge variant="outline">{commission.contribution_type}</Badge>
                          </div>
                          <h3 className="font-semibold">
                            {partner?.partner_name || "Unknown Partner"}
                          </h3>
                          {commission.description && (
                            <p className="text-sm text-muted-foreground">{commission.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-500">
                            ${commission.commission_amount?.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {commission.commission_rate}% of ${commission.base_amount?.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="mt-6">
            {myPartnerIntegration ? (
              <div className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You are managing the team for <strong>{myPartnerIntegration.name}</strong>. 
                    Team members can access API documentation and collaborate on integrations.
                    {myPartnerIntegration.role === 'owner' || myPartnerIntegration.role === 'admin' ? (
                      <span className="block mt-1 text-xs text-muted-foreground">
                        As an {myPartnerIntegration.role}, you can invite and manage team members.
                      </span>
                    ) : null}
                  </AlertDescription>
                </Alert>
                
                <PartnerTeamManager 
                  partnerId={myPartnerIntegration.id} 
                  partnerName={myPartnerIntegration.name}
                  isAdmin={myPartnerIntegration.role === 'owner' || myPartnerIntegration.role === 'admin'}
                />
              </div>
            ) : (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <UsersRound className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Partner Integration</h3>
                <p className="text-muted-foreground mb-4">
                  You're not currently part of a partner integration team.
                </p>
                <p className="text-sm text-muted-foreground">
                  If you've been invited to join a partner team, check your email for the invitation link.
                  <br />
                  Or contact your partner administrator to be added to their team.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerPortal;
