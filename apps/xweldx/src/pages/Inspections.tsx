import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons/IndustrialIcons";
import { mockRecentInspections } from "@/data/mockData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { defectTypeLabels } from "@/data/mockData";
import { Link } from "react-router-dom";

const Inspections = () => {
  const statusVariants = {
    completed: { badge: "success" as const, text: "Completed" },
    "in-progress": { badge: "info" as const, text: "In Progress" },
    "requires-review": { badge: "warning" as const, text: "Needs Review" },
  };

  return (
    <AppLayout>
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider">
              Inspections
            </h1>
            <p className="mt-2 text-muted-foreground">
              View and manage all weld inspections
            </p>
          </div>
          <Button variant="industrial" asChild>
            <Link to="/inspections/new">
              <Icons.clipboard className="h-5 w-5" />
              New Inspection
            </Link>
          </Button>
        </div>
      </motion.section>

      <div className="space-y-4">
        {mockRecentInspections.map((inspection, index) => (
          <motion.div
            key={inspection.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card variant="steel" className="overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-lg",
                          inspection.defects.length > 0
                            ? inspection.defects.some(
                                (d) => d.severity === "critical"
                              )
                              ? "bg-destructive/20 text-destructive"
                              : "bg-warning/20 text-warning"
                            : "bg-success/20 text-success"
                        )}
                      >
                        {inspection.defects.length > 0 ? (
                          <Icons.alertTriangle className="h-7 w-7" />
                        ) : (
                          <Icons.checkCircle className="h-7 w-7" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold uppercase tracking-wider">
                            {inspection.id}
                          </h3>
                          <Badge
                            variant={statusVariants[inspection.status].badge}
                          >
                            {statusVariants[inspection.status].text}
                          </Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {inspection.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">
                        ${inspection.costs.totalCost.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estimated cost
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.users className="h-4 w-4 text-muted-foreground" />
                      <span>{inspection.welderName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {inspection.timestamp.toLocaleDateString()}{" "}
                        {inspection.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.fileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{inspection.wpsRef}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Icons.wrench className="h-4 w-4 text-muted-foreground" />
                      <span>{inspection.costs.laborHours}h labor</span>
                    </div>
                  </div>

                  {inspection.defects.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Defects Found
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {inspection.defects.map((defect) => (
                          <Badge
                            key={defect.id}
                            variant={
                              defect.severity === "critical"
                                ? "critical"
                                : defect.severity === "major"
                                ? "major"
                                : "minor"
                            }
                          >
                            {defectTypeLabels[defect.type]} - {defect.location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-4 text-sm text-muted-foreground">
                    {inspection.notes}
                  </p>
                </div>

                <div className="flex flex-row items-center justify-end gap-2 border-t border-border bg-secondary/30 p-4 lg:flex-col lg:border-l lg:border-t-0">
                  <Button variant="secondary" size="sm">
                    <Icons.eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icons.fileText className="h-4 w-4" />
                    Report
                  </Button>
                  {inspection.status === "requires-review" && (
                    <Button variant="industrial" size="sm">
                      <Icons.checkCircle className="h-4 w-4" />
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Inspections;
