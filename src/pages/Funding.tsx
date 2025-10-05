import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Zap,
  CheckCircle2,
  Building2,
  Sparkles,
  Target,
  Award,
  CreditCard,
  Briefcase,
  Globe,
  ArrowRight,
  Clock,
  Shield,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

type FundingOption = {
  id: string;
  type: string;
  name: string;
  icon: any;
  amount: string;
  term: string;
  rate: string;
  description: string;
  requirements: string[];
  approvalTime: string;
  matchScore?: number;
};

const fundingOptions: FundingOption[] = [
  {
    id: "sba-loan",
    type: "Loan",
    name: "SBA 7(a) Loan",
    icon: Building2,
    amount: "$50K - $5M",
    term: "10-25 years",
    rate: "8.5% - 11%",
    description: "Government-backed loans for working capital, equipment, and real estate",
    requirements: ["Credit score 680+", "2+ years in business", "Profitable last year"],
    approvalTime: "45-90 days",
    matchScore: 92
  },
  {
    id: "equipment",
    type: "Loan",
    name: "Equipment Financing",
    icon: Briefcase,
    amount: "$10K - $2M",
    term: "2-7 years",
    rate: "6% - 12%",
    description: "Finance equipment purchases with the equipment as collateral",
    requirements: ["Credit score 600+", "6+ months in business"],
    approvalTime: "3-7 days",
    matchScore: 88
  },
  {
    id: "invoice",
    type: "Factoring",
    name: "Invoice Factoring",
    icon: FileText,
    amount: "$10K - $500K",
    term: "30-90 days",
    rate: "1-5% per month",
    description: "Get immediate cash for outstanding invoices",
    requirements: ["B2B invoices", "Creditworthy customers"],
    approvalTime: "1-3 days",
    matchScore: 75
  },
  {
    id: "angel",
    type: "Equity",
    name: "Angel Investors",
    icon: Users,
    amount: "$25K - $500K",
    term: "Equity stake",
    rate: "15-25% equity",
    description: "Individual investors providing capital for equity ownership",
    requirements: ["Scalable business model", "Strong team", "Clear exit strategy"],
    approvalTime: "30-60 days",
    matchScore: 68
  },
  {
    id: "vc",
    type: "Equity",
    name: "Venture Capital",
    icon: TrendingUp,
    amount: "$500K - $10M+",
    term: "Equity stake",
    rate: "20-40% equity",
    description: "Professional investors for high-growth startups",
    requirements: ["Proven traction", "Large market", "Experienced team"],
    approvalTime: "60-120 days",
    matchScore: 45
  },
  {
    id: "grant",
    type: "Grant",
    name: "SBIR/STTR Grants",
    icon: Award,
    amount: "$50K - $1M",
    term: "No repayment",
    rate: "0% (grant)",
    description: "Federal grants for research and development",
    requirements: ["R&D focus", "US-based", "< 500 employees"],
    approvalTime: "90-180 days",
    matchScore: 82
  },
  {
    id: "crowdfunding",
    type: "Crowdfunding",
    name: "Equity Crowdfunding",
    icon: Globe,
    amount: "$10K - $5M",
    term: "Equity stake",
    rate: "5-20% equity",
    description: "Raise capital from a large number of small investors",
    requirements: ["Compelling story", "Strong marketing", "SEC compliance"],
    approvalTime: "30-90 days",
    matchScore: 71
  },
  {
    id: "bridge",
    type: "Bridge Capital",
    name: "Bridge Loan",
    icon: Zap,
    amount: "$50K - $2M",
    term: "6-12 months",
    rate: "10-15%",
    description: "Short-term financing until long-term funding is secured",
    requirements: ["Clear exit strategy", "Collateral or revenue"],
    approvalTime: "7-14 days",
    matchScore: 79
  }
];

const Funding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedType, setSelectedType] = useState("All Types");
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingPurpose, setFundingPurpose] = useState("");
  const [applicationStep, setApplicationStep] = useState(0);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const types = ["All Types", "Loan", "Equity", "Grant", "Factoring", "Crowdfunding", "Bridge Capital"];

  const filteredOptions = fundingOptions
    .filter(option => selectedType === "All Types" || option.type === selectedType)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("funding_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error loading applications:", error);
    }
  };

  const handleApply = async (optionId: string) => {
    if (!user) {
      toast.error("Please log in to apply");
      return;
    }

    setIsLoading(true);
    
    try {
      const option = fundingOptions.find(o => o.id === optionId);
      if (!option) return;

      const { error } = await supabase
        .from("funding_applications")
        .insert({
          user_id: user.id,
          funding_type: option.type,
          amount_requested: parseFloat(option.amount.split("-")[0].replace(/[$K,M]/g, "")) * 1000,
          status: "draft",
          match_score: option.matchScore || null
        });

      if (error) throw error;

      toast.success("Application started! Our team will reach out within 24 hours.");
      await loadApplications();
      setActiveTab("applications");
    } catch (error) {
      console.error("Error creating application:", error);
      toast.error("Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-lg font-bold">Funding Hub</h1>
                  <p className="text-xs text-muted-foreground">Access capital for growth</p>
                </div>
              </div>
            </div>
            
            <Badge variant="outline" className="border-primary text-primary">
              <Shield className="w-3 h-3 mr-1" />
              Pre-qualified
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-chrome to-foreground bg-clip-text text-transparent">
            Find the Perfect Funding
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            AI-matched funding options tailored to your business needs
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: DollarSign, label: "Total Available", value: "$25M+", color: "text-green-500" },
              { icon: Users, label: "Active Investors", value: "450+", color: "text-blue-500" },
              { icon: CheckCircle2, label: "Funded Businesses", value: "1,200+", color: "text-purple-500" },
              { icon: Clock, label: "Avg. Approval", value: "7 days", color: "text-orange-500" }
            ].map((stat, idx) => (
              <Card key={idx} className="p-4 shadow-elevated border border-border">
                <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="discover">Discover Funding</TabsTrigger>
            <TabsTrigger value="match">AI Match</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6 mt-8">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <select
                className="h-10 px-4 rounded-md border border-input bg-background text-sm flex-1 max-w-xs"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Funding Options Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredOptions.map((option) => {
                const Icon = option.icon;
                
                return (
                  <Card key={option.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-chrome">
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{option.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">{option.type}</Badge>
                        </div>
                      </div>
                      {option.matchScore && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{option.matchScore}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{option.description}</p>

                    <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Amount</div>
                        <div className="font-semibold">{option.amount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Term</div>
                        <div className="font-semibold">{option.term}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Rate</div>
                        <div className="font-semibold">{option.rate}</div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-semibold text-muted-foreground">Requirements:</div>
                      {option.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-sm">
                        <Clock className="w-4 h-4 inline mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">{option.approvalTime}</span>
                      </div>
                      <Button size="sm" onClick={() => handleApply(option.id)} disabled={isLoading}>
                        Apply Now
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="match" className="space-y-6 mt-8">
            <Card className="p-8 shadow-elevated border border-border max-w-3xl mx-auto">
              <div className="flex items-start gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    Answer a few questions and our AI will find the best funding options for your business
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="amount">How much funding do you need?</Label>
                  <Input
                    id="amount"
                    placeholder="e.g., $100,000"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="purpose">What will you use the funds for?</Label>
                  <select
                    id="purpose"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={fundingPurpose}
                    onChange={(e) => setFundingPurpose(e.target.value)}
                  >
                    <option value="">Select a purpose</option>
                    <option value="working-capital">Working Capital</option>
                    <option value="equipment">Equipment Purchase</option>
                    <option value="expansion">Business Expansion</option>
                    <option value="inventory">Inventory</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="debt">Debt Refinancing</option>
                  </select>
                </div>

                <div>
                  <Label>How quickly do you need funding?</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {["ASAP", "1-2 weeks", "1+ month"].map((option) => (
                      <Button key={option} variant="outline" className="w-full">
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Business metrics</Label>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <Input placeholder="Annual revenue" />
                    <Input placeholder="Credit score" />
                    <Input placeholder="Time in business" />
                    <Input placeholder="Monthly cash flow" />
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={() => setActiveTab("discover")}>
                  <Target className="w-5 h-5 mr-2" />
                  Find My Matches
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6 mt-8">
            <div className="max-w-4xl mx-auto">
              {applications.length > 0 ? applications.map((app, idx) => (
                <Card key={idx} className="p-6 shadow-elevated border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{app.funding_type}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>${app.amount_requested?.toLocaleString()}</span>
                        <span>•</span>
                        <span>Submitted {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge variant={
                      app.status === "approved" ? "default" :
                      app.status === "under_review" ? "secondary" :
                      "outline"
                    }>
                      {app.status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-muted-foreground">Application Progress</span>
                      <span className="font-semibold">{app.match_score || 0}%</span>
                    </div>
                    <Progress value={app.match_score || 0} />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {app.status === "pending_documents" && (
                      <Button size="sm">
                        Upload Documents
                      </Button>
                    )}
                  </div>
                </Card>
              )) : null}

              {/* Empty State */}
              {applications.length === 0 && (
                <Card className="p-12 text-center shadow-elevated border-2 border-dashed border-border">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">Start by exploring funding options</p>
                  <Button onClick={() => setActiveTab("discover")}>
                    Browse Funding Options
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="p-8 mt-12 bg-gradient-primary border-0 shadow-glow">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-primary-foreground">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Need Expert Guidance?</h3>
              <p className="text-primary-foreground/80 mb-4">
                Talk to our Biz AI agent for personalized funding recommendations and application support
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Funding strategy consultation",
                  "Application assistance",
                  "Document preparation help",
                  "Investor pitch coaching"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")}>
              <Sparkles className="w-5 h-5 mr-2" />
              Talk to Biz AI
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Funding;