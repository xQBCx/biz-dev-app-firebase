import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, CheckCircle2, Clock, FileText, Building, Globe, TrendingUp, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function XodiakCompliance() {
  const navigate = useNavigate();

  const complianceStats = [
    {
      title: "Compliance Score",
      value: "99.8%",
      change: "+0.2%",
      icon: Shield,
      trend: "up",
    },
    {
      title: "Active Regulations",
      value: "1,247",
      change: "12 jurisdictions",
      icon: FileText,
      trend: null,
    },
    {
      title: "Pending Reviews",
      value: "23",
      change: "-5 from last week",
      icon: Clock,
      trend: "down",
    },
    {
      title: "Risk Alerts",
      value: "3",
      change: "2 critical",
      icon: AlertTriangle,
      trend: "warning",
    },
  ];

  const regulations = [
    {
      id: "REG-001",
      name: "Anti-Money Laundering (AML)",
      jurisdiction: "Global",
      status: "compliant",
      lastReview: "2024-01-15",
      nextReview: "2024-04-15",
      framework: "FATF",
    },
    {
      id: "REG-002",
      name: "Know Your Customer (KYC)",
      jurisdiction: "EU",
      status: "compliant",
      lastReview: "2024-01-10",
      nextReview: "2024-04-10",
      framework: "GDPR",
    },
    {
      id: "REG-003",
      name: "Data Protection",
      jurisdiction: "US",
      status: "review",
      lastReview: "2024-01-05",
      nextReview: "2024-02-05",
      framework: "CCPA",
    },
    {
      id: "REG-004",
      name: "Financial Reporting",
      jurisdiction: "Global",
      status: "compliant",
      lastReview: "2024-01-20",
      nextReview: "2024-07-20",
      framework: "IFRS",
    },
    {
      id: "REG-005",
      name: "Securities Compliance",
      jurisdiction: "US",
      status: "action-required",
      lastReview: "2023-12-28",
      nextReview: "2024-01-28",
      framework: "SEC",
    },
  ];

  const riskAlerts = [
    {
      id: "RISK-001",
      title: "High-value transaction pattern detected",
      severity: "critical",
      jurisdiction: "EU",
      timestamp: "2024-01-22 14:30",
      status: "investigating",
    },
    {
      id: "RISK-002",
      title: "New regulatory update requires review",
      severity: "high",
      jurisdiction: "US",
      timestamp: "2024-01-22 10:15",
      status: "pending",
    },
    {
      id: "RISK-003",
      title: "Compliance certificate expiring soon",
      severity: "medium",
      jurisdiction: "APAC",
      timestamp: "2024-01-21 16:45",
      status: "scheduled",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "review":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "action-required":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500/5 via-background to-blue-500/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate("/xodiak")}>
            ← Back to XODIAK Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Compliance Engine</h1>
              <p className="text-muted-foreground">Automated compliance monitoring and regulatory intelligence</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          {complianceStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                      ? "text-blue-500"
                      : stat.trend === "warning"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="regulations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="regulations">Regulations</TabsTrigger>
            <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          </TabsList>

          {/* Regulations Tab */}
          <TabsContent value="regulations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Regulatory Compliance Overview</CardTitle>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input placeholder="Search regulations..." className="w-full" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jurisdictions</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="apac">APAC</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="action">Action Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Regulations Table */}
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Regulation</th>
                        <th className="text-left p-4 text-sm font-medium">Jurisdiction</th>
                        <th className="text-left p-4 text-sm font-medium">Framework</th>
                        <th className="text-left p-4 text-sm font-medium">Status</th>
                        <th className="text-left p-4 text-sm font-medium">Next Review</th>
                        <th className="text-left p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regulations.map((reg, index) => (
                        <tr
                          key={reg.id}
                          className={index !== regulations.length - 1 ? "border-b" : ""}
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{reg.name}</div>
                              <div className="text-sm text-muted-foreground">{reg.id}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              <Globe className="h-3 w-3 mr-1" />
                              {reg.jurisdiction}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{reg.framework}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(reg.status)}>
                              {reg.status === "compliant" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {reg.status === "review" && <Clock className="h-3 w-3 mr-1" />}
                              {reg.status === "action-required" && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {reg.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{reg.nextReview}</td>
                          <td className="p-4">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskAlerts.map((alert) => (
                  <Card key={alert.id} className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{alert.title}</h4>
                              <p className="text-sm text-muted-foreground">{alert.id}</p>
                            </div>
                            <Badge variant="outline">{alert.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {alert.jurisdiction}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {alert.timestamp}
                            </span>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">Investigate</Button>
                            <Button size="sm" variant="outline">
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Generate comprehensive compliance reports</p>
                <Button>Create New Report</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Frameworks Tab */}
          <TabsContent value="frameworks" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { name: "FATF", description: "Financial Action Task Force standards", coverage: "Global" },
                { name: "GDPR", description: "General Data Protection Regulation", coverage: "EU" },
                { name: "CCPA", description: "California Consumer Privacy Act", coverage: "US" },
                { name: "IFRS", description: "International Financial Reporting Standards", coverage: "Global" },
              ].map((framework) => (
                <Card key={framework.name} className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{framework.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{framework.description}</p>
                      </div>
                      <Badge variant="outline">
                        <Globe className="h-3 w-3 mr-1" />
                        {framework.coverage}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Framework Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
