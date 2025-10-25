import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Cpu, 
  DollarSign, 
  Home, 
  Leaf, 
  BarChart3, 
  Building2,
  Globe,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight
} from "lucide-react";

export default function XBuilderx() {
  const navigate = useNavigate();

  const modules = [
    {
      icon: Search,
      title: "Automated Discovery",
      description: "AI monitors 50,000+ global data sources with 94% accuracy",
      metrics: "15-min detection • 127 countries",
      color: "text-primary"
    },
    {
      icon: Cpu,
      title: "Engineering & Design",
      description: "Digital twin architecture with parametric design optimization",
      metrics: "47% cost reduction • 89% faster cycles",
      color: "text-primary"
    },
    {
      icon: DollarSign,
      title: "Quantum Financial System",
      description: "XODIAK-powered quantum-resistant settlement platform",
      metrics: "1M+ TPS • Sub-3-second global settlement",
      color: "text-primary"
    },
    {
      icon: Home,
      title: "Affordable Housing",
      description: "Solutions for 1.6B+ people with community-centered development",
      metrics: "89% educational improvement impact",
      color: "text-primary"
    },
    {
      icon: Leaf,
      title: "ESG Solutions",
      description: "EnWaTel framework with carbon-negative construction",
      metrics: "73% carbon reduction • 100% renewable",
      color: "text-primary"
    },
    {
      icon: BarChart3,
      title: "Business Intelligence",
      description: "Advanced analytics with 99.3% prediction accuracy",
      metrics: "$247M data monetization potential",
      color: "text-primary"
    },
    {
      icon: Building2,
      title: "Asset Management",
      description: "SmartLink suite with 94.3% occupancy optimization",
      metrics: "18% revenue increase • IoT-enabled",
      color: "text-primary"
    }
  ];

  const stats = [
    { value: "$57T", label: "Target Market" },
    { value: "127", label: "Countries" },
    { value: "2.4M+", label: "People Impacted" },
    { value: "94%", label: "Accuracy Rate" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="text-lg px-6 py-2">
              xBUILDERx
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Build What Humanity Needs Next
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Global Infrastructure Orchestration Platform for Institutional Investors, 
              Sovereign Wealth Funds, and Governments
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/xodiak")}>
                Access Platform
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="text-4xl md:text-5xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules */}
      <section className="py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">
                Comprehensive Platform Modules
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                End-to-end infrastructure lifecycle management with institutional-grade precision
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card key={module.title} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg bg-muted ${module.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{module.title}</h3>
                        <p className="text-muted-foreground">{module.description}</p>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-sm font-medium text-primary">{module.metrics}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="py-24 border-b border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">
                Institutional-Grade Infrastructure
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Purpose-built for sovereign wealth funds and global institutional investors
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 text-center space-y-4">
                <Globe className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-2xl font-bold">Global Coverage</h3>
                <p className="text-muted-foreground">
                  127 countries with automated regulatory compliance and cross-border settlement
                </p>
              </Card>

              <Card className="p-8 text-center space-y-4">
                <Shield className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-2xl font-bold">Quantum-Resistant</h3>
                <p className="text-muted-foreground">
                  Future-proof security designed for the post-quantum computing era
                </p>
              </Card>

              <Card className="p-8 text-center space-y-4">
                <Zap className="h-12 w-12 mx-auto text-primary" />
                <h3 className="text-2xl font-bold">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Sub-3-second global transactions with 1M+ TPS capacity
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-24 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <Badge variant="outline" className="text-lg px-6 py-2">
                  <TrendingUp className="mr-2 h-4 w-4 inline" />
                  Market Opportunity
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold">
                  Addressing the $57 Trillion Infrastructure Gap
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Global Challenges</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>$57T global infrastructure investment shortfall</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>1.6B people lacking adequate housing</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>Critical climate adaptation requirements</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>Sustainable development imperatives</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">xBUILDERx Solutions</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>AI-powered opportunity discovery and optimization</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>Community-centered affordable housing solutions</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>Carbon-negative construction methodologies</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>Integrated ESG measurement and reporting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Global Infrastructure?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join sovereign wealth funds, institutional investors, and governments building the future
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/xodiak")}>
                Access Platform
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Schedule Consultation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
