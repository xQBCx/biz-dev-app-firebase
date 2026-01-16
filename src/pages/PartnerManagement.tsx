import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import {
  Handshake,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  Search,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface Partner {
  id: string;
  partner_type: string;
  services_offered: string[];
  commission_structure: any;
  access_token: string;
  is_active: boolean;
  created_at: string;
  contact_id: string | null;
  company_id: string | null;
}

interface Commission {
  id: string;
  partner_id: string;
  contribution_type: string;
  commission_rate: number;
  base_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

const PartnerManagement = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("partners");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPartner, setShowNewPartner] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [newPartner, setNewPartner] = useState({
    partner_type: "consulting",
    contact_id: "",
    company_id: "",
    services_offered: [] as string[]
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
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [partnersRes, commissionsRes, contactsRes, companiesRes] = await Promise.all([
        supabase.from("registered_partners").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("partner_commissions").select("*").order("created_at", { ascending: false }),
        supabase.from("crm_contacts").select("id, first_name, last_name, email").eq("user_id", user.id),
        supabase.from("crm_companies").select("id, name").eq("user_id", user.id)
      ]);

      if (partnersRes.error) throw partnersRes.error;
      setPartners(partnersRes.data || []);
      setCommissions(commissionsRes.data || []);
      setContacts(contactsRes.data || []);
      setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load partner data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePartner = async () => {
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    try {
      const accessToken = `partner_${crypto.randomUUID().replace(/-/g, "")}`;
      
      const insertData: any = {
        user_id: user.id,
        partner_type: newPartner.partner_type,
        services_offered: newPartner.services_offered,
        access_token: accessToken,
        commission_structure: { default_rate: 10 }
      };

      if (newPartner.contact_id) insertData.contact_id = newPartner.contact_id;
      if (newPartner.company_id) insertData.company_id = newPartner.company_id;

      const { error } = await supabase.from("registered_partners").insert(insertData);

      if (error) throw error;

      toast.success("Partner registered successfully!");
      setShowNewPartner(false);
      setNewPartner({ partner_type: "consulting", contact_id: "", company_id: "", services_offered: [] });
      loadData();
    } catch (error) {
      console.error("Error creating partner:", error);
      toast.error("Failed to register partner");
    }
  };

  const copyPortalLink = (token: string) => {
    const link = `${window.location.origin}/partner-portal/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success("Portal link copied!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const stats = {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.is_active).length,
    pendingCommissions: commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.commission_amount, 0),
    paidCommissions: commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.commission_amount, 0)
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      legal: "bg-purple-500/10 text-purple-500",
      industrial: "bg-blue-500/10 text-blue-500",
      real_estate: "bg-green-500/10 text-green-500",
      consulting: "bg-yellow-500/10 text-yellow-500",
      technology: "bg-cyan-500/10 text-cyan-500"
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const filteredPartners = partners.filter(p =>
    p.partner_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Handshake className="w-10 h-10 text-primary" />
                Partner Management
              </h1>
              <p className="text-muted-foreground">
                Manage partner ecosystem with commission attribution
              </p>
            </div>
            <WhitePaperIcon moduleKey="partner-portal" moduleName="Partner Portal" variant="button" />
          </div>
          <Dialog open={showNewPartner} onOpenChange={setShowNewPartner}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Register Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register New Partner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Link to Contact (optional)</Label>
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
                  <Label>Link to Company (optional)</Label>
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
                <Button onClick={handleCreatePartner} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Partner
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Partners", value: stats.totalPartners, icon: Users, color: "text-blue-500" },
            { label: "Active Partners", value: stats.activePartners, icon: Handshake, color: "text-green-500" },
            { label: "Pending Commissions", value: `$${stats.pendingCommissions.toLocaleString()}`, icon: DollarSign, color: "text-yellow-500" },
            { label: "Paid Commissions", value: `$${stats.paidCommissions.toLocaleString()}`, icon: TrendingUp, color: "text-purple-500" }
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
            <TabsTrigger value="partners">
              <Users className="w-4 h-4 mr-2" />
              Partners
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Commissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="mt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Loading partners...</div>
            ) : filteredPartners.length === 0 ? (
              <Card className="p-8 text-center">
                <Handshake className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">No partners registered</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Register your first partner to start tracking commissions
                </p>
                <Button onClick={() => setShowNewPartner(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Register Partner
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredPartners.map((partner) => (
                  <Card key={partner.id} className="p-6 shadow-elevated border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Handshake className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <Badge className={getTypeBadge(partner.partner_type)}>
                              {partner.partner_type.replace("_", " ")}
                            </Badge>
                            <Badge variant={partner.is_active ? "default" : "secondary"}>
                              {partner.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Registered {new Date(partner.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPortalLink(partner.access_token)}
                        >
                          {copiedToken === partner.access_token ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          Copy Portal Link
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="commissions" className="mt-6">
            <Card className="p-8 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Commission Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track and manage partner commissions and payouts
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerManagement;
