import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons/IndustrialIcons";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const monthlyData = [
  { month: "Jan", inspections: 145, defects: 12, cost: 8500 },
  { month: "Feb", inspections: 162, defects: 18, cost: 12400 },
  { month: "Mar", inspections: 189, defects: 15, cost: 9800 },
  { month: "Apr", inspections: 201, defects: 22, cost: 15200 },
  { month: "May", inspections: 178, defects: 14, cost: 10100 },
  { month: "Jun", inspections: 195, defects: 8, cost: 6200 },
];

const efficiencyData = [
  { week: "W1", avgTime: 22, inspections: 35 },
  { week: "W2", avgTime: 19, inspections: 42 },
  { week: "W3", avgTime: 17, inspections: 48 },
  { week: "W4", avgTime: 15, inspections: 52 },
];

const tooltipStyle = {
  backgroundColor: "hsl(210, 80%, 8%)",
  border: "1px solid hsl(210, 30%, 18%)",
  borderRadius: "8px",
  color: "hsl(210, 20%, 95%)",
};

const Analytics = () => {
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
              Analytics
            </h1>
            <p className="mt-2 text-muted-foreground">
              Performance metrics and predictive insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Icons.clock className="h-4 w-4" />
              Last 6 Months
            </Button>
            <Button variant="industrial">
              <Icons.fileText className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Inspections Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="steel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.barChart className="h-5 w-5 text-accent" />
                Monthly Inspections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(210, 30%, 18%)"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(210, 15%, 55%)"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(210, 15%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="inspections"
                      fill="hsl(25, 95%, 53%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Repair Costs Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="steel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.zap className="h-5 w-5 text-warning" />
                Repair Costs ($)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(210, 30%, 18%)"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="hsl(210, 15%, 55%)"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(210, 15%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <defs>
                      <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="hsl(0, 72%, 51%)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(0, 72%, 51%)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="hsl(0, 72%, 51%)"
                      fillOpacity={1}
                      fill="url(#costGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Efficiency Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card variant="steel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.clock className="h-5 w-5 text-success" />
                Inspection Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiencyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(210, 30%, 18%)"
                    />
                    <XAxis
                      dataKey="week"
                      stroke="hsl(210, 15%, 55%)"
                      fontSize={12}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="hsl(210, 15%, 55%)"
                      fontSize={12}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(210, 15%, 55%)"
                      fontSize={12}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgTime"
                      stroke="hsl(142, 71%, 45%)"
                      strokeWidth={3}
                      name="Avg Time (min)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="inspections"
                      stroke="hsl(25, 95%, 53%)"
                      strokeWidth={3}
                      name="Inspections"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Average inspection time decreased by{" "}
                <span className="font-bold text-success">32%</span> this month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Predictive Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card variant="accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.target className="h-5 w-5 text-accent" />
                Predictive Failure Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
                  <div className="flex items-start gap-3">
                    <Icons.alertTriangle className="h-5 w-5 text-warning" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-warning">
                        High Risk Detected
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Spring Can SC-47 shows elevated stress patterns. ML
                        model predicts 73% failure probability within 30 days.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex items-start gap-3">
                    <Icons.checkCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-bold uppercase tracking-wider">
                        Maintenance Optimization
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Based on current patterns, optimal next inspection for
                        Unit 2 hangers is in 14 days.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-secondary/50 p-4">
                  <div className="flex items-start gap-3">
                    <Icons.barChart className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-bold uppercase tracking-wider">
                        Cost Projection
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Estimated Q2 repair costs: $52,400 based on current
                        defect trends.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Analytics;
