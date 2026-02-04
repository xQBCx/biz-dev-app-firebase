import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Handshake, Beaker, TrendingUp, Clock, Users, 
  CheckCircle2, AlertCircle, ArrowRight, Plus,
  DollarSign, Activity, FileText, Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DealRoom {
  id: string;
  name: string;
  description: string | null;
  category: string;
  status: string;
  expected_deal_size_min: number | null;
  expected_deal_size_max: number | null;
  time_horizon: string | null;
  created_at: string;
  created_by: string;
}

interface Formulation {
  id: string;
  deal_room_id: string;
  name: string;
  description: string | null;
  version_number: number;
  status: string;
  created_at: string;
  activated_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  negotiating: { label: "Negotiating", color: "bg-blue-500/10 text-blue-500", icon: Users },
  active: { label: "Active", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-purple-500/10 text-purple-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
};

const FORMULATION_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  review: { label: "In Review", color: "bg-amber-500/10 text-amber-500" },
  active: { label: "Active", color: "bg-green-500/10 text-green-500" },
  superseded: { label: "Superseded", color: "bg-muted text-muted-foreground" },
};

const CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales",
  platform_build: "Platform Build",
  joint_venture: "Joint Venture",
  licensing: "Licensing",
  services: "Services",
  infrastructure: "Infrastructure",
  ip_creation: "IP Creation",
};

export function DealRoomDashboard() {
  const navigate = useNavigate();
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [formulations, setFormulations] = useState<Formulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roomsRes, formulationsRes] = await Promise.all([
        supabase
          .from("deal_rooms")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("deal_room_formulations")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (roomsRes.error) throw roomsRes.error;
      if (formulationsRes.error) throw formulationsRes.error;

      setDealRooms(roomsRes.data || []);
      setFormulations(formulationsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load deal rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const getFormulationsForRoom = (roomId: string) => {
    return formulations.filter((f) => f.deal_room_id === roomId);
  };

  const stats = {
    totalRooms: dealRooms.length,
    activeRooms: dealRooms.filter((r) => r.status === "active" || r.status === "negotiating").length,
    totalFormulations: formulations.length,
    activeFormulations: formulations.filter((f) => f.status === "active").length,
    totalDealValue: dealRooms.reduce((sum, r) => sum + (r.expected_deal_size_max || 0), 0),
    pendingReviews: formulations.filter((f) => f.status === "review").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deal Room Dashboard</h2>
          <p className="text-muted-foreground">
            Manage active deals and formulation versions
          </p>
        </div>
        <Button onClick={() => navigate("/deal-rooms/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Deal Room
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deal Rooms</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeRooms} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Formulations</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFormulations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeFormulations} active versions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalDealValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Max expected value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Formulations awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2">
            <Handshake className="h-4 w-4" />
            Deal Rooms
          </TabsTrigger>
          <TabsTrigger value="formulations" className="gap-2">
            <Beaker className="h-4 w-4" />
            Formulations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Deal Rooms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Deal Rooms</CardTitle>
                <CardDescription>Latest activity across all rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {dealRooms.slice(0, 5).map((room) => {
                      const config = STATUS_CONFIG[room.status] || STATUS_CONFIG.draft;
                      const StatusIcon = config.icon;
                      return (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => navigate(`/deal-rooms/${room.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Handshake className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {CATEGORY_LABELS[room.category] || room.category}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={config.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                    {dealRooms.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No deal rooms yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Active Formulations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Formulations</CardTitle>
                <CardDescription>Currently active value attribution rules</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {formulations
                      .filter((f) => f.status === "active" || f.status === "review")
                      .slice(0, 5)
                      .map((formulation) => {
                        const room = dealRooms.find((r) => r.id === formulation.deal_room_id);
                        const statusConfig = FORMULATION_STATUS[formulation.status] || FORMULATION_STATUS.draft;
                        return (
                          <div
                            key={formulation.id}
                            className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => room && navigate(`/deal-rooms/${room.id}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-purple-500/10">
                                <Beaker className="h-4 w-4 text-purple-500" />
                              </div>
                              <div>
                                <div className="font-medium">{formulation.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  v{formulation.version_number} • {room?.name || "Unknown Room"}
                                </div>
                              </div>
                            </div>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        );
                      })}
                    {formulations.filter((f) => f.status === "active" || f.status === "review").length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No active formulations
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Pipeline by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline by Category</CardTitle>
              <CardDescription>Deal distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                  const count = dealRooms.filter((r) => r.category === key).length;
                  const percentage = stats.totalRooms > 0 ? (count / stats.totalRooms) * 100 : 0;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-muted-foreground">{count} deals</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Deal Rooms</CardTitle>
              <CardDescription>Complete list of deal rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {dealRooms.map((room) => {
                    const config = STATUS_CONFIG[room.status] || STATUS_CONFIG.draft;
                    const StatusIcon = config.icon;
                    const roomFormulations = getFormulationsForRoom(room.id);
                    return (
                      <div
                        key={room.id}
                        className="p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/deal-rooms/${room.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Handshake className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{room.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {room.description || "No description"}
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Beaker className="h-3 w-3" />
                                  {roomFormulations.length} formulations
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(room.created_at), "MMM d, yyyy")}
                                </span>
                                {room.expected_deal_size_max && (
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    Up to ${(room.expected_deal_size_max / 1000).toFixed(0)}K
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{CATEGORY_LABELS[room.category] || room.category}</Badge>
                            <Badge className={config.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {dealRooms.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Handshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold">No deal rooms yet</h3>
                      <p className="text-sm">Create your first deal room to get started</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Formulations</CardTitle>
              <CardDescription>Value attribution rules across all deal rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {formulations.map((formulation) => {
                    const room = dealRooms.find((r) => r.id === formulation.deal_room_id);
                    const statusConfig = FORMULATION_STATUS[formulation.status] || FORMULATION_STATUS.draft;
                    return (
                      <div
                        key={formulation.id}
                        className="p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => room && navigate(`/deal-rooms/${room.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <Beaker className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <div className="font-medium">{formulation.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {room?.name || "Unknown Room"} • Version {formulation.version_number}
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Created {format(new Date(formulation.created_at), "MMM d, yyyy")}
                                </span>
                                {formulation.activated_at && (
                                  <span className="flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Activated {format(new Date(formulation.activated_at), "MMM d, yyyy")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {formulations.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Beaker className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-semibold">No formulations yet</h3>
                      <p className="text-sm">Create a deal room and add formulations</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
