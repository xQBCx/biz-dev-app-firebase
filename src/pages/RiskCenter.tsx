import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, AlertTriangle, TrendingUp, FileCheck, 
  Building2, Lock, Activity, FileWarning,
  ArrowLeft, Plus, RefreshCw
} from "lucide-react";
import { RiskHeatMap } from "@/components/risk/RiskHeatMap";
import { RiskStatCards } from "@/components/risk/RiskStatCards";
import { TopRisksTable } from "@/components/risk/TopRisksTable";
import { KRIDashboard } from "@/components/risk/KRIDashboard";
import { useEnterpriseRisks } from "@/hooks/useEnterpriseRisks";

export default function RiskCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { risks, kris, loading, refresh } = useEnterpriseRisks();
  const [activeTab, setActiveTab] = useState("overview");

  const risksByCategory = {
    strategic: risks.filter(r => r.category === 'strategic'),
    operational: risks.filter(r => r.category === 'operational'),
    financial: risks.filter(r => r.category === 'financial'),
    compliance: risks.filter(r => r.category === 'compliance'),
    technology: risks.filter(r => r.category === 'technology'),
    reputational: risks.filter(r => r.category === 'reputational'),
  };

  const criticalRisks = risks.filter(r => (r.inherent_risk_score || 0) >= 20);
  const highRisks = risks.filter(r => (r.inherent_risk_score || 0) >= 12 && (r.inherent_risk_score || 0) < 20);
  const breachedKRIs = kris.filter(k => k.current_value && k.threshold_critical && k.current_value >= k.threshold_critical);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              Enterprise Risk Command Center
            </h1>
            <p className="text-muted-foreground text-sm">
              Unified risk visibility, monitoring, and mitigation
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/risk-register')}>
            <Plus className="h-4 w-4 mr-2" />
            New Risk
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <RiskStatCards 
        totalRisks={risks.length}
        criticalCount={criticalRisks.length}
        highCount={highRisks.length}
        breachedKRIs={breachedKRIs.length}
        loading={loading}
      />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1">
          <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="risks" className="text-xs md:text-sm">Risk Register</TabsTrigger>
          <TabsTrigger value="kri" className="text-xs md:text-sm">KRIs</TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs md:text-sm">Vendors</TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs md:text-sm">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Heat Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Risk Heat Map
                </CardTitle>
                <CardDescription>Likelihood vs Impact Matrix</CardDescription>
              </CardHeader>
              <CardContent>
                <RiskHeatMap risks={risks} />
              </CardContent>
            </Card>

            {/* Top Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Top 10 Risks
                </CardTitle>
                <CardDescription>Highest inherent risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <TopRisksTable risks={risks.slice(0, 10)} onViewRisk={(id) => navigate(`/risk-register?id=${id}`)} />
              </CardContent>
            </Card>
          </div>

          {/* Risk by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(risksByCategory).map(([category, categoryRisks]) => (
                  <div 
                    key={category}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/risk-register?category=${category}`)}
                  >
                    <div className="text-2xl font-bold">{categoryRisks.length}</div>
                    <div className="text-sm text-muted-foreground capitalize">{category}</div>
                    {categoryRisks.filter(r => (r.inherent_risk_score || 0) >= 20).length > 0 && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        {categoryRisks.filter(r => (r.inherent_risk_score || 0) >= 20).length} Critical
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/vendor-risk')}>
              <CardContent className="p-4 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-medium">Vendor Risk</div>
                  <div className="text-sm text-muted-foreground">Third-party assessments</div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/compliance-center')}>
              <CardContent className="p-4 flex items-center gap-3">
                <FileCheck className="h-8 w-8 text-green-500" />
                <div>
                  <div className="font-medium">Compliance</div>
                  <div className="text-sm text-muted-foreground">Control testing</div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/incidents')}>
              <CardContent className="p-4 flex items-center gap-3">
                <FileWarning className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="font-medium">Incidents</div>
                  <div className="text-sm text-muted-foreground">Security events</div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/continuity')}>
              <CardContent className="p-4 flex items-center gap-3">
                <Lock className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="font-medium">Continuity</div>
                  <div className="text-sm text-muted-foreground">BCP & DR plans</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Enterprise Risk Register</CardTitle>
                <CardDescription>Manage and track all organizational risks</CardDescription>
              </div>
              <Button onClick={() => navigate('/risk-register')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Risk
              </Button>
            </CardHeader>
            <CardContent>
              <TopRisksTable risks={risks} onViewRisk={(id) => navigate(`/risk-register?id=${id}`)} showAll />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kri" className="mt-6">
          <KRIDashboard kris={kris} risks={risks} onRefresh={refresh} />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Vendor Risk Management</CardTitle>
              <CardDescription>Assess and monitor vendor security posture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Vendor risk management module</p>
              <Button onClick={() => navigate('/vendor-risk')}>
                Go to Vendor Risk
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Control Center</CardTitle>
              <CardDescription>SOC 2, ISO 27001, GDPR, and more</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Compliance automation and control testing</p>
              <Button onClick={() => navigate('/compliance-center')}>
                Go to Compliance Center
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
