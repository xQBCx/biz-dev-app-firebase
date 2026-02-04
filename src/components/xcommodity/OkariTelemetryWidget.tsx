import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Droplets, 
  Thermometer, 
  Gauge,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OkariDevice {
  device_id: string;
  device_type: string;
  facility_name: string | null;
  location: string;
  capacity: number;
  current_level: number;
  current_level_percent: number;
  temperature: number | null;
  pressure: number | null;
  valve_status: string;
  product_type: string | null;
  is_verified: boolean;
  last_telemetry_at: string | null;
}

interface OkariTelemetryWidgetProps {
  deviceId: string;
  compact?: boolean;
}

// Mock data generator - in production this would come from real Okari API
const generateMockTelemetry = (deviceId: string): OkariDevice => {
  const baseLevel = 75 + Math.random() * 15;
  return {
    device_id: deviceId,
    device_type: 'tank',
    facility_name: 'Vopak Houston Terminal',
    location: 'Houston, TX',
    capacity: 2000000,
    current_level: baseLevel * 20000,
    current_level_percent: baseLevel,
    temperature: 68 + Math.random() * 4,
    pressure: 14.7 + Math.random() * 0.5,
    valve_status: 'closed',
    product_type: 'D6 Fuel Oil',
    is_verified: true,
    last_telemetry_at: new Date().toISOString()
  };
};

export function OkariTelemetryWidget({ deviceId, compact = false }: OkariTelemetryWidgetProps) {
  const [device, setDevice] = useState<OkariDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchTelemetry();
    // Update every 30 seconds
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, [deviceId]);

  const fetchTelemetry = async () => {
    // In production, this would call the Okari GX API
    // For now, we use mock data
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setDevice(generateMockTelemetry(deviceId));
    setLastUpdate(new Date());
    setLoading(false);
  };

  if (loading && !device) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!device) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg border bg-card">
        <div className="relative w-16 h-16">
          {/* Tank Visual */}
          <div className="absolute inset-0 rounded-lg border-2 border-muted overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-emerald-500/80 transition-all duration-1000"
              style={{ height: `${device.current_level_percent}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{device.current_level_percent.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{device.facility_name}</span>
            {device.is_verified && (
              <Badge className="bg-emerald-500 gap-1">
                <Activity className="h-3 w-3 animate-pulse" />
                Live
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{device.product_type}</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Live Tank Telemetry
          </CardTitle>
          <div className="flex items-center gap-2">
            {device.is_verified && (
              <Badge className="bg-emerald-500 gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={fetchTelemetry}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tank Visualization */}
        <div className="relative h-40 rounded-lg border-2 border-muted overflow-hidden bg-gradient-to-b from-muted/50 to-muted">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-1000"
            style={{ height: `${device.current_level_percent}%` }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground">
            <span className="text-4xl font-bold">{device.current_level_percent.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground">
              {(device.current_level / 1000000).toFixed(2)}M barrels
            </span>
          </div>
          
          {/* Animated pulse indicator */}
          <div className="absolute top-3 right-3">
            <div className="relative">
              <Activity className="h-5 w-5 text-emerald-500" />
              <div className="absolute inset-0 animate-ping">
                <Activity className="h-5 w-5 text-emerald-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted">
            <Thermometer className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-bold">{device.temperature?.toFixed(1)}°F</p>
            <p className="text-xs text-muted-foreground">Temperature</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <Gauge className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{device.pressure?.toFixed(2)} psi</p>
            <p className="text-xs text-muted-foreground">Pressure</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className={`
              w-5 h-5 mx-auto mb-1 rounded-full
              ${device.valve_status === 'open' ? 'bg-emerald-500' : 'bg-muted-foreground'}
            `} />
            <p className="text-lg font-bold capitalize">{device.valve_status}</p>
            <p className="text-xs text-muted-foreground">Valve Status</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>{device.facility_name} • {device.location}</span>
          <span>Updated {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
