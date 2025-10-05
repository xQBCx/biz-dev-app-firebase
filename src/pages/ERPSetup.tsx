import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Database,
  Link2,
  Settings,
  Users,
  Shield,
  Rocket,
  RefreshCw,
  Clock,
  DollarSign,
  TrendingUp,
  Globe,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

type SetupStep = "assessment" | "integrations" | "data-migration" | "configuration" | "team" | "testing" | "launch";

type Integration = {
  id: string;
  name: string;
  category: string;
  icon: any;
  description: string;
  required?: boolean;
  connected?: boolean;
};

const availableIntegrations: Integration[] = [
  { id: "stripe", name: "Stripe", category: "Payment", icon: DollarSign, description: "Payment processing & revenue", required: true },
  { id: "quickbooks", name: "QuickBooks", category: "Accounting", icon: Database, description: "Legacy accounting data", required: false },
  { id: "salesforce", name: "Salesforce", category: "CRM", icon: Users, description: "Customer data sync", required: false },
  { id: "gusto", name: "Gusto", category: "Payroll", icon: Users, description: "Payroll & HR management", required: false },
  { id: "ramp", name: "Ramp", category: "Expense", icon: DollarSign, description: "Corporate cards & expenses", required: false },
  { id: "shopify", name: "Shopify", category: "E-commerce", icon: Globe, description: "E-commerce transactions", required: false }
];

const ERPSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>("assessment");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [setupData, setSetupData] = useState({
    companySize: "",
    monthlyRevenue: "",
    currentSystem: "",
    goLiveDate: "",
    selectedIntegrations: ["stripe"] as string[],
    dataBackup: true,
    twoWaySync: true,
    teamMembers: 1,
    cpaSupportNeeded: true
  });

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const steps: { id: SetupStep; label: string; icon: any }[] = [
    { id: "assessment", label: "Assessment", icon: Settings },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "data-migration", label: "Data Migration", icon: Database },
    { id: "configuration", label: "Configuration", icon: Settings },
    { id: "team", label: "Team Setup", icon: Users },
    { id: "testing", label: "Testing", icon: CheckCircle2 },
    { id: "launch", label: "Go Live", icon: Rocket }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
      setProgress((nextIndex / (steps.length - 1)) * 100);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
      setProgress((prevIndex / (steps.length - 1)) * 100);
    }
  };

  const handleToggleIntegration = (id: string) => {
    setSetupData(prev => ({
      ...prev,
      selectedIntegrations: prev.selectedIntegrations.includes(id)
        ? prev.selectedIntegrations.filter(i => i !== id)
        : [...prev.selectedIntegrations, id]
    }));
  };

  const handleLaunch = () => {
    toast.success("ERP implementation started! Our CPA-led team will reach out within 24 hours.");
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Badge variant="outline" className="border-primary text-primary">
              <Shield className="w-3 h-3 mr-1" />
              CPA-Led Implementation
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Database className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-2">ERP Implementation</h1>
          <p className="text-xl text-muted-foreground">Fast, secure, CPA-led setup - Go live in days, not months</p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 shadow-elevated border border-border mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Implementation Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-4" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStepIndex;
              const isCompleted = idx < currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${
                    isCompleted ? "border-primary bg-primary text-primary-foreground" :
                    isActive ? "border-primary bg-primary/10 text-primary" :
                    "border-border bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs text-center ${isActive ? "font-semibold" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-8 shadow-elevated border border-border mb-6">
          {currentStep === "assessment" && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll analyze your business needs and recommend the optimal ERP configuration
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold mb-4">Business Assessment</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Input
                    id="companySize"
                    value={setupData.companySize}
                    onChange={(e) => setSetupData({ ...setupData, companySize: e.target.value })}
                    placeholder="e.g., 10-50 employees"
                  />
                </div>

                <div>
                  <Label htmlFor="monthlyRevenue">Monthly Revenue</Label>
                  <Input
                    id="monthlyRevenue"
                    value={setupData.monthlyRevenue}
                    onChange={(e) => setSetupData({ ...setupData, monthlyRevenue: e.target.value })}
                    placeholder="e.g., $50K - $500K"
                  />
                </div>

                <div>
                  <Label htmlFor="currentSystem">Current Accounting System</Label>
                  <Input
                    id="currentSystem"
                    value={setupData.currentSystem}
                    onChange={(e) => setSetupData({ ...setupData, currentSystem: e.target.value })}
                    placeholder="QuickBooks, Excel, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="goLiveDate">Desired Go-Live Date</Label>
                  <Input
                    id="goLiveDate"
                    type="date"
                    value={setupData.goLiveDate}
                    onChange={(e) => setSetupData({ ...setupData, goLiveDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mt-6">
                <h3 className="font-semibold mb-3">What's Included</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "CPA-led implementation team",
                    "24/7 setup support",
                    "No charge until you're live",
                    "2-way encrypted data sync",
                    "Custom chart of accounts",
                    "Multi-entity consolidation"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === "integrations" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Connect Your Systems</h2>
              <p className="text-muted-foreground mb-6">
                Select the systems you want to integrate. We support 13,000+ native integrations.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {availableIntegrations.map((integration) => {
                  const Icon = integration.icon;
                  const isSelected = setupData.selectedIntegrations.includes(integration.id);
                  
                  return (
                    <Card
                      key={integration.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-glow ${
                        isSelected ? "border-2 border-primary bg-primary/5" : "border border-border"
                      }`}
                      onClick={() => !integration.required && handleToggleIntegration(integration.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          disabled={integration.required}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">{integration.name}</h3>
                            {integration.required && (
                              <Badge variant="secondary" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
                          <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-4 bg-accent/10 border-accent/30">
                <p className="text-sm">
                  <strong>Note:</strong> All integrations use encrypted 2-way sync. Your data in other systems remains untouched.
                </p>
              </Card>
            </div>
          )}

          {currentStep === "data-migration" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Data Migration Strategy</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Shield, label: "Encrypted Transfer", desc: "End-to-end encryption" },
                  { icon: RefreshCw, label: "2-Way Sync", desc: "Backup in both systems" },
                  { icon: Clock, label: "Zero Downtime", desc: "No business interruption" }
                ].map((feature, idx) => (
                  <Card key={idx} className="p-4 shadow-elevated border border-border text-center">
                    <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold mb-1">{feature.label}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Automated Data Backup</h3>
                    <p className="text-sm text-muted-foreground">Keep your data safe during migration</p>
                  </div>
                  <Checkbox
                    checked={setupData.dataBackup}
                    onCheckedChange={(checked) => setSetupData({ ...setupData, dataBackup: checked as boolean })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">2-Way Sync Enabled</h3>
                    <p className="text-sm text-muted-foreground">Changes sync between systems in real-time</p>
                  </div>
                  <Checkbox
                    checked={setupData.twoWaySync}
                    onCheckedChange={(checked) => setSetupData({ ...setupData, twoWaySync: checked as boolean })}
                  />
                </div>
              </div>

              <Card className="p-6 bg-gradient-primary border-0 shadow-glow">
                <h3 className="text-xl font-semibold text-primary-foreground mb-2">Migration Timeline</h3>
                <div className="grid md:grid-cols-3 gap-4 text-primary-foreground">
                  <div>
                    <div className="text-3xl font-bold mb-1">24hrs</div>
                    <div className="text-sm text-primary-foreground/80">Data extraction & validation</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">48hrs</div>
                    <div className="text-sm text-primary-foreground/80">Testing & verification</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">72hrs</div>
                    <div className="text-sm text-primary-foreground/80">Go live ready</div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {currentStep === "configuration" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">ERP Configuration</h2>
              
              <Tabs defaultValue="gl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="gl">General Ledger</TabsTrigger>
                  <TabsTrigger value="entities">Multi-Entity</TabsTrigger>
                  <TabsTrigger value="automation">Automation</TabsTrigger>
                </TabsList>

                <TabsContent value="gl" className="space-y-4">
                  <p className="text-muted-foreground">Configure your chart of accounts with custom dimensions and classifications.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "Custom account hierarchy",
                      "Multi-dimensional classifications",
                      "Unlimited custom fields",
                      "Department tracking",
                      "Project-based accounting",
                      "Location-based GL"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="entities" className="space-y-4">
                  <p className="text-muted-foreground">Manage multiple subsidiaries with automated consolidation.</p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">Auto-Eliminating Intercompany Transactions</h3>
                      <p className="text-sm text-muted-foreground">Automatically eliminate duplicate entries between entities</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold mb-2">Consolidated Reporting</h3>
                      <p className="text-sm text-muted-foreground">View consolidated financials across all entities in real-time</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="automation" className="space-y-4">
                  <p className="text-muted-foreground">Set up intelligent automation workflows powered by AI.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      "OCR document reading",
                      "Auto bank reconciliation",
                      "Smart transaction routing",
                      "Automated journal entries",
                      "Dynamic allocations",
                      "Approval workflows"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {currentStep === "team" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Team Setup</h2>
              
              <div>
                <Label htmlFor="teamSize">Number of Full-Access Users</Label>
                <Input
                  id="teamSize"
                  type="number"
                  value={setupData.teamMembers}
                  onChange={(e) => setSetupData({ ...setupData, teamMembers: parseInt(e.target.value) || 1 })}
                  min="1"
                />
                <p className="text-sm text-muted-foreground mt-2">Starting plan includes 3 full-access users + 5 business users</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold">CPA Support & Training</h3>
                  <p className="text-sm text-muted-foreground">Dedicated CPA for implementation and ongoing support</p>
                </div>
                <Checkbox
                  checked={setupData.cpaSupportNeeded}
                  onCheckedChange={(checked) => setSetupData({ ...setupData, cpaSupportNeeded: checked as boolean })}
                />
              </div>

              <Card className="p-6 border border-primary/30">
                <h3 className="font-semibold mb-4">Role-Based Access Control</h3>
                <div className="space-y-3">
                  {[
                    { role: "Admin", access: "Full system access & configuration" },
                    { role: "Accountant", access: "All financial transactions & reports" },
                    { role: "Business User", access: "View-only access to specific reports" },
                    { role: "Auditor", access: "Read-only audit trail access" }
                  ].map((role, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <div>
                        <div className="font-semibold text-sm">{role.role}</div>
                        <div className="text-xs text-muted-foreground">{role.access}</div>
                      </div>
                      <Badge variant="outline">{idx === 0 ? "Required" : "Optional"}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {currentStep === "testing" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Pre-Launch Testing</h2>
              
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Automated Testing Suite
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI-powered testing validates all integrations, workflows, and data accuracy
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { test: "Data Integrity Check", status: "Complete", time: "2 min" },
                  { test: "Integration Validation", status: "Complete", time: "5 min" },
                  { test: "Workflow Testing", status: "In Progress", time: "3 min" },
                  { test: "Security Audit", status: "Pending", time: "2 min" },
                  { test: "Performance Test", status: "Pending", time: "4 min" }
                ].map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {test.status === "Complete" ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : test.status === "In Progress" ? (
                        <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-semibold text-sm">{test.test}</div>
                        <div className="text-xs text-muted-foreground">Est. {test.time}</div>
                      </div>
                    </div>
                    <Badge variant={
                      test.status === "Complete" ? "default" :
                      test.status === "In Progress" ? "secondary" :
                      "outline"
                    }>
                      {test.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === "launch" && (
            <div className="space-y-6 text-center py-8">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mb-4">
                <Rocket className="w-12 h-12 text-primary-foreground" />
              </div>
              
              <h2 className="text-3xl font-bold">Ready to Go Live!</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your ERP system is configured and tested. Our CPA team will finalize the setup and you'll be live within 24 hours.
              </p>

              <Card className="p-6 max-w-2xl mx-auto bg-gradient-primary border-0 shadow-glow">
                <h3 className="text-xl font-semibold text-primary-foreground mb-4">What Happens Next</h3>
                <div className="space-y-3 text-left text-primary-foreground">
                  {[
                    "CPA team reviews your configuration (1-2 hours)",
                    "Final data migration and validation (4-6 hours)",
                    "Team training session scheduled (1 hour)",
                    "Go-live support available 24/7"
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5" />
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="bg-muted/50 rounded-lg p-4 max-w-2xl mx-auto">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> You won't be charged until your ERP is fully operational and you're live. 
                  Starting at $1,000/month after go-live.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>

          {currentStepIndex < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleLaunch} size="lg" variant="chrome">
              <Rocket className="mr-2" />
              Launch Implementation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ERPSetup;