import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bluetooth, BluetoothSearching, Check, X, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { bluetoothService, DiscoveredService, PRIMARY_SERVICE_UUID, SECONDARY_SERVICE_UUID, WRITE_CHARACTERISTIC_UUID, NOTIFY_CHARACTERISTIC_UUID } from '@/services/bluetoothService';
import { cyanGlassesService } from '@/services/cyanGlassesService';
import { BLEProtocolAnalyzer } from '@/components/glasses/BLEProtocolAnalyzer';
import { EnhancedCameraCapture } from '@/components/camera/EnhancedCameraCapture';

interface LogEntry {
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

const BluetoothTest = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [discoveredServices, setDiscoveredServices] = useState<DiscoveredService[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<{ id: string; name: string | undefined } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), type, message }]);
  };

  const clearLogs = () => setLogs([]);

  const isSupported = bluetoothService.isSupported();
  const platform = bluetoothService.getPlatform();

  const handleDebugScan = async () => {
    setIsScanning(true);
    clearLogs();
    addLog('info', 'Starting debug scan with acceptAllDevices...');

    try {
      const result = await bluetoothService.debugConnect();
      
      setDeviceInfo(result.device);
      setDiscoveredServices(result.services);
      
      addLog('success', `Connected to: ${result.device?.name || 'Unknown Device'}`);
      addLog('info', `Found ${result.services.length} services`);
      
      result.services.forEach(service => {
        addLog('info', `Service: ${service.uuid}`);
        service.characteristics.forEach(char => {
          addLog('info', `  └─ ${char.uuid} [${char.properties.join(', ')}]`);
        });
      });

      // Check for expected UUIDs
      const hasExpectedService = result.services.some(
        s => s.uuid.toLowerCase() === PRIMARY_SERVICE_UUID.toLowerCase() ||
             s.uuid.toLowerCase() === SECONDARY_SERVICE_UUID.toLowerCase()
      );

      if (hasExpectedService) {
        addLog('success', '✓ Found expected Cyan service UUID!');
      } else {
        addLog('warning', '⚠ Expected service UUIDs not found. Device may use different UUIDs.');
      }

      toast({
        title: 'Scan Complete',
        description: `Found ${result.services.length} services on ${result.device?.name || 'device'}`,
      });
    } catch (error) {
      addLog('error', `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Scan Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleNormalConnect = async () => {
    setIsConnecting(true);
    clearLogs();
    addLog('info', 'Attempting normal connection to Cyan glasses...');

    try {
      const success = await cyanGlassesService.connect();
      
      if (success) {
        const services = bluetoothService.getDiscoveredServices();
        setDiscoveredServices(services);
        
        addLog('success', 'Successfully connected to Cyan glasses!');
        addLog('info', `Found ${services.length} usable services`);
        
        const state = cyanGlassesService.getState();
        addLog('info', `Battery: ${state.batteryLevel}%`);
        addLog('info', `Firmware: ${state.firmwareVersion}`);

        toast({
          title: 'Connected!',
          description: 'Successfully connected to Cyan glasses',
        });
      } else {
        addLog('error', 'Connection failed - no suitable service found');
        toast({
          title: 'Connection Failed',
          description: 'Could not find compatible services on device',
          variant: 'destructive',
        });
      }
    } catch (error) {
      addLog('error', `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await cyanGlassesService.disconnect();
    setDeviceInfo(null);
    setDiscoveredServices([]);
    addLog('info', 'Disconnected');
  };

  const copyLogsToClipboard = () => {
    const logText = logs.map(l => 
      `[${l.timestamp.toISOString()}] ${l.type.toUpperCase()}: ${l.message}`
    ).join('\n');
    
    navigator.clipboard.writeText(logText);
    toast({ title: 'Copied', description: 'Logs copied to clipboard' });
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'error': return <X className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Bluetooth className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const isExpectedUUID = (uuid: string) => {
    const lower = uuid.toLowerCase();
    return lower === PRIMARY_SERVICE_UUID.toLowerCase() ||
           lower === SECONDARY_SERVICE_UUID.toLowerCase() ||
           lower === WRITE_CHARACTERISTIC_UUID.toLowerCase() ||
           lower === NOTIFY_CHARACTERISTIC_UUID.toLowerCase();
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bluetooth Debug</h1>
            <p className="text-muted-foreground">
              Test and debug BLE connections to Cyan M02S glasses
            </p>
          </div>
          <Badge variant={isSupported ? 'default' : 'destructive'}>
            {platform === 'native' ? 'Native' : 'Web'} Bluetooth: {isSupported ? 'Supported' : 'Not Supported'}
          </Badge>
        </div>

        {!isSupported && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <X className="h-5 w-5" />
                <span>
                  Web Bluetooth is not supported in this browser. 
                  Please use Chrome, Edge, or Opera on desktop/Android.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Connection Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BluetoothSearching className="h-5 w-5" />
                Connection Controls
              </CardTitle>
              <CardDescription>
                Test different connection methods to debug service discovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Debug Scan (Discover All Services)</h4>
                <p className="text-xs text-muted-foreground">
                  Connects with acceptAllDevices to discover ALL available services and characteristics.
                  Use this to find the correct UUIDs if normal connection fails.
                </p>
                <Button 
                  onClick={handleDebugScan} 
                  disabled={!isSupported || isScanning}
                  variant="outline"
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <BluetoothSearching className="mr-2 h-4 w-4" />
                      Debug Scan
                    </>
                  )}
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Normal Connect</h4>
                <p className="text-xs text-muted-foreground">
                  Standard connection with dynamic service discovery. 
                  This is what the app normally uses.
                </p>
                <Button 
                  onClick={cyanGlassesService.isConnected() ? handleDisconnect : handleNormalConnect} 
                  disabled={!isSupported || isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : cyanGlassesService.isConnected() ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Bluetooth className="mr-2 h-4 w-4" />
                      Connect to Glasses
                    </>
                  )}
                </Button>
              </div>

              {/* Expected UUIDs Reference */}
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Expected UUIDs</h4>
                <div className="text-xs font-mono bg-muted p-2 rounded space-y-1">
                  <p>Primary Service: {PRIMARY_SERVICE_UUID}</p>
                  <p>Secondary: {SECONDARY_SERVICE_UUID}</p>
                  <p>Write Char: {WRITE_CHARACTERISTIC_UUID}</p>
                  <p>Notify Char: {NOTIFY_CHARACTERISTIC_UUID}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discovered Services */}
          <Card>
            <CardHeader>
              <CardTitle>Discovered Services</CardTitle>
              <CardDescription>
                {deviceInfo 
                  ? `Device: ${deviceInfo.name || deviceInfo.id}`
                  : 'Connect to a device to see its services'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {discoveredServices.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No services discovered yet</p>
                ) : (
                  <div className="space-y-3">
                    {discoveredServices.map((service, idx) => (
                      <motion.div
                        key={service.uuid}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant={isExpectedUUID(service.uuid) ? 'default' : 'secondary'}>
                            Service
                          </Badge>
                          <code className="text-xs">{service.uuid}</code>
                          {isExpectedUUID(service.uuid) && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="ml-4 space-y-1">
                          {service.characteristics.map((char, charIdx) => (
                            <div key={charIdx} className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">└─</span>
                              <code className={isExpectedUUID(char.uuid) ? 'text-primary' : ''}>
                                {char.uuid}
                              </code>
                              <div className="flex gap-1">
                                {char.properties.map(prop => (
                                  <Badge key={prop} variant="outline" className="text-[10px] py-0">
                                    {prop}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Connection Logs</CardTitle>
              <CardDescription>Detailed log of BLE operations</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLogsToClipboard}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] bg-muted/50 rounded p-3 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">No logs yet. Start a scan or connection.</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {getLogIcon(log.type)}
                      <span className="text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={
                        log.type === 'error' ? 'text-destructive' :
                        log.type === 'success' ? 'text-green-500' :
                        log.type === 'warning' ? 'text-yellow-500' :
                        ''
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Protocol Analyzer */}
        <BLEProtocolAnalyzer />

        {/* Enhanced Camera Capture */}
        <div className="grid gap-6 md:grid-cols-2">
          <EnhancedCameraCapture 
            onMediaCaptured={(url, type) => {
              toast({
                title: 'Media Captured',
                description: `${type} uploaded: ${url.slice(-30)}...`,
              });
            }}
          />
          <Card>
            <CardHeader>
              <CardTitle>Capture Integration</CardTitle>
              <CardDescription>
                Use the enhanced camera as a fallback when glasses cannot transfer media directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted space-y-3 text-sm">
                <h4 className="font-medium">How to use with Cyan glasses:</h4>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Connect glasses via Bluetooth (for commands only)</li>
                  <li>Use phone camera for actual media capture</li>
                  <li>Photos/videos upload directly to cloud</li>
                  <li>Glasses commands can trigger phone capture</li>
                </ol>
              </div>
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-sm">
                <p className="text-warning font-medium mb-1">Why not glasses camera?</p>
                <p className="text-muted-foreground">
                  Cyan glasses store media internally and use WiFi Direct for transfer, 
                  which isn't accessible via Web Bluetooth. Use the HeyCyan app to 
                  transfer media, or use the phone camera integration shown here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default BluetoothTest;
