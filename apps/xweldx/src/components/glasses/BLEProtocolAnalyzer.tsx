import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bluetooth, 
  Send, 
  Download, 
  Copy, 
  Trash2, 
  Play, 
  Pause,
  Terminal,
  Zap,
  FileCode,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { bluetoothService } from '@/services/bluetoothService';
import { cyanGlassesService } from '@/services/cyanGlassesService';
import { cn } from '@/lib/utils';

interface ProtocolLog {
  id: string;
  timestamp: Date;
  direction: 'tx' | 'rx';
  data: Uint8Array;
  parsed?: string;
  opcode?: number;
}

// Known command patterns discovered through analysis
const KNOWN_COMMANDS: Record<number, { name: string; description: string }> = {
  0x01: { name: 'CAPTURE_PHOTO', description: 'Trigger photo capture' },
  0x02: { name: 'START_VIDEO', description: 'Start video recording' },
  0x03: { name: 'STOP_VIDEO', description: 'Stop video recording' },
  0x04: { name: 'START_AUDIO', description: 'Start audio recording' },
  0x05: { name: 'STOP_AUDIO', description: 'Stop audio recording' },
  0x10: { name: 'GET_BATTERY', description: 'Request battery status' },
  0x11: { name: 'GET_MEDIA_COUNTS', description: 'Get photo/video/audio counts' },
  0x20: { name: 'SYNC_TIME', description: 'Synchronize device time' },
  0x30: { name: 'GET_FIRMWARE', description: 'Get firmware version' },
};

// Quick command buttons for testing
const QUICK_COMMANDS = [
  { label: 'Battery', opcode: 0x10, icon: '🔋' },
  { label: 'Photo', opcode: 0x01, icon: '📷' },
  { label: 'Video Start', opcode: 0x02, icon: '🎬' },
  { label: 'Video Stop', opcode: 0x03, icon: '⏹️' },
  { label: 'Audio Start', opcode: 0x04, icon: '🎙️' },
  { label: 'Audio Stop', opcode: 0x05, icon: '⏹️' },
  { label: 'Media Count', opcode: 0x11, icon: '📊' },
  { label: 'Firmware', opcode: 0x30, icon: '📋' },
];

export function BLEProtocolAnalyzer() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [logs, setLogs] = useState<ProtocolLog[]>([]);
  const [customCommand, setCustomCommand] = useState('');
  const [selectedLog, setSelectedLog] = useState<ProtocolLog | null>(null);

  // Monitor connection state
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(cyanGlassesService.isConnected());
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  // Parse incoming data
  const parseData = useCallback((data: Uint8Array): { opcode?: number; parsed?: string } => {
    if (data.length === 0) return {};
    
    const opcode = data[0];
    const command = KNOWN_COMMANDS[opcode];
    
    if (command) {
      let parsed = `${command.name}`;
      
      // Parse specific response formats
      switch (opcode) {
        case 0x10: // Battery status
          if (data.length >= 3) {
            parsed += ` - Level: ${data[1]}%, Charging: ${data[2] === 1 ? 'Yes' : 'No'}`;
          }
          break;
        case 0x11: // Media counts
          if (data.length >= 7) {
            const photos = (data[1] << 8) | data[2];
            const videos = (data[3] << 8) | data[4];
            const audio = (data[5] << 8) | data[6];
            parsed += ` - Photos: ${photos}, Videos: ${videos}, Audio: ${audio}`;
          }
          break;
        case 0x30: // Firmware
          if (data.length > 1) {
            const version = new TextDecoder().decode(data.slice(1)).replace(/\0/g, '');
            parsed += ` - Version: ${version}`;
          }
          break;
      }
      
      return { opcode, parsed };
    }
    
    return { opcode, parsed: `Unknown opcode: 0x${opcode.toString(16).padStart(2, '0')}` };
  }, []);

  // Add log entry
  const addLog = useCallback((direction: 'tx' | 'rx', data: Uint8Array) => {
    const { opcode, parsed } = parseData(data);
    
    const log: ProtocolLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      direction,
      data,
      opcode,
      parsed,
    };
    
    setLogs(prev => [log, ...prev].slice(0, 500)); // Keep last 500 entries
  }, [parseData]);

  // Send custom command
  const sendCommand = useCallback(async (hexString: string) => {
    if (!isConnected) {
      toast.error('Not connected to glasses');
      return;
    }

    try {
      // Parse hex string to bytes
      const bytes = hexString
        .replace(/\s/g, '')
        .match(/.{1,2}/g)
        ?.map(b => parseInt(b, 16)) || [];
      
      if (bytes.length === 0) {
        toast.error('Invalid hex command');
        return;
      }

      const data = new Uint8Array(bytes);
      addLog('tx', data);
      
      await bluetoothService.write(data);
      toast.success('Command sent');
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send command');
    }
  }, [isConnected, addLog]);

  // Send quick command
  const sendQuickCommand = useCallback(async (opcode: number) => {
    if (!isConnected) {
      toast.error('Not connected to glasses');
      return;
    }

    try {
      // Build command with checksum
      const data = new Uint8Array(2);
      data[0] = opcode;
      data[1] = opcode; // Simple XOR checksum
      
      addLog('tx', data);
      await bluetoothService.write(data);
      toast.success(`Sent ${KNOWN_COMMANDS[opcode]?.name || 'command'}`);
    } catch (error) {
      console.error('Quick command error:', error);
      toast.error('Failed to send command');
    }
  }, [isConnected, addLog]);

  // Format bytes for display
  const formatBytes = (data: Uint8Array): string => {
    return Array.from(data)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  };

  // Export logs
  const exportLogs = useCallback(() => {
    const logText = logs.map(log => {
      const dir = log.direction === 'tx' ? '→' : '←';
      const hex = formatBytes(log.data);
      const parsed = log.parsed ? ` | ${log.parsed}` : '';
      return `[${log.timestamp.toISOString()}] ${dir} ${hex}${parsed}`;
    }).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ble-protocol-log-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported');
  }, [logs]);

  // Copy logs to clipboard
  const copyLogs = useCallback(() => {
    const logText = logs.map(log => {
      const dir = log.direction === 'tx' ? 'TX' : 'RX';
      const hex = formatBytes(log.data);
      return `[${dir}] ${hex}${log.parsed ? ` - ${log.parsed}` : ''}`;
    }).join('\n');

    navigator.clipboard.writeText(logText);
    toast.success('Logs copied to clipboard');
  }, [logs]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isConnected ? "bg-success/20" : "bg-secondary"
            )}>
              <Terminal className={cn(
                "h-5 w-5",
                isConnected ? "text-success" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">BLE Protocol Analyzer</CardTitle>
              <CardDescription>
                Reverse-engineer Cyan M02S command protocol
              </CardDescription>
            </div>
          </div>
          <Badge variant={isConnected ? 'success' : 'secondary'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="commands" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="commands" className="gap-2">
              <Zap className="h-4 w-4" />
              Quick Commands
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Send className="h-4 w-4" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileCode className="h-4 w-4" />
              Protocol Logs
            </TabsTrigger>
          </TabsList>

          {/* Quick Commands Tab */}
          <TabsContent value="commands" className="p-4 mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_COMMANDS.map(cmd => (
                <Button
                  key={cmd.opcode}
                  variant="outline"
                  onClick={() => sendQuickCommand(cmd.opcode)}
                  disabled={!isConnected}
                  className="h-auto py-3 flex-col gap-1"
                >
                  <span className="text-xl">{cmd.icon}</span>
                  <span className="text-xs">{cmd.label}</span>
                  <code className="text-[10px] text-muted-foreground">
                    0x{cmd.opcode.toString(16).padStart(2, '0')}
                  </code>
                </Button>
              ))}
            </div>

            {!isConnected && (
              <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-center gap-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                Connect to glasses first to send commands
              </div>
            )}
          </TabsContent>

          {/* Custom Command Tab */}
          <TabsContent value="custom" className="p-4 mt-0 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Custom Hex Command
              </label>
              <div className="flex gap-2">
                <Input
                  value={customCommand}
                  onChange={(e) => setCustomCommand(e.target.value.toUpperCase())}
                  placeholder="01 10 FF..."
                  className="font-mono"
                />
                <Button
                  onClick={() => sendCommand(customCommand)}
                  disabled={!isConnected || !customCommand}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter hex bytes separated by spaces (e.g., "01 00 10")
              </p>
            </div>

            {/* Command reference */}
            <div>
              <h4 className="text-sm font-medium mb-2">Known Command Reference</h4>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-xs font-mono">
                {Object.entries(KNOWN_COMMANDS).map(([opcode, cmd]) => (
                  <div key={opcode} className="flex gap-2">
                    <span className="text-primary">0x{parseInt(opcode).toString(16).padStart(2, '0')}</span>
                    <span className="text-muted-foreground">-</span>
                    <span>{cmd.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Protocol Logs Tab */}
          <TabsContent value="logs" className="mt-0">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2">
                <Button
                  variant={isCapturing ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setIsCapturing(!isCapturing)}
                >
                  {isCapturing ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Capture
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {logs.length} entries
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={copyLogs}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={exportLogs}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setLogs([])}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[300px]">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Terminal className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">No protocol data captured yet</p>
                  <p className="text-xs">Send commands to see the protocol</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: log.direction === 'tx' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "px-4 py-2 hover:bg-muted/50 cursor-pointer text-xs font-mono",
                        selectedLog?.id === log.id && "bg-muted"
                      )}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        {log.direction === 'tx' ? (
                          <ArrowRight className="h-3 w-3 text-blue-500" />
                        ) : (
                          <ArrowLeft className="h-3 w-3 text-green-500" />
                        )}
                        <code className={cn(
                          "flex-1",
                          log.direction === 'tx' ? 'text-blue-400' : 'text-green-400'
                        )}>
                          {formatBytes(log.data)}
                        </code>
                      </div>
                      {log.parsed && (
                        <div className="ml-24 mt-1 text-muted-foreground">
                          {log.parsed}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
