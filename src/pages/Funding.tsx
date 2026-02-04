import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  BarChart3,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

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

const applicationSchema = z.object({
  business_id: z.string().min(1, "Please select a business"),
  amount_requested: z.number().min(1000, "Amount must be at least $1,000"),
  funding_type: z.string().min(1, "Please select a funding type"),
  purpose: z.string().min(10, "Please describe the purpose (at least 10 characters)")
});

const Funding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedType, setSelectedType] = useState("All Types");
  const [applications, setApplications] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FundingOption | null>(null);
  const [formData, setFormData] = useState({
    business_id: "",
    amount_requested: "",
    purpose: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [matchFormData, setMatchFormData] = useState({
    amount: "",
    purpose: "",
    urgency: "",
    revenue: "",
    creditScore: "",
    timeInBusiness: "",
    cashFlow: ""
  });

  const types = ["All Types", "Loan", "Equity", "Grant", "Factoring", "Crowdfunding", "Bridge Capital"];

  const filteredOptions = fundingOptions
    .filter(option => selectedType === "All Types" || option.type === selectedType)
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  useEffect(() => {
    if (user) {
      loadApplications();
      loadBusinesses();
    }
  }, [user]);

  const loadBusinesses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error("Error loading businesses:", error);
      toast.error("Failed to load your businesses");
    }
  };

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

  const handleApply = (option: FundingOption) => {
    if (!user) {
      toast.error("Please log in to apply");
      navigate("/auth");
      return;
    }

    if (businesses.length === 0) {
      toast.error("Please create a business entity first");
      navigate("/create-entity");
      return;
    }

    setSelectedOption(option);
    setFormData({ business_id: "", amount_requested: "", purpose: "" });
    setFormErrors({});
  };

  const handleSubmitApplication = async () => {
    if (!user || !selectedOption) return;

    setFormErrors({});
    
    try {
      const validatedData = applicationSchema.parse({
        business_id: formData.business_id,
        amount_requested: parseFloat(formData.amount_requested),
        funding_type: selectedOption.type,
        purpose: formData.purpose
      });

      setIsLoading(true);

      const applicationData = {
        user_id: user.id,
        business_id: validatedData.business_id,
        funding_type: validatedData.funding_type,
        amount_requested: validatedData.amount_requested,
        status: "under_review" as any,
        match_score: selectedOption.matchScore || null
      };

      const { error } = await supabase
        .from("funding_applications")
        .insert(applicationData as any);

      if (error) throw error;

      toast.success("Application submitted successfully! We'll review it within 24-48 hours.");
      setSelectedOption(null);
      await loadApplications();
      setActiveTab("applications");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(errors);
        toast.error("Please fix the form errors");
      } else {
        console.error("Error creating application:", error);
        toast.error("Failed to submit application");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
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
                      <Button size="sm" onClick={() => handleApply(option)}>
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
                  <Label htmlFor="match-amount">How much funding do you need?</Label>
                  <Input
                    id="match-amount"
                    placeholder="e.g., $100,000"
                    value={matchFormData.amount}
                    onChange={(e) => setMatchFormData({ ...matchFormData, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="match-purpose">What will you use the funds for?</Label>
                  <Select
                    value={matchFormData.purpose}
                    onValueChange={(value) => setMatchFormData({ ...matchFormData, purpose: value })}
                  >
                    <SelectTrigger id="match-purpose">
                      <SelectValue placeholder="Select a purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="working-capital">Working Capital</SelectItem>
                      <SelectItem value="equipment">Equipment Purchase</SelectItem>
                      <SelectItem value="expansion">Business Expansion</SelectItem>
                      <SelectItem value="inventory">Inventory</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="debt">Debt Refinancing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>How quickly do you need funding?</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {["ASAP", "1-2 weeks", "1+ month"].map((option) => (
                      <Button
                        key={option}
                        variant={matchFormData.urgency === option ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setMatchFormData({ ...matchFormData, urgency: option })}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Business metrics</Label>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <Input
                      placeholder="Annual revenue"
                      value={matchFormData.revenue}
                      onChange={(e) => setMatchFormData({ ...matchFormData, revenue: e.target.value })}
                    />
                    <Input
                      placeholder="Credit score"
                      value={matchFormData.creditScore}
                      onChange={(e) => setMatchFormData({ ...matchFormData, creditScore: e.target.value })}
                    />
                    <Input
                      placeholder="Time in business"
                      value={matchFormData.timeInBusiness}
                      onChange={(e) => setMatchFormData({ ...matchFormData, timeInBusiness: e.target.value })}
                    />
                    <Input
                      placeholder="Monthly cash flow"
                      value={matchFormData.cashFlow}
                      onChange={(e) => setMatchFormData({ ...matchFormData, cashFlow: e.target.value })}
                    />
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
            <div className="max-w-4xl mx-auto space-y-4">
              {applications.length === 0 ? (
                <Card className="p-12 text-center shadow-elevated border border-border">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by exploring funding options in the Discover tab
                  </p>
                  <Button onClick={() => setActiveTab("discover")}>
                    Browse Funding Options
                  </Button>
                </Card>
              ) : (
                applications.map((app, idx) => (
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
              ))
            )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Application Modal */}
        {selectedOption && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-border">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-chrome">
                      <selectedOption.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedOption.name}</h2>
                      <p className="text-sm text-muted-foreground">Complete your application</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedOption(null)}>
                    ✕
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="business">Select Business *</Label>
                    <Select
                      value={formData.business_id}
                      onValueChange={(value) => setFormData({ ...formData, business_id: value })}
                    >
                      <SelectTrigger id="business" className={formErrors.business_id ? "border-destructive" : ""}>
                        <SelectValue placeholder="Choose a business entity" />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses.map((biz) => (
                          <SelectItem key={biz.id} value={biz.id}>
                            {biz.name} ({biz.entity_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.business_id && (
                      <p className="text-sm text-destructive mt-1">{formErrors.business_id}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amount">Funding Amount Requested *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g., 100000"
                      value={formData.amount_requested}
                      onChange={(e) => setFormData({ ...formData, amount_requested: e.target.value })}
                      className={formErrors.amount_requested ? "border-destructive" : ""}
                    />
                    {formErrors.amount_requested && (
                      <p className="text-sm text-destructive mt-1">{formErrors.amount_requested}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Suggested range: {selectedOption.amount}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Purpose of Funding *</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Describe how you'll use the funds (e.g., equipment purchase, working capital, expansion)"
                      rows={4}
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className={formErrors.purpose ? "border-destructive" : ""}
                    />
                    {formErrors.purpose && (
                      <p className="text-sm text-destructive mt-1">{formErrors.purpose}</p>
                    )}
                  </div>

                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Funding Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Term:</span>
                        <span className="ml-2 font-semibold">{selectedOption.term}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <span className="ml-2 font-semibold">{selectedOption.rate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Approval Time:</span>
                        <span className="ml-2 font-semibold">{selectedOption.approvalTime}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Match Score:</span>
                        <span className="ml-2 font-semibold text-primary">{selectedOption.matchScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setSelectedOption(null)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleSubmitApplication}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

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