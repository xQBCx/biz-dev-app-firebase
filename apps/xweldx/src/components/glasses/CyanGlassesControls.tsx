import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Video, 
  Mic, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  WifiOff,
  Image,
  Film,
  AudioLines,
  Bluetooth,
  RefreshCw,
  Glasses
} from "lucide-react";
import { useCyanGlasses } from "@/hooks/useCyanGlasses";
import { cn } from "@/lib/utils";

export function CyanGlassesControls() {
  const {
    isSupported,
    isConnected,
    isConnecting,
    state,
    connect,
    disconnect,
    capturePhoto,
    toggleVideoRecording,
    toggleAudioRecording,
    refreshState,
  } = useCyanGlasses();

  if (!isSupported) {
    return (
      <Card variant="steel" className="overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <Glasses className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="uppercase tracking-wider">Cyan M02S Not Supported</CardTitle>
              <CardDescription>Web Bluetooth requires Chrome, Edge, or Opera</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const BatteryIcon = state.isCharging ? BatteryCharging : Battery;
  const batteryColor = state.batteryLevel > 50 
    ? 'text-success' 
    : state.batteryLevel > 20 
      ? 'text-warning' 
      : 'text-destructive';

  return (
    <Card variant="steel" className="overflow-hidden">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative p-2 rounded-lg transition-colors",
              isConnected ? "bg-success/20" : "bg-secondary"
            )}>
              <Glasses className={cn(
                "h-6 w-6",
                isConnected ? "text-success" : "text-muted-foreground"
              )} />
              {isConnected && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success"
                />
              )}
            </div>
            <div>
              <CardTitle className="uppercase tracking-wider">Cyan M02S</CardTitle>
              <CardDescription>
                {isConnected ? 'Connected via Bluetooth LE' : 'Smart glasses ready to pair'}
              </CardDescription>
            </div>
          </div>
          
          {isConnected ? (
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshState}
                className="h-9 w-9"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              variant="industrial"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Bluetooth className="h-5 w-5 mr-2" />
                  </motion.div>
                  Pairing...
                </>
              ) : (
                <>
                  <Bluetooth className="h-5 w-5 mr-2" />
                  Pair Glasses
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="p-6 space-y-6">
              {/* Status Row */}
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </Badge>
                
                <Badge variant="outline" className={cn("gap-1", batteryColor)}>
                  <BatteryIcon className="h-3 w-3" />
                  {state.batteryLevel}%
                  {state.isCharging && " (Charging)"}
                </Badge>
                
                <Badge variant="outline" className="gap-1">
                  v{state.firmwareVersion}
                </Badge>
              </div>

              {/* Battery Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Battery Level</span>
                  <span className={batteryColor}>{state.batteryLevel}%</span>
                </div>
                <Progress 
                  value={state.batteryLevel} 
                  className={cn(
                    "h-2",
                    state.batteryLevel > 50 
                      ? "[&>div]:bg-success" 
                      : state.batteryLevel > 20 
                        ? "[&>div]:bg-warning" 
                        : "[&>div]:bg-destructive"
                  )}
                />
              </div>

              {/* Media Counts */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Image className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-lg font-bold">{state.photoCount}</div>
                    <div className="text-xs text-muted-foreground">Photos</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <Film className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-lg font-bold">{state.videoCount}</div>
                    <div className="text-xs text-muted-foreground">Videos</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                  <AudioLines className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-lg font-bold">{state.audioCount}</div>
                    <div className="text-xs text-muted-foreground">Audio</div>
                  </div>
                </div>
              </div>

              {/* Capture Controls */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="industrial"
                  className="h-16 flex-col gap-1"
                  onClick={capturePhoto}
                >
                  <Camera className="h-6 w-6" />
                  <span className="text-xs">Photo</span>
                </Button>
                
                <Button
                  variant={state.isRecordingVideo ? "destructive" : "outline"}
                  className="h-16 flex-col gap-1 relative"
                  onClick={toggleVideoRecording}
                >
                  {state.isRecordingVideo && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"
                    />
                  )}
                  <Video className="h-6 w-6" />
                  <span className="text-xs">{state.isRecordingVideo ? 'Stop' : 'Video'}</span>
                </Button>
                
                <Button
                  variant={state.isRecordingAudio ? "destructive" : "outline"}
                  className="h-16 flex-col gap-1 relative"
                  onClick={toggleAudioRecording}
                >
                  {state.isRecordingAudio && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"
                    />
                  )}
                  <Mic className="h-6 w-6" />
                  <span className="text-xs">{state.isRecordingAudio ? 'Stop' : 'Audio'}</span>
                </Button>
              </div>

              {/* Voice Assistant Hint */}
              <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  Say <span className="text-accent font-bold">"Hey Cyan"</span> for voice commands
                </p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
