import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons/IndustrialIcons";
import { Inspection } from "@/types/inspection";
import { defectTypeLabels } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface RecentInspectionsProps {
  inspections: Inspection[];
  onViewDetails: (id: string) => void;
}

export function RecentInspections({
  inspections,
  onViewDetails,
}: RecentInspectionsProps) {
  const statusVariants = {
    completed: { badge: "success", text: "Completed" },
    "in-progress": { badge: "info", text: "In Progress" },
    "requires-review": { badge: "warning", text: "Needs Review" },
  };

  return (
    <Card variant="steel">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Icons.clipboard className="h-5 w-5 text-accent" />
          Recent Inspections
        </CardTitle>
        <Button variant="ghost" size="sm">
          View All
          <Icons.chevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {inspections.map((inspection, index) => (
          <motion.div
            key={inspection.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn(
              "flex flex-col gap-3 rounded-lg border border-border bg-card/50 p-3 transition-all duration-200 hover:border-accent/30 hover:bg-card/70 sm:flex-row sm:items-center sm:justify-between sm:p-4"
            )}
          >
            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12",
                  inspection.defects.length > 0
                    ? inspection.defects.some((d) => d.severity === "critical")
                      ? "bg-destructive/20 text-destructive"
                      : "bg-warning/20 text-warning"
                    : "bg-success/20 text-success"
                )}
              >
                {inspection.defects.length > 0 ? (
                  <Icons.alertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Icons.checkCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold uppercase tracking-wider sm:text-base">
                    {inspection.id}
                  </span>
                  <Badge
                    variant={
                      statusVariants[inspection.status].badge as
                        | "success"
                        | "info"
                        | "warning"
                    }
                  >
                    {statusVariants[inspection.status].text}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {inspection.location}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:gap-3">
                  <span className="flex items-center gap-1">
                    <Icons.users className="h-3 w-3" />
                    {inspection.welderName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icons.clock className="h-3 w-3" />
                    {inspection.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {inspection.defects.length > 0 && (
                <div className="flex-1 sm:text-right">
                  <div className="flex flex-wrap gap-1">
                    {inspection.defects.slice(0, 2).map((defect) => (
                      <Badge
                        key={defect.id}
                        variant={
                          defect.severity === "critical"
                            ? "critical"
                            : defect.severity === "major"
                            ? "major"
                            : "minor"
                        }
                        className="text-xs"
                      >
                        {defectTypeLabels[defect.type]}
                      </Badge>
                    ))}
                    {inspection.defects.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{inspection.defects.length - 2}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Est. Repair: ${inspection.costs.totalCost.toFixed(0)}
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewDetails(inspection.id)}
                className="shrink-0"
              >
                <Icons.chevronRight className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
