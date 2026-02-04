import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons, WeldSparkIcon } from "@/components/icons/IndustrialIcons";
import { ARGlassesStatus } from "@/types/inspection";
import { cn } from "@/lib/utils";

interface ARGlassesConnectionProps {
  status: ARGlassesStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ARGlassesConnection({
  status,
  onConnect,
  onDisconnect,
}: ARGlassesConnectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn(
        "steel-panel rounded-lg p-5 transition-all duration-300",
        status.connected
          ? "border-success/30 shadow-[0_0_30px_hsla(142,71%,45%,0.2)]"
          : "border-border"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className={cn(
              "relative rounded-xl p-3 sm:p-4",
              status.connected
                ? "bg-success/20 text-success"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <Icons.glasses className="h-6 w-6 sm:h-8 sm:w-8" />
            {status.connected && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold uppercase tracking-wider sm:text-lg">
              AR Glasses
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge variant={status.connected ? "success" : "outline"}>
                {status.connected ? "Connected" : "Disconnected"}
              </Badge>
              {status.connected && (
                <>
                  <span className="hidden text-sm text-muted-foreground sm:inline">
                    {status.deviceName}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icons.zap className="h-3 w-3" />
                    {status.batteryLevel}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {status.connected ? (
            <>
              <Badge
                variant={status.streaming ? "success" : "outline"}
                className="gap-1"
              >
                <Icons.camera className="h-3 w-3" />
                <span className="hidden xs:inline">{status.streaming ? "Streaming" : "Idle"}</span>
              </Badge>
              <Badge
                variant={status.modelLoaded ? "info" : "outline"}
                className="gap-1"
              >
                <WeldSparkIcon className="h-3 w-3" />
                <span className="hidden xs:inline">{status.modelLoaded ? "AI Ready" : "Loading"}</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={onDisconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button variant="industrial" onClick={onConnect} className="w-full sm:w-auto">
              <Icons.wifi className="h-5 w-5" />
              Connect Glasses
            </Button>
          )}
        </div>
      </div>

      {status.connected && status.streaming && (
        <div className="mt-4">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black/50">
            <div className="industrial-grid absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <WeldSparkIcon className="mx-auto h-16 w-16 animate-spark text-accent" />
                <p className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">
                  Live Feed Active
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  AI defect detection running
                </p>
              </div>
            </div>
            <div className="scan-line absolute inset-0" />
            {/* Recording indicator */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-destructive"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-destructive">
                REC
              </span>
            </div>
            {/* Time overlay */}
            <div className="absolute right-4 top-4 rounded bg-black/60 px-2 py-1 text-xs font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
