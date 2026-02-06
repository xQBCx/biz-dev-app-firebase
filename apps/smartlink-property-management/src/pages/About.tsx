import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Building, Monitor, TrendingUp, Award, Sparkles, ArrowRight, Users, CheckCircle, Shield, Target, Zap, Heart } from "lucide-react";
const About = () => {
  return <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-32 sm:-translate-y-40 lg:-translate-y-48 translate-x-32 sm:translate-x-40 lg:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 lg:w-80 h-48 sm:h-64 lg:h-80 bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl translate-y-24 sm:translate-y-32 -translate-x-24 sm:-translate-x-32"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">About SmartLink</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-slate-900 leading-tight">
              Built by Operators,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">for Operators</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              We know the early mornings, the unexpected challenges, and the dedication it takes to deliver exceptional guest experiences. That's why we built SmartLink.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link to="/smartlink-os">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-h-[48px]">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 lg:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm border-primary/20 text-primary">
              Our Approach
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              How We Work
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2 sm:px-0">
              A structured process designed to deliver measurable results from day one.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3 lg:gap-12">
              {[{
              step: "01",
              title: "Strategic Assessment",
              description: "Comprehensive property evaluation identifying operational gaps and opportunities based on real-world hotel experience.",
              icon: Target
            }, {
              step: "02",
              title: "Technology Integration",
              description: "SmartLink OS implementation with customized configurations, performance tracking, and team accountability tools.",
              icon: Zap
            }, {
              step: "03",
              title: "Operational Excellence",
              description: "Ongoing support with structured procedures, continuous refinement, and hospitality-focused execution.",
              icon: Award
            }].map((item, index) => <div key={index} className="text-center px-2 sm:px-0">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary text-primary-foreground mb-4 sm:mb-6">
                    <item.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-primary mb-1.5 sm:mb-2">{item.step}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.description}</p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 lg:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm border-primary/20 text-primary">
              What Drives Us
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2 sm:px-0">
              The principles that guide every decision and interaction.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
            {[{
            icon: Monitor,
            title: "Transparency",
            description: "Direct access to operational data. No filters, no spin just clear visibility.",
            color: "from-blue-500 to-cyan-500"
          }, {
            icon: Award,
            title: "Excellence",
            description: "Commitment to doing things right and improving systems based on field feedback.",
            color: "from-purple-500 to-pink-500"
          }, {
            icon: Sparkles,
            title: "Innovation",
            description: "Using modern technology to solve real operational problems we've experienced firsthand.",
            color: "from-green-500 to-emerald-500"
          }, {
            icon: Shield,
            title: "Reliability",
            description: "Consistent systems and processes delivering dependable, predictable results.",
            color: "from-orange-500 to-red-500"
          }].map((value, index) => <Card key={index} className="group border-0 bg-muted/50 hover:bg-muted/80 transition-all duration-300">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${value.color} rounded-lg sm:rounded-xl mx-auto mb-3 sm:mb-5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                    <value.icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">{value.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">{value.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 lg:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm border-primary/20 text-primary">
              Why SmartLink
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              What Sets Us Apart
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2 sm:px-0">
              Built different. Run different. Results different.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 max-w-6xl mx-auto">
            {[{
            icon: Users,
            title: "Operator-Built Platform",
            description: "Created by people who run hotels daily. Every feature solves a real problem we encountered in actual operations.",
            features: ["Designed by frontline operators", "Field-tested in live properties", "Refined through daily use"]
          }, {
            icon: Monitor,
            title: "Modern Technology",
            description: "SmartLink OS provides real-time visibility into operations with tools designed for speed and clarity.",
            features: ["Real-time performance dashboards", "Predictive maintenance alerts", "Automated reporting systems"]
          }, {
            icon: Heart,
            title: "Hospitality Excellence",
            description: "Every interaction reflects our commitment to world-class service, from tenant relations to owner communications.",
            features: ["24/7 concierge-level support", "Proactive communication", "Guest experience optimization"]
          }].map((item, index) => <Card key={index} className="bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-5">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-5 leading-relaxed">{item.description}</p>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {item.features.map((feature, i) => <li key={i} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>)}
                  </ul>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Company Journey Timeline */}
      <section className="py-12 sm:py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 lg:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm border-primary/20 text-primary">
              Our Story
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Our Journey to Excellence
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2 sm:px-0">
              Building a modern hospitality platform through field-tested operations and continuous refinement.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line - visible on all sizes */}
              <div className="absolute left-5 sm:left-8 w-0.5 h-full bg-gradient-to-b from-primary via-purple-500 to-primary opacity-40"></div>
              
              <div className="space-y-4 sm:space-y-8">
                {[{
                year: "2024",
                title: "Company Launch",
                event: "SmartLink founded by hospitality operators - One Team, One Mission",
                details: "Built from the ground up by professionals who manage hotels daily, not Silicon Valley outsiders",
                icon: Rocket,
                isRocket: true
              }, {
                year: "2024",
                title: "First Properties Live",
                event: "Onboarded initial portfolio with full operational oversight",
                details: "Deployed our management framework across multiple property types, refining processes in real environments",
                icon: Building
              }, {
                year: "2025",
                title: "SmartLink OS Development",
                event: "Internal operations platform built for frontline teams",
                details: "Created purpose-built tools for housekeeping, maintenance, and front desk coordination",
                icon: Monitor
              }, {
                year: "2026",
                title: "Market Expansion",
                event: "Scaling operations into new regions with proven playbook",
                details: "Replicating success across diverse markets while adapting to local requirements",
                icon: TrendingUp
              }, {
                year: "2027",
                title: "Industry Recognition",
                event: "Established track record of measurable performance gains",
                details: "Documented results in staff retention, guest scores, and operational efficiency",
                icon: Award
              }].map((milestone, index) => {
                const IconComponent = milestone.icon;
                return <div key={index} className="flex items-start gap-3 sm:gap-6">
                      {/* Timeline Node - visible on all sizes */}
                      <div className="flex-shrink-0 relative z-20">
                        {/* Rocket Blast Effects - hidden on mobile for cleaner look */}
                        {milestone.isRocket && <div className="hidden sm:block">
                            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-400 via-red-400 to-yellow-300 opacity-80 rounded-full blur-sm animate-pulse"></div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-6 bg-gradient-to-t from-blue-400 to-white opacity-60 rounded-full blur-sm animate-pulse" style={{
                        animationDelay: '0.5s'
                      }}></div>
                          </div>}
                        
                        <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative z-10 shadow-xl sm:shadow-2xl -translate-y-1 sm:-translate-y-2
                          ${milestone.isRocket ? 'bg-gradient-to-br from-orange-400 via-red-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600'}
                          before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/30 before:via-white/10 before:to-transparent before:shadow-inner
                          after:absolute after:top-1 after:left-1 after:w-3 sm:after:w-6 after:h-3 sm:after:h-6 after:bg-white/40 after:rounded-full after:blur-md
                          hover:scale-110 transition-all duration-300
                        `}>
                          <IconComponent className={`w-4 h-4 sm:w-8 sm:h-8 text-white relative z-10 drop-shadow-lg ${milestone.isRocket ? 'sm:animate-bounce' : ''}`} />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-2 sm:pb-8 min-w-0">
                        <Card className="bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-3 sm:p-6">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-3">
                              <Badge className={`text-white font-bold text-[10px] sm:text-sm px-2 py-0.5 sm:px-2.5 sm:py-1 ${milestone.isRocket ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-primary'}`}>
                                {milestone.year}
                              </Badge>
                              <h3 className="text-xs sm:text-lg font-bold text-primary">{milestone.title}</h3>
                            </div>
                            <p className="text-xs sm:text-base font-medium mb-1 sm:mb-2">
                              {milestone.isRocket ? <>
                                  <span className="block sm:inline">SmartLink founded -</span>
                                  <span className="text-sm sm:text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent sm:ml-2 block sm:inline">
                                    One Team, One Mission
                                  </span>
                                </> : milestone.event}
                            </p>
                            <p className="text-[10px] sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">{milestone.details}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>;
              })}
              </div>
              
              {/* Future Vision */}
              <div className="mt-4 sm:mt-12 ml-[3.25rem] sm:ml-[5.5rem]">
                <Card className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/30 overflow-hidden cursor-pointer group hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 relative" onClick={() => window.location.href = '/smartlink-os'}>
                  <div className="absolute inset-0 opacity-60 hidden sm:block">
                    <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute top-12 right-12 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-100"></div>
                    <div className="absolute bottom-16 left-16 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-200"></div>
                    <div className="absolute bottom-8 right-8 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
                  </div>
                  
                  <CardContent className="p-4 sm:p-8 relative z-10">
                    <div className="text-center">
                      <div className="flex justify-center items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                        <Sparkles className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-purple-300 animate-pulse" />
                        <h3 className="text-sm sm:text-xl font-bold text-white">The Future Awaits</h3>
                        <Sparkles className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-blue-300 animate-pulse" />
                      </div>
                      <p className="text-purple-200 mb-2 sm:mb-4 text-[10px] sm:text-sm hidden sm:block">
                        Discover our vision for the next frontier of property management
                      </p>
                      <div className="flex justify-center items-center gap-1.5 sm:gap-2 text-cyan-300 group-hover:text-white transition-colors text-[10px] sm:text-sm font-medium">
                        <span>Explore Our Future Vision</span>
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-16">
            <Badge variant="outline" className="mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm border-primary/30 text-primary bg-primary/5">
              Proven Results
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-5">
              Real Metrics from{" "}
              <span className="text-primary">Live Properties</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto px-2 sm:px-0">
              Data-driven results from hotels we operate daily. No inflated claims—just real performance.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[{
            value: "40%",
            label: "Staff Turnover Reduction",
            description: "Lower than industry average",
            icon: Users,
            color: "from-green-500 to-emerald-600"
          }, {
            value: "4.8★",
            label: "Guest Review Score",
            description: "Consistent across properties",
            icon: Award,
            color: "from-amber-500 to-orange-600"
          }, {
            value: "+22%",
            label: "RevPAR Improvement",
            description: "Revenue per available room",
            icon: TrendingUp,
            color: "from-blue-500 to-indigo-600"
          }, {
            value: "24hr",
            label: "Average Response Time",
            description: "For maintenance requests",
            icon: Zap,
            color: "from-purple-500 to-pink-600"
          }].map((stat, index) => <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl blur-xl -z-10" style={{
              backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
            }} />
                <Card className="bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 h-full hover:shadow-xl hover:-translate-y-1 rounded-xl sm:rounded-2xl overflow-hidden">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 sm:mb-5 shadow-lg`}>
                      <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className={`text-2xl sm:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm lg:text-base font-semibold text-foreground mb-0.5 sm:mb-1">
                      {stat.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              </div>)}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-14">
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 bg-card/60 backdrop-blur-sm rounded-full border border-border/50">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="text-xs sm:text-sm font-medium text-foreground">Live data from active properties</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-5 sm:py-3 bg-card/60 backdrop-blur-sm rounded-full border border-border/50">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Field-tested daily</span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>;
};
export default About;