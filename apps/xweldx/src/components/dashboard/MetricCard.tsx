import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "accent" | "danger" | "success";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className,
}: MetricCardProps) {
  const variants = {
    default: "border-border",
    accent: "border-accent/30 shadow-glow-accent",
    danger: "border-destructive/30 shadow-glow-danger",
    success: "border-success/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "steel-panel rounded-lg p-5 transition-all duration-300 hover:scale-[1.02]",
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-black tabular-nums tracking-tight sm:text-3xl">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-bold",
                  trend.positive ? "text-success" : "text-destructive"
                )}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "shrink-0 rounded-lg p-2 sm:p-3",
            variant === "accent" && "bg-accent/20 text-accent",
            variant === "danger" && "bg-destructive/20 text-destructive",
            variant === "success" && "bg-success/20 text-success",
            variant === "default" && "bg-secondary text-muted-foreground"
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
