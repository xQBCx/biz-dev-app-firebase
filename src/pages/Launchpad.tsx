import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  Rocket, 
  Check, 
  Globe, 
  Store,
  MapPin,
  Users,
  Video,
  MessageSquare,
  Star,
  TrendingUp,
  Zap,
  ArrowLeft,
  CreditCard,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

type Platform = {
  id: string;
  name: string;
  icon: any;
  category: string;
  monthlyVisitors: string;
};

const platforms: Platform[] = [
  { id: "google", name: "Google Business", icon: Globe, category: "Search", monthlyVisitors: "5.6B" },
  { id: "facebook", name: "Facebook Business", icon: Users, category: "Social", monthlyVisitors: "2.9B" },
  { id: "instagram", name: "Instagram Business", icon: MessageSquare, category: "Social", monthlyVisitors: "2B" },
  { id: "linkedin", name: "LinkedIn Company", icon: Users, category: "Professional", monthlyVisitors: "1B" },
  { id: "yelp", name: "Yelp Business", icon: Star, category: "Reviews", monthlyVisitors: "178M" },
  { id: "apple", name: "Apple Maps", icon: MapPin, category: "Maps", monthlyVisitors: "500M" },
  { id: "youtube", name: "YouTube Channel", icon: Video, category: "Video", monthlyVisitors: "2.5B" },
  { id: "twitter", name: "X (Twitter) Business", icon: MessageSquare, category: "Social", monthlyVisitors: "550M" },
  { id: "tiktok", name: "TikTok Business", icon: Video, category: "Social", monthlyVisitors: "1.2B" },
  { id: "pinterest", name: "Pinterest Business", icon: Store, category: "Visual", monthlyVisitors: "450M" },
  { id: "bing", name: "Bing Places", icon: MapPin, category: "Search", monthlyVisitors: "1B" },
  { id: "tripadvisor", name: "TripAdvisor", icon: Star, category: "Reviews", monthlyVisitors: "463M" }
];

const Launchpad = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"select" | "payment" | "processing" | "complete">("select");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    platforms.map(p => p.id)
  );
  const [progress, setProgress] = useState(0);

  const handleTogglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPlatforms(platforms.map(p => p.id));
  };

  const handleActivate = () => {
    setStep("payment");
  };

  const handlePayment = () => {
    setStep("processing");
    
    // Simulate profile creation progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep("complete"), 500);
      }
    }, 200);
  };

  const totalReach = selectedPlatforms.reduce((acc, id) => {
    const platform = platforms.find(p => p.id === id);
    if (!platform) return acc;
    const visitors = parseFloat(platform.monthlyVisitors.replace(/[BM]/g, ''));
    const multiplier = platform.monthlyVisitors.includes('B') ? 1000 : 1;
    return acc + (visitors * multiplier);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-depth">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge variant="outline" className="text-primary border-primary">
              {selectedPlatforms.length} platforms selected
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {step === "select" && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary shadow-glow mb-6">
                <Rocket className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-chrome to-foreground bg-clip-text text-transparent">
                Biz Dev Launchpad
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Create your business presence across 60+ platforms in minutes
              </p>
              
              <Card className="p-6 bg-gradient-primary border-0 shadow-glow">
                <div className="grid md:grid-cols-3 gap-6 text-primary-foreground">
                  <div>
                    <div className="text-3xl font-bold mb-1">{totalReach.toFixed(1)}B+</div>
                    <div className="text-sm text-primary-foreground/80">Monthly Reach</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">{selectedPlatforms.length}</div>
                    <div className="text-sm text-primary-foreground/80">Platforms</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold mb-1">$5</div>
                    <div className="text-sm text-primary-foreground/80">One-time Fee</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Platform Selection */}
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Select Platforms</h2>
                <Button variant="outline" onClick={handleSelectAll}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Select All
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedPlatforms.includes(platform.id);
                  
                  return (
                    <Card
                      key={platform.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-glow ${
                        isSelected ? "border-2 border-primary bg-primary/5" : "border border-border"
                      }`}
                      onClick={() => handleTogglePlatform(platform.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-5 h-5 text-primary shrink-0" />
                            <h3 className="font-semibold text-sm truncate">{platform.name}</h3>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {platform.category}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {platform.monthlyVisitors}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* CTA */}
              <Card className="p-8 bg-card border-2 border-primary/30 shadow-elevated">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Ready to Launch Your Presence?
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedPlatforms.length} platforms • {totalReach.toFixed(1)}B+ monthly reach
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Automated profile creation
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Unified content management
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        Cross-platform analytics
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">$5</div>
                    <Button size="lg" variant="chrome" onClick={handleActivate}>
                      <Zap className="w-5 h-5 mr-2" />
                      Activate Now
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}

        {step === "payment" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 shadow-elevated border border-border">
              <div className="text-center mb-8">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold mb-2">Complete Your Purchase</h2>
                <p className="text-muted-foreground">One-time payment of $5</p>
              </div>

              <div className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Launchpad Activation</span>
                      <span className="font-semibold">$5.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platforms</span>
                      <span className="font-semibold">{selectedPlatforms.length}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary">$5.00</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Card Number</label>
                    <Input placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Expiry</label>
                      <Input placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">CVC</label>
                      <Input placeholder="123" />
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handlePayment}>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay $5.00
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Your payment is secure and encrypted. By proceeding, you agree to our Terms of Service.
                </p>
              </div>
            </Card>
          </div>
        )}

        {step === "processing" && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 shadow-elevated border border-border text-center">
              <div className="w-24 h-24 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-primary rounded-full shadow-glow">
                  <Rocket className="w-12 h-12 text-primary-foreground animate-bounce" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Creating Your Profiles...</h2>
              <p className="text-muted-foreground mb-8">
                Setting up your presence across {selectedPlatforms.length} platforms
              </p>

              <Progress value={progress} className="mb-6" />
              <p className="text-sm text-muted-foreground mb-8">{progress}% Complete</p>

              <ScrollArea className="h-40 bg-muted/50 rounded-lg p-4">
                <div className="space-y-2 text-sm text-left">
                  {platforms.slice(0, Math.floor((progress / 100) * platforms.length)).map((platform) => (
                    <div key={platform.id} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{platform.name} profile created</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}

        {step === "complete" && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <Check className="w-12 h-12 text-primary-foreground" />
            </div>
            
            <h2 className="text-4xl font-bold mb-4">You're Live! 🎉</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Your business is now visible across {selectedPlatforms.length} platforms
            </p>

            <Card className="p-8 bg-gradient-primary border-0 shadow-glow mb-8">
              <div className="grid grid-cols-3 gap-6 text-primary-foreground">
                <div>
                  <div className="text-3xl font-bold mb-1">{selectedPlatforms.length}</div>
                  <div className="text-sm text-primary-foreground/80">Platforms Live</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">{totalReach.toFixed(1)}B+</div>
                  <div className="text-sm text-primary-foreground/80">Potential Reach</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-primary-foreground/80">Visibility</div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="chrome" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => setStep("select")}>
                Manage Platforms
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Launchpad;