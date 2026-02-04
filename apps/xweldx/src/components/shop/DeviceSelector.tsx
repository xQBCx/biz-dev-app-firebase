import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Smartphone, Glasses, Star, Wifi, WifiOff, Bluetooth, Battery } from "lucide-react";
import { useDeviceStore, AR_DEVICES, ARDeviceType } from "@/stores/deviceStore";
import { useCyanGlasses } from "@/hooks/useCyanGlasses";
import { cn } from "@/lib/utils";

const getDeviceIcon = (type: ARDeviceType) => {
  switch (type) {
    case 'phone':
      return Smartphone;
    default:
      return Glasses;
  }
};

export const DeviceSelector = () => {
  const { selectedDevice, setSelectedDevice, connectedDevices, isConnecting, setConnecting, connectDevice, disconnectDevice } = useDeviceStore();
  const cyanGlasses = useCyanGlasses();

  const handleConnect = async (deviceId: string, deviceType: ARDeviceType) => {
    // Special handling for Cyan glasses - use Web Bluetooth
    if (deviceType === 'cyan') {
      await cyanGlasses.connect();
      return;
    }
    
    setConnecting(true);
    // Simulate connection for other devices
    await new Promise(resolve => setTimeout(resolve, 1500));
    connectDevice(deviceId);
    setConnecting(false);
  };

  const handleDisconnect = (deviceId: string, deviceType: ARDeviceType) => {
    if (deviceType === 'cyan') {
      cyanGlasses.disconnect();
      return;
    }
    disconnectDevice(deviceId);
  };

  const isDeviceConnecting = (deviceType: ARDeviceType) => {
    if (deviceType === 'cyan') return cyanGlasses.isConnecting;
    return isConnecting;
  };

  return (
    <Card variant="steel" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20">
            <Glasses className="h-6 w-6 text-accent" />
          </div>
          <div>
            <CardTitle className="uppercase tracking-wider">AR Device Selection</CardTitle>
            <CardDescription>Choose your preferred AR glasses or camera device</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <RadioGroup
          value={selectedDevice}
          onValueChange={(value) => setSelectedDevice(value as ARDeviceType)}
          className="grid gap-4"
        >
          {AR_DEVICES.map((device, index) => {
            const Icon = getDeviceIcon(device.type);
            const isSelected = selectedDevice === device.type;
            const isConnected = device.type === 'cyan' 
              ? cyanGlasses.isConnected 
              : connectedDevices.includes(device.id);
            const connecting = isDeviceConnecting(device.type);

            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Label
                  htmlFor={device.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300",
                    isSelected
                      ? "border-accent bg-accent/10 shadow-[0_0_20px_hsla(24,96%,53%,0.15)]"
                      : "border-border hover:border-accent/50 hover:bg-secondary/20"
                  )}
                >
                  <RadioGroupItem value={device.type} id={device.id} className="mt-1" />
                  
                  <div className={cn(
                    "p-3 rounded-xl transition-colors",
                    isSelected ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold">{device.name}</h4>
                      {device.recommended && (
                        <Badge variant="success" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Recommended
                        </Badge>
                      )}
                      {isConnected && (
                        <Badge variant="info" className="gap-1">
                          {device.type === 'cyan' ? <Bluetooth className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                          Connected
                        </Badge>
                      )}
                      {device.type === 'cyan' && isConnected && (
                        <Badge variant="outline" className="gap-1">
                          <Battery className="h-3 w-3" />
                          {cyanGlasses.state.batteryLevel}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{device.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {device.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {isSelected && device.type !== 'phone' && (
                    <div className="flex-shrink-0">
                      {isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDisconnect(device.id, device.type);
                          }}
                        >
                          <WifiOff className="h-4 w-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          variant="industrial"
                          size="sm"
                          disabled={connecting}
                          onClick={(e) => {
                            e.preventDefault();
                            handleConnect(device.id, device.type);
                          }}
                        >
                          {connecting ? (
                            <>{device.type === 'cyan' ? 'Pairing...' : 'Connecting...'}</>
                          ) : (
                            <>
                              {device.type === 'cyan' ? (
                                <Bluetooth className="h-4 w-4 mr-2" />
                              ) : (
                                <Wifi className="h-4 w-4 mr-2" />
                              )}
                              {device.type === 'cyan' ? 'Pair' : 'Connect'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </Label>
              </motion.div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
