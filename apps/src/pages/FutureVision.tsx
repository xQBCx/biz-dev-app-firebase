import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  Globe2, 
  Zap, 
  Shield, 
  Users, 
  Building2, 
  Sparkles, 
  Star,
  ArrowRight,
  Eye,
  Target,
  Lightbulb,
  Atom,
  Orbit,
  Rocket,
  Network,
  Database,
  BrainCircuit,
  Binary,
  CircuitBoard
} from "lucide-react";

const FutureVision = () => {
  const visionPillars = [
    {
      icon: BrainCircuit,
      title: "Advanced Technology",
      description: "Modern systems optimizing property performance with smart automation",
      features: ["Intelligent task management", "Performance analytics", "Automated workflows", "Data-driven insights"],
      gradient: "from-cyan-400 via-blue-500 to-purple-600"
    },
    {
      icon: Globe2,
      title: "Strategic Growth",
      description: "Expanding operations to new markets with proven operational standards",
      features: ["Market expansion planning", "Regional partnerships", "Scalable systems", "Local expertise"],
      gradient: "from-emerald-400 via-teal-500 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Operational Speed",
      description: "Fast response and efficient automation across operational touchpoints",
      features: ["Real-time updates", "Streamlined workflows", "Quick notifications", "Instant sync"],
      gradient: "from-yellow-400 via-orange-500 to-red-600"
    },
    {
      icon: Shield,
      title: "Platform Security",
      description: "Modern security protocols protecting data and user privacy",
      features: ["Secure authentication", "Role-based access", "Data encryption", "Audit logging"],
      gradient: "from-violet-400 via-purple-500 to-pink-600"
    }
  ];

  const timeline = [
    {
      year: "2025",
      quarter: "Q1-Q2",
      title: "International Launch",
      items: [
        "Launch in London, UK",
        "Establish European headquarters",
        "Partner with local property experts"
      ]
    },
    {
      year: "2025",
      quarter: "Q3-Q4", 
      title: "AI Integration",
      items: [
        "Deploy predictive analytics platform",
        "Launch smart maintenance system",
        "Implement automated pricing optimization"
      ]
    },
    {
      year: "2026",
      quarter: "Q1-Q2",
      title: "Technology Revolution",
      items: [
        "Release SmartLink OS 3.0",
        "Launch mobile-first platform",
        "Deploy IoT sensor networks"
      ]
    },
    {
      year: "2026",
      quarter: "Q3-Q4",
      title: "Market Expansion",
      items: [
        "Enter new regional markets",
        "Expand platform capabilities",
        "Open innovation centers"
      ]
    },
    {
      year: "2027",
      quarter: "Q1-Q4",
      title: "Platform Maturity",
      items: [
        "Scale operational infrastructure",
        "Launch advanced partnership programs",
        "Establish SmartLink Academy expansion"
      ]
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section with Professional Design */}
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        {/* Subtle Professional Background Elements */}
        <div className="absolute inset-0">
          {/* Minimal geometric shapes */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-100/30 to-blue-100/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-full blur-3xl"></div>
          
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
          
          {/* Minimal floating icons */}
          <div className="absolute top-32 left-1/4 opacity-10">
            <CircuitBoard className="w-8 h-8 text-blue-600" />
          </div>
          <div className="absolute bottom-32 right-1/4 opacity-10">
            <Network className="w-10 h-10 text-purple-600" />
          </div>
          <div className="absolute top-1/2 right-20 opacity-10">
            <Atom className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Professional Trust Badge */}
            <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full px-6 py-3 mb-8 border border-slate-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Future Vision 2030</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-slate-900 leading-tight">
              The Future of{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Property Management
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Building tomorrow's hospitality platform through modern technology, 
              strategic growth, and operational excellence powered by unified teams.
            </p>

            {/* Professional Achievement Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="bg-blue-50 border border-blue-200 rounded-full px-6 py-3 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Rapid Growth</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-full px-6 py-3 flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800 font-semibold">Expansion Ready</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-full px-6 py-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-slate-600" />
                <span className="text-slate-800 font-semibold">Tech-Driven</span>
              </div>
            </div>
            
            {/* Professional Future Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">Reliable</div>
                <p className="text-slate-600 font-medium">System Performance</p>
                <p className="text-sm text-slate-500 mt-2">Built for stability</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Cpu className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">Fast</div>
                <p className="text-slate-600 font-medium">Response Time</p>
                <p className="text-sm text-slate-500 mt-2">Real-time processing</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-slate-900 mb-2">Growing</div>
                <p className="text-slate-600 font-medium">Expanding Reach</p>
                <p className="text-sm text-slate-500 mt-2">Scaling operations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Statement with Professional Design */}
      <section className="section-padding bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-5xl mx-auto text-center mb-16">
            <div className="relative mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Our Vision for Tomorrow
              </h2>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
              </div>
            </div>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed">
              SmartLink is building a next-generation platform for hospitality operations, 
              powered by teams unified around <span className="text-blue-600 font-semibold">One Mission</span> - 
              making property management transparent, efficient, and performance-driven.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-white border border-blue-200 shadow-lg hover:shadow-xl group hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                      <Eye className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-blue-600">Vision</h3>
                  <p className="text-slate-600">Property management excellence through technology and unified operational approach</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-purple-200 shadow-lg hover:shadow-xl group hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full animate-pulse delay-200"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-purple-600">Mission</h3>
                  <p className="text-slate-600">Transform property operations with software built by operators and refined through field use</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-blue-200 shadow-lg hover:shadow-xl group hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300">
                      <Lightbulb className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-pulse delay-400"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-blue-600">Innovation</h3>
                  <p className="text-slate-600">Continuous platform improvement and market growth through proven operational methods</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Vision Pillars - Professional White Design */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Four Pillars of Our Future
            </h2>
            <p className="text-xl text-slate-600">
              Core strategic directions driving platform evolution and market expansion
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {visionPillars.map((pillar, index) => {
              const IconComponent = pillar.icon;
              return (
                <Card key={index} className="bg-white border border-slate-200 shadow-lg hover:shadow-2xl group hover:scale-105 transition-all duration-500">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                          {pillar.title}
                        </h3>
                        <p className="text-slate-600 mb-6 leading-relaxed">{pillar.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pillar.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                              <span className="text-slate-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Roadmap */}
      {/* Cosmic Rocket Timeline Section */}
      <section className="section-padding bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 relative overflow-hidden">
        {/* Space Background Effects */}
        <div className="absolute inset-0">
          {/* Colorful Cosmic Orbs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Flying Rockets */}
          <div className="absolute top-32 left-20 opacity-30">
            <Rocket className="w-12 h-12 text-yellow-400 animate-bounce" style={{animationDuration: '3s'}} />
          </div>
          <div className="absolute bottom-40 right-32 opacity-20">
            <Rocket className="w-8 h-8 text-red-400 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}} />
          </div>
          <div className="absolute top-1/2 right-1/4 opacity-25">
            <Rocket className="w-10 h-10 text-green-400 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}} />
          </div>
          
          {/* Colorful Stars */}
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse ${
                i % 5 === 0 ? 'w-2 h-2 bg-yellow-400' :
                i % 5 === 1 ? 'w-1 h-1 bg-red-400' :
                i % 5 === 2 ? 'w-1.5 h-1.5 bg-green-400' :
                i % 5 === 3 ? 'w-1 h-1 bg-blue-400' :
                'w-1 h-1 bg-white'
              }`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-4 mb-6">
              <Rocket className="w-12 h-12 text-yellow-400 animate-bounce" />
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-blue-500 bg-clip-text text-transparent">
                Rocket Launch Roadmap
              </h2>
              <Rocket className="w-12 h-12 text-red-400 animate-bounce delay-500" />
            </div>
            <p className="text-xl text-blue-200">
              Our explosive journey to dominate the global property management universe
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              {timeline.map((period, index) => {
                const colors = [
                  { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30', rocket: 'text-yellow-400', badge: 'from-yellow-500 to-orange-500' },
                  { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30', rocket: 'text-red-400', badge: 'from-red-500 to-pink-500' },
                  { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', rocket: 'text-blue-400', badge: 'from-blue-500 to-cyan-500' },
                  { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', rocket: 'text-green-400', badge: 'from-green-500 to-emerald-500' },
                  { bg: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/30', rocket: 'text-purple-400', badge: 'from-purple-500 to-violet-500' }
                ];
                const colorTheme = colors[index % colors.length];
                
                return (
                  <Card key={index} className={`bg-white/5 backdrop-blur-md border ${colorTheme.border} group hover:scale-105 transition-all duration-500 hover:shadow-2xl overflow-hidden relative`}>
                    {/* Rocket Blast Trail Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${colorTheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    <CardContent className="p-8 relative z-10">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                        <div className="lg:w-1/4 relative">
                          {/* Rocket Launch Effect */}
                          <div className="relative">
                            <div className="absolute -top-4 -left-4">
                              <Rocket className={`w-16 h-16 ${colorTheme.rocket} group-hover:animate-bounce transition-all duration-300`} />
                              {/* Blast effects */}
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-gradient-to-t from-orange-400 via-red-400 to-yellow-300 opacity-60 rounded-full blur-sm animate-pulse group-hover:opacity-100"></div>
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-8 bg-gradient-to-t from-blue-400 to-white opacity-40 rounded-full blur-sm animate-pulse group-hover:opacity-80" style={{animationDelay: '0.3s'}}></div>
                            </div>
                            
                            <div className="text-center lg:text-left ml-12">
                              <Badge className={`bg-gradient-to-r ${colorTheme.badge} text-white text-lg px-6 py-3 mb-3 shadow-lg`}>
                                {period.year}
                              </Badge>
                              <p className="text-sm text-blue-200 mb-2">{period.quarter}</p>
                              <h3 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                                {period.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                        <div className="lg:w-3/4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {period.items.map((item, idx) => {
                              const itemColors = [
                                'bg-yellow-500/10 border-yellow-400/20 text-yellow-100',
                                'bg-red-500/10 border-red-400/20 text-red-100', 
                                'bg-green-500/10 border-green-400/20 text-green-100'
                              ];
                              return (
                                <div key={idx} className={`${itemColors[idx % itemColors.length]} border rounded-lg p-4 group-hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4" />
                                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                  </div>
                                  <p className="text-sm font-medium">{item}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="section-padding bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              Join Us in Shaping the Future
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Partner with SmartLink today and be part of the property management revolution. 
              Together, we'll build tomorrow's real estate landscape.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group">
                Partner With Us
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-white/30 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FutureVision;