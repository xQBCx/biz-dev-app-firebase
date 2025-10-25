import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Package, Users, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ERP() {
  const navigate = useNavigate();

  const erpModules = [
    {
      title: "Financial Management",
      description: "Comprehensive accounting, budgeting, and financial reporting",
      icon: DollarSign,
      features: ["General Ledger", "Accounts Payable/Receivable", "Financial Reporting", "Budget Management"],
    },
    {
      title: "Human Resources",
      description: "Employee management, payroll, and talent acquisition",
      icon: Users,
      features: ["Employee Records", "Payroll Processing", "Benefits Management", "Performance Reviews"],
    },
    {
      title: "Supply Chain",
      description: "Inventory, procurement, and logistics management",
      icon: Package,
      features: ["Inventory Control", "Purchase Orders", "Supplier Management", "Warehouse Operations"],
    },
    {
      title: "Analytics & Reporting",
      description: "Real-time business intelligence and data visualization",
      icon: BarChart3,
      features: ["Custom Dashboards", "KPI Tracking", "Predictive Analytics", "Automated Reports"],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Building className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">BizDev ERP</h1>
              <p className="text-muted-foreground">Enterprise Resource Planning System</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,847</div>
              <p className="text-xs text-green-500">+12% this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">847M</div>
              <p className="text-xs text-green-500">+23% this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.4B</div>
              <p className="text-xs text-green-500">+18% this quarter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* ERP Modules */}
        <div>
          <h2 className="text-2xl font-bold mb-6">ERP Modules</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {erpModules.map((module) => (
              <Card key={module.title} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <module.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.features.map((feature) => (
                      <li key={feature} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    Access Module
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button onClick={() => navigate("/erp-setup")}>ERP Setup Wizard</Button>
            <Button variant="outline">View Reports</Button>
            <Button variant="outline">System Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
