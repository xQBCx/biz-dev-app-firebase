import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkVisualization } from "@/components/NetworkVisualization";
import { EntityNetworkManager } from "@/components/EntityNetworkManager";
import { 
  LayoutDashboard, Users, Building2, Target, DollarSign, 
  Ticket, Megaphone, MessageSquare, TrendingUp, AlertCircle, Network
} from "lucide-react";

const ERPDashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    contacts: 0,
    companies: 0,
    deals: 0,
    revenue: 0,
    tickets: 0,
    openTickets: 0,
    campaigns: 0,
    transactions: 0
  });

  const [networkEntities, setNetworkEntities] = useState<any[]>([]);
  const [networkRelationships, setNetworkRelationships] = useState<any[]>([]);
  const [refreshNetwork, setRefreshNetwork] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
      loadNetworkData();
    }
  }, [user, refreshNetwork]);

  const loadDashboardStats = async () => {
    if (!user) return;

    const [
      { count: contactsCount },
      { count: companiesCount },
      { data: deals },
      { count: ticketsCount },
      { data: openTickets },
      { count: campaignsCount },
      { data: transactions }
    ] = await Promise.all([
      supabase.from("crm_contacts").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("crm_companies").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("crm_deals").select("amount").eq("user_id", user.id),
      supabase.from("service_tickets").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("service_tickets").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["open", "in_progress"]),
      supabase.from("marketing_campaigns").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("financial_transactions").select("total_amount").eq("user_id", user.id).eq("status", "completed")
    ]);

    const totalRevenue = deals?.reduce((sum, deal) => sum + Number(deal.amount || 0), 0) || 0;
    const totalTransactions = transactions?.reduce((sum, t) => sum + Number(t.total_amount || 0), 0) || 0;

    setStats({
      contacts: contactsCount || 0,
      companies: companiesCount || 0,
      deals: deals?.length || 0,
      revenue: totalRevenue,
      tickets: ticketsCount || 0,
      openTickets: openTickets?.length || 0,
      campaigns: campaignsCount || 0,
      transactions: totalTransactions
    });
  };

  const loadNetworkData = async () => {
    if (!user) return;

    const [entitiesData, relationshipsData] = await Promise.all([
      supabase.from("network_entities" as any).select("*").eq("user_id", user.id).eq("is_active", true),
      supabase.from("entity_relationships" as any).select("*").eq("user_id", user.id)
    ]);

    if (entitiesData.data) {
      // Transform entities for visualization
      const nodes = entitiesData.data.map((entity: any) => ({
        id: entity.id,
        name: entity.name,
        type: entity.entity_type,
        x: entity.position_x || Math.random() * 800,
        y: entity.position_y || Math.random() * 600,
        health: entity.health_score,
        connections: relationshipsData.data?.filter((r: any) => 
          r.source_entity_id === entity.id || r.target_entity_id === entity.id
        ).length || 0,
        metadata: entity
      }));
      setNetworkEntities(nodes);
    }

    if (relationshipsData.data) {
      setNetworkRelationships(relationshipsData.data.map((rel: any) => ({
        source: rel.source_entity_id,
        target: rel.target_entity_id,
        type: rel.relationship_type,
        strength: rel.strength
      })));
    }
  };

  const StatCard = ({ icon: Icon, label, value, sublabel, color = "text-primary" }: any) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
          {sublabel && <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>}
        </div>
        <Icon className={`w-12 h-12 ${color} opacity-50`} />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">ERP Command Center</h1>
            <p className="text-muted-foreground">Unified business operations platform</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Users} 
            label="Total Contacts" 
            value={stats.contacts}
            color="text-blue-500"
          />
          <StatCard 
            icon={Building2} 
            label="Companies" 
            value={stats.companies}
            color="text-purple-500"
          />
          <StatCard 
            icon={Target} 
            label="Active Deals" 
            value={stats.deals}
            sublabel={`$${stats.revenue.toLocaleString()} pipeline`}
            color="text-green-500"
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Revenue" 
            value={`$${stats.transactions.toLocaleString()}`}
            color="text-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Ticket} 
            label="Open Tickets" 
            value={stats.openTickets}
            sublabel={`${stats.tickets} total`}
            color="text-orange-500"
          />
          <StatCard 
            icon={Megaphone} 
            label="Active Campaigns" 
            value={stats.campaigns}
            color="text-pink-500"
          />
          <StatCard 
            icon={MessageSquare} 
            label="Communications" 
            value="--"
            sublabel="Coming soon"
            color="text-cyan-500"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Growth" 
            value="--"
            sublabel="Analytics coming"
            color="text-indigo-500"
          />
        </div>

        {/* Module Navigation */}
        <Tabs defaultValue="network" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="network">
              <Network className="w-4 h-4 mr-2" />
              Network
            </TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="network">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Enterprise Resource Network</h2>
                  <p className="text-muted-foreground mt-1">
                    Visualize and manage relationships across all your companies, tools, people, and processes
                  </p>
                </div>
                {user && (
                  <EntityNetworkManager 
                    userId={user.id} 
                    onEntityCreated={() => setRefreshNetwork(prev => prev + 1)}
                  />
                )}
              </div>

              <div className="h-[700px] rounded-lg border border-border overflow-hidden">
                <NetworkVisualization
                  entities={networkEntities}
                  relationships={networkRelationships}
                  onNodeClick={(node) => console.log("Clicked:", node)}
                  onAddEntity={() => console.log("Add entity")}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entities</p>
                      <p className="text-2xl font-bold">{networkEntities.length}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-royal-blue opacity-50" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Relationships</p>
                      <p className="text-2xl font-bold">{networkRelationships.length}</p>
                    </div>
                    <Network className="w-8 h-8 text-chrome opacity-50" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Health Score</p>
                      <p className="text-2xl font-bold">
                        {networkEntities.length > 0 
                          ? Math.round(networkEntities.reduce((sum, e) => sum + e.health, 0) / networkEntities.length)
                          : 0}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-brushed-silver opacity-50" />
                  </div>
                </Card>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="crm">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">CRM Module</h2>
              <div className="grid gap-4">
                <button
                  onClick={() => navigate("/crm")}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h3 className="font-semibold">Full CRM Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Manage contacts, companies, deals, and activities</p>
                </button>
                <button
                  onClick={() => navigate("/crm/contacts/new")}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h3 className="font-semibold">Add Contact</h3>
                  <p className="text-sm text-muted-foreground">Create a new contact in your CRM</p>
                </button>
                <button
                  onClick={() => navigate("/crm/companies/new")}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h3 className="font-semibold">Add Company</h3>
                  <p className="text-sm text-muted-foreground">Register a new company</p>
                </button>
                <button
                  onClick={() => navigate("/crm/deals/new")}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h3 className="font-semibold">Create Deal</h3>
                  <p className="text-sm text-muted-foreground">Track a new sales opportunity</p>
                </button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Financial Management</h2>
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Dual-entry accounting, transactions, and financial reporting
                </p>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Full financial module with accounts, ledger, and reconciliation
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="service">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Service & Support</h2>
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Ticket management, knowledge base, and customer support
                </p>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Full service module with tickets, SLAs, and chatbots
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="marketing">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Marketing Hub</h2>
              <div className="text-center py-12">
                <Megaphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Campaigns, email automation, lists, and marketing analytics
                </p>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Full marketing suite with automation and reporting
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Integrations & APIs</h2>
              <div className="grid gap-4">
                <button
                  onClick={() => navigate("/crm/integrations")}
                  className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <h3 className="font-semibold">Lindy.ai Webhook</h3>
                  <p className="text-sm text-muted-foreground">Connect workflow automation to your CRM</p>
                </button>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Future Integrations
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ready for: EnWaTel, SiSOQ, Xodiak blockchain, QuickBooks, Stripe, and more
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ERPDashboard;
