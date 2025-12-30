import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Plus,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface Deal {
  id: string;
  deal_number: string;
  product_type: string;
  quantity: number;
  quantity_unit: string;
  total_value: number;
  currency: string;
  status: string;
  escrow_status: string;
  pop_verified: boolean;
  created_at: string;
  buyer: { company_name: string | null };
  seller: { company_name: string | null };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  escrow_funded: { label: 'Escrow Funded', color: 'bg-blue-500', icon: FileCheck },
  pop_verified: { label: 'POP Verified', color: 'bg-emerald-500', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-amber-500', icon: Clock },
  completed: { label: 'Completed', color: 'bg-primary', icon: CheckCircle2 },
  disputed: { label: 'Disputed', color: 'bg-destructive', icon: AlertTriangle },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground', icon: AlertTriangle }
};

export default function XCommodityDeals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [myProfileId, setMyProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyProfile();
    }
  }, [user]);

  useEffect(() => {
    if (myProfileId) {
      fetchDeals();
    }
  }, [myProfileId, activeTab]);

  const fetchMyProfile = async () => {
    const { data } = await supabase
      .from('commodity_user_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();
    
    if (data) {
      setMyProfileId(data.id);
    } else {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    if (!myProfileId) return;
    
    setLoading(true);
    
    let query = supabase
      .from('commodity_deals')
      .select(`
        id, deal_number, product_type, quantity, quantity_unit,
        total_value, currency, status, escrow_status, pop_verified, created_at,
        buyer:commodity_user_profiles!commodity_deals_buyer_id_fkey(company_name),
        seller:commodity_user_profiles!commodity_deals_seller_id_fkey(company_name)
      `)
      .or(`buyer_id.eq.${myProfileId},seller_id.eq.${myProfileId},buy_broker_id.eq.${myProfileId},sell_broker_id.eq.${myProfileId}`)
      .order('created_at', { ascending: false });

    if (activeTab === 'active') {
      query = query.in('status', ['draft', 'escrow_funded', 'pop_verified', 'in_progress']);
    } else if (activeTab === 'completed') {
      query = query.eq('status', 'completed');
    } else if (activeTab === 'disputed') {
      query = query.in('status', ['disputed', 'cancelled']);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load deals");
    } else {
      setDeals(data || []);
    }
    setLoading(false);
  };

  const formatValue = (value: number, currency: string) => {
    if (value >= 1e6) return `${currency} ${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${currency} ${(value / 1e3).toFixed(0)}K`;
    return `${currency} ${value.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/xcommodity')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Deals</h1>
            <p className="text-muted-foreground">
              Manage your commodity transactions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDeals}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/xcommodity/marketplace')}>
            <Plus className="h-4 w-4 mr-2" />
            Start New Deal
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="disputed">Disputed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !myProfileId ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">Create Your Profile</h3>
                <p className="text-muted-foreground mb-4">
                  You need a commodity trading profile to view and manage deals
                </p>
                <Button onClick={() => navigate('/xcommodity/onboard')}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ) : deals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No deals found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'active' 
                    ? "Start a new deal from the marketplace" 
                    : `No ${activeTab} deals yet`}
                </p>
                {activeTab === 'active' && (
                  <Button onClick={() => navigate('/xcommodity/marketplace')}>
                    Browse Marketplace
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {deals.map(deal => {
                const config = statusConfig[deal.status] || statusConfig.draft;
                const StatusIcon = config.icon;
                
                return (
                  <Card 
                    key={deal.id}
                    className="cursor-pointer transition-all hover:border-primary/50"
                    onClick={() => navigate(`/xcommodity/deals/${deal.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{deal.deal_number}</h3>
                            <Badge className={config.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {deal.product_type} • {deal.quantity.toLocaleString()} {deal.quantity_unit}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {deal.buyer?.company_name || 'Private Buyer'} ↔ {deal.seller?.company_name || 'Private Seller'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatValue(deal.total_value, deal.currency)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(deal.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
