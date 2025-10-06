import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, Users, Building2, Target, DollarSign, 
  Ticket, Megaphone, MessageSquare, TrendingUp, AlertCircle
} from "lucide-react";

const ERPDashboard = () => {
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadDashboardStats();
  }, [user, navigate]);

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
      <Navigation />
      
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
        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

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
