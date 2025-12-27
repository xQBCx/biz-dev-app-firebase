import { MetricCard } from "./MetricCard";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface KPIItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  iconClassName?: string;
}

interface KPIGridProps {
  items: KPIItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ items, columns = 4, className }: KPIGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {items.map((item, index) => (
        <MetricCard
          key={index}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          icon={item.icon}
          trend={item.trend}
          iconClassName={item.iconClassName}
        />
      ))}
    </div>
  );
}
