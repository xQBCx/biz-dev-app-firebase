import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/icons/IndustrialIcons";
import { motion } from "framer-motion";

const reports = [
  {
    id: "RPT-2024-001",
    title: "Weekly Inspection Summary",
    date: new Date("2024-01-14"),
    type: "Summary",
    format: "PDF",
    status: "ready",
  },
  {
    id: "RPT-2024-002",
    title: "Q4 2023 Compliance Report",
    date: new Date("2024-01-10"),
    type: "Compliance",
    format: "PDF",
    status: "ready",
  },
  {
    id: "RPT-2024-003",
    title: "Cost Analysis - January",
    date: new Date("2024-01-15"),
    type: "Financial",
    format: "Excel",
    status: "generating",
  },
  {
    id: "RPT-2024-004",
    title: "ASME Sec VIII Audit Trail",
    date: new Date("2024-01-12"),
    type: "Audit",
    format: "PDF",
    status: "ready",
  },
];

const Reports = () => {
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
              Reports
            </h1>
            <p className="mt-2 text-muted-foreground">
              Export compliance reports and audit trails
            </p>
          </div>
          <Button variant="industrial">
            <Icons.fileText className="h-5 w-5" />
            Generate New Report
          </Button>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="steel" className="cursor-pointer transition-transform hover:scale-[1.02]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-accent/20 p-3 text-accent">
              <Icons.clipboard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider">Inspection Report</p>
              <p className="text-sm text-muted-foreground">ASME Sec VIII/IX</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="steel" className="cursor-pointer transition-transform hover:scale-[1.02]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-success/20 p-3 text-success">
              <Icons.shield className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider">Compliance Report</p>
              <p className="text-sm text-muted-foreground">API 577 / MSS SP-58</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="steel" className="cursor-pointer transition-transform hover:scale-[1.02]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-warning/20 p-3 text-warning">
              <Icons.barChart className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider">Cost Analysis</p>
              <p className="text-sm text-muted-foreground">Excel Export</p>
            </div>
          </CardContent>
        </Card>
        <Card variant="steel" className="cursor-pointer transition-transform hover:scale-[1.02]">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
              <Icons.users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold uppercase tracking-wider">Welder Performance</p>
              <p className="text-sm text-muted-foreground">Monthly Summary</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Recent Reports */}
      <Card variant="steel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.fileText className="h-5 w-5 text-accent" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col items-start justify-between gap-4 rounded-lg border border-border bg-card/50 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-secondary p-3">
                    <Icons.fileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{report.title}</p>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{report.id}</span>
                      <span>•</span>
                      <span>{report.date.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{report.format}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.status === "generating" ? (
                    <Badge variant="info" className="animate-pulse">
                      Generating...
                    </Badge>
                  ) : (
                    <>
                      <Button variant="secondary" size="sm">
                        <Icons.eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default Reports;
