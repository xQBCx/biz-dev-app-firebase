import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, DollarSign, Shield, Globe, FileText, Zap, TrendingUp, Users, CheckCircle2, BarChart3, LayoutList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { XodiakAnalytics } from "@/components/xodiak/XodiakAnalytics";

export default function XodiakDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    {
      title: "Target Asset Capacity",
      value: "$200T+",
      subtitle: "Global infrastructure goal",
      icon: DollarSign,
      trend: null,
    },
    {
      title: "Global Transactions",
      value: "847M",
      subtitle: "+23.1% from last month",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Active Organizations",
      value: "12,847",
      subtitle: "+156 new this week",
      icon: Users,
      trend: "up",
    },
    {
      title: "Compliance Score",
      value: "99.8%",
      subtitle: "Maintained",
      icon: Shield,
      trend: null,
    },
  ];

  const platformServices = [
    {
      title: "Enterprise Portal",
      description: "Access comprehensive enterprise management tools",
      icon: Building,
      route: "/erp",
      color: "bg-primary",
    },
    {
      title: "ERP System",
      description: "Full enterprise resource planning and operations",
      icon: Building,
      route: "/erp",
      color: "bg-blue-500",
    },
    {
      title: "Asset Management",
      description: "Manage and track all organizational assets",
      icon: DollarSign,
      route: "/xodiak/assets",
      color: "bg-green-500",
    },
    {
      title: "Compliance Engine",
      description: "Automated compliance monitoring and reporting",
      icon: Shield,
      route: "/xodiak/compliance",
      color: "bg-purple-500",
    },
    {
      title: "Government Dashboard",
      description: "Specialized tools for government entities",
      icon: Globe,
      route: "/xodiak/government",
      color: "bg-cyan-500",
    },
    {
      title: "Smart Contract Builder",
      description: "Create and deploy quantum-resistant contracts",
      icon: FileText,
      route: "/xodiak/contracts",
      color: "bg-orange-500",
    },
  ];

  const adoption = [
    { label: "Governments", value: "127 Nations" },
    { label: "Fortune 500 Companies", value: "342 Enterprises" },
    { label: "NGOs & Aid Organizations", value: "1,247 Organizations" },
    { label: "Individual Citizens", value: "847M Users" },
  ];

  const capabilities = [
    { label: "Transaction Throughput", value: "1M+ TPS" },
    { label: "Post-Quantum Security", value: "✓ Active", badge: true },
    { label: "Cross-Border Settlement", value: "< 3 seconds" },
    { label: "Compliance Automation", value: "99.8% Accurate" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Welcome to XODIAK
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The world's first compliance-first financial operating system with quantum-resistant infrastructure
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutList className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {stat.subtitle}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

        {/* Platform Services */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Platform Services</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {platformServices.map((service) => (
              <Card key={service.title} className="group hover:shadow-lg transition-all cursor-pointer border-primary/20">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <Button 
                    onClick={() => navigate(service.route)} 
                    className="w-full"
                    variant="outline"
                  >
                    Access Platform
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Global Adoption & Platform Capabilities */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Global Adoption */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Global Adoption
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                XODIAK's reach across jurisdictions and sectors
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {adoption.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Badge variant="secondary">{item.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Platform Capabilities */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Platform Capabilities
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Core XODIAK infrastructure and services
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {capabilities.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {item.value}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{item.value}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
