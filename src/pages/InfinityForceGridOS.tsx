import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Zap, Radio, Battery, AlertTriangle, TrendingUp, MapPin, Server, BarChart3, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GridStats {
  totalLoad: number;
  totalGeneration: number;
  activeDERs: number;
  activeMeters: number;
  criticalEvents: number;
  systemFrequency: number;
}

export default function InfinityForceGridOS() {
  const navigate = useNavigate();
  const [gridStats, setGridStats] = useState<GridStats>({
    totalLoad: 0,
    totalGeneration: 0,
    activeDERs: 0,
    activeMeters: 0,
    criticalEvents: 0,
    systemFrequency: 60.00,
  });

  useEffect(() => {
    loadGridStats();
  }, []);

  const loadGridStats = async () => {
    try {
      // Load active assets
      const { data: assets, error: assetsError } = await supabase
        .from("assets")
        .select("*")
        .eq("status", "active");

      // Load active DERs
      const { data: ders, error: dersError } = await supabase
        .from("der_devices")
        .select("*");

      // Load active meters
      const { data: meters, error: metersError } = await supabase
        .from("meters")
        .select("*");

      // Load critical events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("severity", ["critical", "emergency"])
        .is("acknowledged_ts", null);

      if (!assetsError && !dersError && !metersError && !eventsError) {
        setGridStats({
          totalLoad: 0, // Will be calculated from interval readings
          totalGeneration: ders?.reduce((sum, der) => sum + (der.nameplate_kw || 0), 0) || 0,
          activeDERs: ders?.length || 0,
          activeMeters: meters?.length || 0,
          criticalEvents: events?.length || 0,
          systemFrequency: 60.00 + (Math.random() * 0.06 - 0.03), // Simulated variation
        });
      }
    } catch (error) {
      console.error("Error loading grid stats:", error);
    }
  };

  const operatorModules = [
    {
      title: "Grid Topology",
      description: "Real-time grid visualization and network status",
      icon: MapPin,
      route: "/grid-os/topology",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Generation Control",
      description: "Manage generators, DERs, and dispatch",
      icon: Zap,
      route: "/grid-os/generation",
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      title: "AMI / Metering",
      description: "Advanced metering infrastructure and consumption",
      icon: Activity,
      route: "/grid-os/metering",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Demand Response",
      description: "DR programs, enrollments, and dispatch",
      icon: TrendingUp,
      route: "/grid-os/demand-response",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Event Management",
      description: "Alarms, events, and outage tracking",
      icon: AlertTriangle,
      route: "/grid-os/events",
      color: "bg-red-500/10 text-red-500",
    },
    {
      title: "Energy Storage",
      description: "Battery systems, EVs, and storage optimization",
      icon: Battery,
      route: "/grid-os/storage",
      color: "bg-cyan-500/10 text-cyan-500",
    },
    {
      title: "Market Operations",
      description: "Energy trading, settlements, and pricing",
      icon: DollarSign,
      route: "/grid-os/market",
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "SCADA / PMU",
      description: "Real-time telemetry and synchrophasor data",
      icon: Radio,
      route: "/grid-os/scada",
      color: "bg-orange-500/10 text-orange-500",
    },
    {
      title: "Analytics & Reports",
      description: "Forecasting, analytics, and performance reports",
      icon: BarChart3,
      route: "/grid-os/analytics",
      color: "bg-indigo-500/10 text-indigo-500",
    },
    {
      title: "ROSE Computing",
      description: "Distributed workload computing infrastructure",
      icon: Server,
      route: "/grid-os/rose",
      color: "bg-pink-500/10 text-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Infinity Force Grid OS</h1>
              <p className="text-muted-foreground">
                Power Utility Operations Control Center
              </p>
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <Card className="border-primary/20 bg-card/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">System Frequency</p>
                <p className="text-2xl font-bold">{gridStats.systemFrequency.toFixed(2)} Hz</p>
                <Badge variant="outline" className="text-xs">
                  {gridStats.systemFrequency >= 59.97 && gridStats.systemFrequency <= 60.03 ? "NORMAL" : "ALERT"}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Generation</p>
                <p className="text-2xl font-bold">{gridStats.totalGeneration.toFixed(1)} MW</p>
                <Badge variant="outline" className="text-xs">ONLINE</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Active DERs</p>
                <p className="text-2xl font-bold">{gridStats.activeDERs}</p>
                <Badge variant="outline" className="text-xs">CONNECTED</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Active Meters</p>
                <p className="text-2xl font-bold">{gridStats.activeMeters}</p>
                <Badge variant="outline" className="text-xs">REPORTING</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Critical Events</p>
                <p className="text-2xl font-bold text-destructive">{gridStats.criticalEvents}</p>
                <Badge variant={gridStats.criticalEvents > 0 ? "destructive" : "outline"} className="text-xs">
                  {gridStats.criticalEvents > 0 ? "ACTION REQUIRED" : "CLEAR"}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">System Mode</p>
                <p className="text-2xl font-bold">FIELD</p>
                <Badge className="text-xs bg-green-500">OPERATIONAL</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operator Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Operations Control Modules</CardTitle>
            <CardDescription>
              Access grid operations, monitoring, and control systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operatorModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card
                    key={module.route}
                    className="hover:shadow-lg transition-all cursor-pointer border-border/50"
                    onClick={() => navigate(module.route)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${module.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-semibold">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate("/grid-os/events")}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Active Alarms
              </Button>
              <Button variant="outline" onClick={() => navigate("/grid-os/generation")}>
                <Zap className="h-4 w-4 mr-2" />
                Dispatch Generator
              </Button>
              <Button variant="outline" onClick={() => navigate("/grid-os/demand-response")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Initiate DR Event
              </Button>
              <Button variant="outline" onClick={() => navigate("/grid-os/topology")}>
                <MapPin className="h-4 w-4 mr-2" />
                View Grid Map
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
