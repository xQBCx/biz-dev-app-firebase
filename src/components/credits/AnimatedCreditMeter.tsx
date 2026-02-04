import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";

interface AnimatedCreditMeterProps {
  title: string;
  description: string;
  icon: LucideIcon;
  variant: 'compute' | 'action' | 'outcome';
  earned: number;
  used: number;
  previousEarned?: number;
  dollarValue: number;
  target?: number;
}

export function AnimatedCreditMeter({
  title,
  description,
  icon: Icon,
  variant,
  earned,
  used,
  previousEarned = 0,
  dollarValue,
  target = 1000,
}: AnimatedCreditMeterProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const net = earned - used;
  const earnedPercent = Math.min((earned / target) * 100, 100);
  const change = previousEarned > 0 ? ((earned - previousEarned) / previousEarned) * 100 : 0;

  // Animate the value on mount/change
  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValue = animatedValue;
    const endValue = net;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      
      setAnimatedValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [net]);

  const variantStyles = {
    compute: {
      color: 'text-blue-500',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      barColor: 'bg-blue-500',
      barBg: 'bg-blue-500/20',
      ringColor: 'ring-blue-500/30',
      glowColor: 'shadow-blue-500/20',
    },
    action: {
      color: 'text-amber-500',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      barColor: 'bg-amber-500',
      barBg: 'bg-amber-500/20',
      ringColor: 'ring-amber-500/30',
      glowColor: 'shadow-amber-500/20',
    },
    outcome: {
      color: 'text-emerald-500',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      barColor: 'bg-emerald-500',
      barBg: 'bg-emerald-500/20',
      ringColor: 'ring-emerald-500/30',
      glowColor: 'shadow-emerald-500/20',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      `bg-gradient-to-br ${styles.bgGradient}`,
      `ring-1 ${styles.ringColor}`,
      `hover:${styles.glowColor}`
    )}>
      {/* Animated background pulse */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500",
        earned > 0 && "animate-pulse opacity-10",
        styles.barColor
      )} />

      <CardHeader className="pb-2 relative">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg", styles.barBg)}>
              <Icon className={cn("h-4 w-4", styles.color)} />
            </div>
            {title}
          </div>
          {change !== 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-normal px-2 py-0.5 rounded-full",
                    change > 0 ? "text-emerald-600 bg-emerald-500/10" : 
                    change < 0 ? "text-red-600 bg-red-500/10" : "text-muted-foreground"
                  )}>
                    {change > 0 ? <TrendingUp className="h-3 w-3" /> : 
                     change < 0 ? <TrendingDown className="h-3 w-3" /> : 
                     <Minus className="h-3 w-3" />}
                    {Math.abs(change).toFixed(1)}%
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  vs previous period
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-bold tabular-nums tracking-tight", styles.color)}>
              {animatedValue.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">credits</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>

        {/* Progress bar with glow effect */}
        <div className="space-y-2">
          <div className={cn("relative h-2 rounded-full overflow-hidden", styles.barBg)}>
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
                styles.barColor
              )}
              style={{ width: `${earnedPercent}%` }}
            />
            {/* Shimmer effect */}
            <div 
              className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
              style={{ 
                animationDuration: '2s',
                width: `${earnedPercent}%` 
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              +{earned.toFixed(1)} earned / -{used.toFixed(1)} used
            </span>
            <span className={cn("font-medium", styles.color)}>
              ${dollarValue.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
