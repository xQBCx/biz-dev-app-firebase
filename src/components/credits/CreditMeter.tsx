import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface CreditMeterProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  earned: number;
  used: number;
  target?: number;
  unit?: string;
}

export function CreditMeter({
  title,
  description,
  icon: Icon,
  iconColor,
  earned,
  used,
  target = 100,
  unit = "credits",
}: CreditMeterProps) {
  const net = earned - used;
  const earnedPercent = Math.min((earned / target) * 100, 100);
  const usedPercent = Math.min((used / target) * 100, earnedPercent);

  return (
    <Card className="relative overflow-hidden">
      <div 
        className={cn(
          "absolute inset-0 opacity-5",
          iconColor.includes("blue") && "bg-gradient-to-br from-blue-500 to-blue-600",
          iconColor.includes("amber") && "bg-gradient-to-br from-amber-500 to-amber-600",
          iconColor.includes("green") && "bg-gradient-to-br from-green-500 to-green-600"
        )}
      />
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={cn("h-4 w-4", iconColor)} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums">{net.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">net {unit}</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden cursor-help">
                {/* Earned bar (background) */}
                <div 
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    iconColor.includes("blue") && "bg-blue-500/30",
                    iconColor.includes("amber") && "bg-amber-500/30",
                    iconColor.includes("green") && "bg-green-500/30"
                  )}
                  style={{ width: `${earnedPercent}%` }}
                />
                {/* Net bar (foreground) */}
                <div 
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                    iconColor.includes("blue") && "bg-blue-500",
                    iconColor.includes("amber") && "bg-amber-500",
                    iconColor.includes("green") && "bg-green-500"
                  )}
                  style={{ width: `${Math.max(0, earnedPercent - usedPercent)}%` }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span>Earned:</span>
                  <span className="font-medium">+{earned.toFixed(1)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Used:</span>
                  <span className="font-medium">-{used.toFixed(1)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between gap-4">
                  <span>Net:</span>
                  <span className="font-bold">{net.toFixed(1)}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>+{earned.toFixed(1)} earned</span>
          <span>-{used.toFixed(1)} used</span>
        </div>
      </CardContent>
    </Card>
  );
}
