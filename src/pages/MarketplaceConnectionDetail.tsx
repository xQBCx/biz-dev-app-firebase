import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageSquare, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Connection {
  id: string;
  status: string;
  commission_agreed: number;
  commission_type: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    description: string;
    listing_type: string;
    category: string;
  };
  marketer_profile: {
    id: string;
    business_name: string;
  };
  product_owner_id: string;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    email: string;
  };
}

interface PerformanceMetric {
  id: string;
  revenue_generated: number;
  conversions: number;
  leads_generated: number;
  commission_earned: number;
  commission_paid: boolean;
  roi_percentage: number;
  metric_date: string;
  notes: string | null;
  created_at: string;
}

export default function MarketplaceConnectionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Performance metric form
  const [revenue, setRevenue] = useState("");
  const [conversions, setConversions] = useState("");
  const [leads, setLeads] = useState("");
  const [metricNotes, setMetricNotes] = useState("");
  const [addingMetric, setAddingMetric] = useState(false);

  useEffect(() => {
    fetchConnectionData();
  }, [id]);

  const fetchConnectionData = async () => {
    try {
      const { data: connectionData, error: connectionError } = await supabase
        .from("marketplace_connections")
        .select(`
          *,
          listing:marketplace_listings!marketplace_connections_listing_id_fkey(id, title, description, listing_type, category),
          marketer_profile:marketer_profiles!marketplace_connections_marketer_id_fkey(id, business_name)
        `)
        .eq("id", id)
        .single();

      if (connectionError) throw connectionError;
      setConnection(connectionData);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("connection_messages")
        .select("*")
        .eq("connection_id", id)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Fetch performance metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("performance_metrics")
        .select("*")
        .eq("connection_id", id)
        .order("metric_date", { ascending: false });

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);
    } catch (error: any) {
      toast.error("Failed to load connection details");
      console.error(error);
      navigate("/marketplace/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("connection_messages").insert([{
        connection_id: id!,
        sender_id: user?.id!,
        message: newMessage.trim(),
      }]);

      if (error) throw error;

      setNewMessage("");
      fetchConnectionData();
      toast.success("Message sent");
    } catch (error: any) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleAddMetric = async () => {
    if (!revenue && !conversions && !leads) {
      toast.error("Please enter at least one metric value");
      return;
    }

    setAddingMetric(true);
    try {
      const commissionEarned = revenue ? parseFloat(revenue) * (connection!.commission_agreed / 100) : 0;
      
      const { error } = await supabase.from("performance_metrics").insert([{
        connection_id: id!,
        revenue_generated: revenue ? parseFloat(revenue) : 0,
        conversions: conversions ? parseInt(conversions) : 0,
        leads_generated: leads ? parseInt(leads) : 0,
        commission_earned: commissionEarned,
        commission_paid: false,
        roi_percentage: 0,
        metric_date: new Date().toISOString().split('T')[0],
        notes: metricNotes.trim() || null,
      }]);

      if (error) throw error;

      setRevenue("");
      setConversions("");
      setLeads("");
      setMetricNotes("");
      fetchConnectionData();
      toast.success("Metric added");
    } catch (error: any) {
      toast.error("Failed to add metric");
    } finally {
      setAddingMetric(false);
    }
  };

  if (loading || !connection) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isProductOwner = connection.product_owner_id === user?.id;
  const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue_generated, 0);
  const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
  const totalLeads = metrics.reduce((sum, m) => sum + m.leads_generated, 0);
  const totalCommission = metrics.reduce((sum, m) => sum + m.commission_earned, 0);

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-foreground">{connection.listing.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      With {connection.marketer_profile.business_name}
                    </p>
                  </div>
                  <Badge>{connection.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-foreground">Partnership Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Commission:</span>
                      <span className="ml-2 font-medium text-primary">
                        {connection.commission_agreed}
                        {connection.commission_type === "percentage" ? "%" : " USD"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <span className="ml-2 font-medium">
                        {new Date(connection.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2 text-foreground">About the Listing</h3>
                  <p className="text-sm text-muted-foreground">{connection.listing.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Conversions</p>
                    <p className="text-2xl font-bold text-foreground">{totalConversions}</p>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
                  </div>
                  <div className="bg-background/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Commission</p>
                    <p className="text-2xl font-bold text-foreground">${totalCommission.toFixed(2)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-semibold mb-4 text-foreground">Add Performance Metric</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Revenue ($)</Label>
                      <Input
                        type="number"
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Conversions</Label>
                      <Input
                        type="number"
                        value={conversions}
                        onChange={(e) => setConversions(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Leads Generated</Label>
                      <Input
                        type="number"
                        value={leads}
                        onChange={(e) => setLeads(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Notes (optional)</Label>
                      <Input
                        value={metricNotes}
                        onChange={(e) => setMetricNotes(e.target.value)}
                        placeholder="Add any notes"
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleAddMetric} disabled={addingMetric} className="w-full">
                      {addingMetric ? "Adding..." : "Add Metric"}
                    </Button>
                  </div>
                </div>

                {metrics.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-3 text-foreground">Recent Metrics</h4>
                      <div className="space-y-3">
                        {metrics.slice(0, 5).map((metric) => (
                          <div key={metric.id} className="bg-background/30 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(metric.metric_date).toLocaleDateString()}
                              </span>
                              {metric.commission_paid && (
                                <Badge variant="outline" className="text-xs">Paid</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {metric.revenue_generated > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Revenue:</span>
                                  <span className="ml-1 font-medium">${metric.revenue_generated}</span>
                                </div>
                              )}
                              {metric.conversions > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Conversions:</span>
                                  <span className="ml-1 font-medium">{metric.conversions}</span>
                                </div>
                              )}
                              {metric.leads_generated > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Leads:</span>
                                  <span className="ml-1 font-medium">{metric.leads_generated}</span>
                                </div>
                              )}
                              {metric.commission_earned > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Commission:</span>
                                  <span className="ml-1 font-medium">${metric.commission_earned.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            {metric.notes && (
                              <p className="text-xs text-muted-foreground mt-2">{metric.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Messages */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? "bg-primary/10 ml-4"
                            : "bg-background/50 mr-4"
                        }`}
                      >
                        <p className="text-sm text-foreground">{message.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="w-full"
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
