import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Car, Camera, Zap, MapPin, AlertTriangle, CheckCircle2,
  Play, Pause, Settings, RefreshCw, Eye, FileText, DollarSign,
  Shield, Wifi, Activity, Clock, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FleetVehicle {
  id: string;
  name: string;
  vin: string;
  status: "online" | "offline" | "driving" | "parked";
  lastSeen: string;
  location: { lat: number; lon: number };
  capturesEnabled: boolean;
  captureCount: number;
}

interface DetectedOpportunity {
  id: string;
  vehicleId: string;
  type: "pothole" | "fence" | "light_pole" | "graffiti" | "leak" | "signage" | "other";
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  location: { lat: number; lon: number; address?: string };
  imageUrl?: string;
  estimatedValue: number;
  status: "detected" | "verified" | "work_order" | "completed";
  detectedAt: string;
}

interface FleetStats {
  totalVehicles: number;
  activeCaptures: number;
  opportunitiesDetected: number;
  workOrdersGenerated: number;
  revenueGenerated: number;
}

export function TeslaFleetCapture() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [opportunities, setOpportunities] = useState<DetectedOpportunity[]>([]);
  const [stats, setStats] = useState<FleetStats>({
    totalVehicles: 0,
    activeCaptures: 0,
    opportunitiesDetected: 0,
    workOrdersGenerated: 0,
    revenueGenerated: 0,
  });

  // Simulated fleet data for demo
  useEffect(() => {
    if (isConnected) {
      setVehicles([
        { id: "v1", name: "Model Y - Fleet 01", vin: "5YJ3E1EA***", status: "driving", lastSeen: new Date().toISOString(), location: { lat: 37.7749, lon: -122.4194 }, capturesEnabled: true, captureCount: 1247 },
        { id: "v2", name: "Model 3 - Fleet 02", vin: "5YJ3E1EB***", status: "online", lastSeen: new Date().toISOString(), location: { lat: 37.7849, lon: -122.4094 }, capturesEnabled: true, captureCount: 892 },
        { id: "v3", name: "Model S - Fleet 03", vin: "5YJS1E4A***", status: "parked", lastSeen: new Date(Date.now() - 3600000).toISOString(), location: { lat: 37.7649, lon: -122.4294 }, capturesEnabled: false, captureCount: 2103 },
      ]);
      
      setStats({
        totalVehicles: 3,
        activeCaptures: 2,
        opportunitiesDetected: 47,
        workOrdersGenerated: 23,
        revenueGenerated: 127500,
      });
    }
  }, [isConnected]);

  // Simulate real-time opportunity detection
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      const types: DetectedOpportunity["type"][] = ["pothole", "fence", "light_pole", "graffiti", "leak"];
      const severities: DetectedOpportunity["severity"][] = ["low", "medium", "high", "critical"];
      
      const newOpp: DetectedOpportunity = {
        id: crypto.randomUUID(),
        vehicleId: vehicles[Math.floor(Math.random() * vehicles.length)]?.id || "v1",
        type: types[Math.floor(Math.random() * types.length)],
        confidence: 0.75 + Math.random() * 0.25,
        severity: severities[Math.floor(Math.random() * severities.length)],
        location: {
          lat: 37.77 + (Math.random() - 0.5) * 0.1,
          lon: -122.42 + (Math.random() - 0.5) * 0.1,
          address: "123 Market St, San Francisco, CA",
        },
        estimatedValue: Math.floor(500 + Math.random() * 4500),
        status: "detected",
        detectedAt: new Date().toISOString(),
      };

      setOpportunities(prev => [newOpp, ...prev].slice(0, 20));
      setStats(prev => ({
        ...prev,
        opportunitiesDetected: prev.opportunitiesDetected + 1,
      }));

      toast.success(`New ${newOpp.type.replace('_', ' ')} detected`, {
        description: `Confidence: ${Math.round(newOpp.confidence * 100)}% | Est. Value: $${newOpp.estimatedValue.toLocaleString()}`,
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [isCapturing, vehicles]);

  const handleConnect = async () => {
    // In production, this would initiate Tesla Fleet API OAuth
    toast.loading("Connecting to Tesla Fleet API...");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsConnected(true);
    toast.success("Fleet connected successfully!", {
      description: "3 vehicles detected in your fleet",
    });
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsCapturing(false);
    setVehicles([]);
    setOpportunities([]);
    toast.info("Fleet disconnected");
  };

  const toggleCapture = () => {
    setIsCapturing(!isCapturing);
    toast.success(isCapturing ? "Capture paused" : "Real-time capture started");
  };

  const createWorkOrder = async (opp: DetectedOpportunity) => {
    toast.loading("Creating work order...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOpportunities(prev => 
      prev.map(o => o.id === opp.id ? { ...o, status: "work_order" } : o)
    );
    setStats(prev => ({
      ...prev,
      workOrdersGenerated: prev.workOrdersGenerated + 1,
    }));
    
    toast.success("Work order created!", {
      description: `Assigned to qualified vendor. Escrow: $${opp.estimatedValue.toLocaleString()}`,
    });
  };

  const getStatusColor = (status: FleetVehicle["status"]) => {
    switch (status) {
      case "driving": return "bg-green-500";
      case "online": return "bg-blue-500";
      case "parked": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityColor = (severity: DetectedOpportunity["severity"]) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      default: return "bg-green-500/10 text-green-500 border-green-500/30";
    }
  };

  const getTypeIcon = (type: DetectedOpportunity["type"]) => {
    switch (type) {
      case "pothole": return "🕳️";
      case "fence": return "🚧";
      case "light_pole": return "💡";
      case "graffiti": return "🎨";
      case "leak": return "💧";
      case "signage": return "🪧";
      default: return "📍";
    }
  };

  if (!isConnected) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Tesla Fleet Integration</CardTitle>
          <p className="text-muted-foreground mt-2">
            Connect your Tesla fleet to enable real-time infrastructure opportunity detection
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Camera, title: "Camera Analysis", desc: "AI processes 8 cameras per vehicle" },
              { icon: Zap, title: "Real-time Detection", desc: "Instant infrastructure alerts" },
              { icon: DollarSign, title: "Auto Work Orders", desc: "Smart contract settlements" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-4 rounded-lg bg-muted/30">
                <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-medium text-sm">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium">Requirements:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Tesla Fleet API access (fleet.api.tesla.com)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Vehicles with Full Self-Driving or Enhanced Autopilot
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Data sharing permissions enabled
              </li>
            </ul>
          </div>

          <Button className="w-full" size="lg" onClick={handleConnect}>
            <Car className="h-5 w-5 mr-2" />
            Connect Tesla Fleet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Fleet Vehicles", value: stats.totalVehicles, icon: Car },
          { label: "Active Captures", value: stats.activeCaptures, icon: Camera },
          { label: "Opportunities", value: stats.opportunitiesDetected, icon: Eye },
          { label: "Work Orders", value: stats.workOrdersGenerated, icon: FileText },
          { label: "Revenue", value: `$${(stats.revenueGenerated / 1000).toFixed(1)}K`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fleet Status */}
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Car className="h-4 w-4" />
                Fleet Status
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={handleDisconnect}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(vehicle.status))} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.captureCount} captures</p>
                </div>
                <Switch
                  checked={vehicle.capturesEnabled}
                  onCheckedChange={() => {
                    setVehicles(prev => 
                      prev.map(v => v.id === vehicle.id ? { ...v, capturesEnabled: !v.capturesEnabled } : v)
                    );
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Capture Control */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Capture Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <Button
                size="lg"
                className={cn(
                  "w-20 h-20 rounded-full",
                  isCapturing && "bg-destructive hover:bg-destructive/90"
                )}
                onClick={toggleCapture}
              >
                {isCapturing ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </Button>
              <p className="mt-3 font-medium">
                {isCapturing ? "Capturing..." : "Start Capture"}
              </p>
              {isCapturing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Processing vehicle camera feeds
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">AI Processing Load</span>
                <span>{isCapturing ? "Active" : "Idle"}</span>
              </div>
              <Progress value={isCapturing ? 67 : 0} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Data Encryption", status: "Active", icon: Shield },
              { label: "Privacy Filters", status: "Enabled", icon: Eye },
              { label: "Fleet API Connection", status: "Secure", icon: Wifi },
              { label: "Smart Contract", status: "Ready", icon: FileText },
            ].map(({ label, status, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm flex-1">{label}</span>
                <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-500 border-green-500/30">
                  {status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live Opportunities */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Live Detected Opportunities
              {isCapturing && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </CardTitle>
            <Badge variant="secondary">{opportunities.length} pending</Badge>
          </div>
        </CardHeader>
        <ScrollArea className="h-[300px]">
          <CardContent className="space-y-2">
            {opportunities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No opportunities detected yet</p>
                <p className="text-sm">Start capture to detect infrastructure issues</p>
              </div>
            ) : (
              opportunities.map(opp => (
                <div
                  key={opp.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border transition-all",
                    getSeverityColor(opp.severity)
                  )}
                >
                  <span className="text-2xl">{getTypeIcon(opp.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm capitalize">
                        {opp.type.replace('_', ' ')}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {Math.round(opp.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {opp.location.address || `${opp.location.lat.toFixed(4)}, ${opp.location.lon.toFixed(4)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${opp.estimatedValue.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Est. Value</p>
                  </div>
                  {opp.status === "detected" && (
                    <Button size="sm" onClick={() => createWorkOrder(opp)}>
                      Create WO
                    </Button>
                  )}
                  {opp.status === "work_order" && (
                    <Badge className="bg-blue-500">In Progress</Badge>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
