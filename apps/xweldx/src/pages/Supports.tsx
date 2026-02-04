import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons, PipeSupportIcon } from "@/components/icons/IndustrialIcons";
import { mockPipeSupports } from "@/data/mockData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Supports = () => {
  const statusConfig = {
    good: { badge: "success" as const, label: "Operational" },
    "needs-repair": { badge: "warning" as const, label: "Needs Repair" },
    critical: { badge: "critical" as const, label: "Critical" },
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
              Pipe Supports
            </h1>
            <p className="mt-2 text-muted-foreground">
              Spring cans, hangers, guides, and anchors
            </p>
          </div>
          <Button variant="industrial">
            <Icons.fileText className="h-5 w-5" />
            Upload Blueprint
          </Button>
        </div>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockPipeSupports.map((support, index) => (
          <motion.div
            key={support.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              variant={
                support.status === "critical"
                  ? "danger"
                  : support.status === "needs-repair"
                  ? "accent"
                  : "steel"
              }
              className="transition-transform hover:scale-[1.02]"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-lg p-3",
                        support.status === "critical"
                          ? "bg-destructive/20 text-destructive"
                          : support.status === "needs-repair"
                          ? "bg-warning/20 text-warning"
                          : "bg-success/20 text-success"
                      )}
                    >
                      <PipeSupportIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{support.name}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">
                        {support.type.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusConfig[support.status].badge}>
                    {statusConfig[support.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.mapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{support.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.fileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">{support.blueprintRef}</span>
                  </div>
                  {support.lastInspection && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icons.clock className="h-4 w-4" />
                      <span>
                        Last inspected:{" "}
                        {support.lastInspection.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Icons.eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Icons.clipboard className="h-4 w-4" />
                    Inspect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Supports;
