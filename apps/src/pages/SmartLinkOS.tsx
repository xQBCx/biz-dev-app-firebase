import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Users, 
  Wrench, 
  GraduationCap, 
  ClipboardList, 
  BarChart3,
  ArrowRight,
  Shield,
  Clock,
  Eye,
  Sparkles,
  Zap,
  Cpu,
  Star,
  Award,
  Layers,
  Activity,
  Target,
  CheckCircle,
  Rocket,
  LayoutDashboard
} from "lucide-react";

const SmartLinkOS = () => {
  const modules = [
    {
      icon: Settings,
      title: "Operations Center",
      description: "Centralized control panel for all property operations, maintenance requests, and tenant communications.",
      features: ["Real-time dashboards", "Automated workflows", "Performance analytics"]
    },
    {
      icon: Users,
      title: "Front Desk Management", 
      description: "Streamlined tenant onboarding, visitor management, and resident service coordination.",
      features: ["Digital check-in", "Visitor tracking", "Service requests"]
    },
    {
      icon: ClipboardList,
      title: "Housekeeping Operations",
      description: "Efficient scheduling and tracking of cleaning services, inspections, and maintenance.",
      features: ["Task scheduling", "Quality control", "Inventory management"]
    },
    {
      icon: Wrench,
      title: "Maintenance Hub",
      description: "Complete maintenance request lifecycle from submission to completion with vendor coordination.",
      features: ["Work order management", "Vendor coordination", "Cost tracking"]
    },
    {
      icon: Users,
      title: "Onboarding Platform", 
      description: "Streamlined new tenant onboarding with digital documentation and automated processes.",
      features: ["Digital applications", "Document management", "Automated communications"]
    },
    {
      icon: GraduationCap,
      title: "SmartLink Academy",
      description: "Training and knowledge base for property management best practices and platform usage.",
      features: ["Training modules", "Best practices", "Certification programs"]
    }
  ];

  const benefits = [
    {
      icon: Eye,
      title: "Full Visibility",
      description: "Real-time access to operational data, task completion, and performance tracking."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Professional-grade security with role-based access and audit trails."
    },
    {
      icon: Clock,
      title: "Always Accessible",
      description: "Access your data anytime, anywhere with mobile-optimized design."
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section - Light Theme */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-32 sm:-translate-y-40 lg:-translate-y-48 translate-x-32 sm:translate-x-40 lg:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-56 sm:w-64 lg:w-80 h-56 sm:h-64 lg:h-80 bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl translate-y-28 sm:translate-y-32 lg:translate-y-40 -translate-x-28 sm:-translate-x-32 lg:-translate-x-40"></div>
        
        <div className="relative section-padding py-16 sm:py-20 lg:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm border border-blue-200/30 rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 mb-6 sm:mb-8 shadow-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-lg flex items-center justify-center">
                  <Cpu className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">Next-Generation Platform</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 lg:mb-8 tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  SmartLink
                </span>{" "}
                <span className="text-slate-900">OS</span>
              </h1>
              
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
                A hospitality operations platform built by real hotel operators. 
                <span className="font-semibold text-slate-800"> Field-tested tools</span> for task management, training, and operational visibility designed around actual property needs.
              </p>
              
              {/* Key Benefits */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 text-sm sm:text-base px-4">
                <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium">Field-Tested</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium">Secure Platform</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-slate-600">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <span className="font-medium">Live Operations</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center px-4">
                <div className="flex flex-col items-center gap-2">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 touch-target w-full sm:w-auto"
                    asChild
                  >
                    <Link to="/os/login">
                      <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Access Dashboard
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                  <span className="text-xs sm:text-sm text-amber-600 font-semibold">Coming Soon</span>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-white/80 backdrop-blur-sm border-2 border-slate-300 text-slate-700 hover:bg-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl touch-target w-full sm:w-auto"
                    asChild
                  >
                    <Link to="/partner-with-us">
                      <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Watch Demo
                    </Link>
                  </Button>
                  <span className="text-xs sm:text-sm text-amber-600 font-semibold">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Floating Elements - Hidden on mobile for cleaner experience */}
        <div className="hidden sm:block absolute bottom-20 left-10 w-20 h-20 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="hidden sm:block absolute top-40 right-20 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="hidden md:block absolute top-1/2 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="hidden md:block absolute bottom-1/3 right-1/3 w-6 h-6 bg-purple-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '3s' }}></div>
      </section>

      {/* Key Benefits */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full px-6 sm:px-8 py-3 sm:py-4 mb-6 sm:mb-8">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              <span className="text-sm sm:text-base font-semibold text-slate-700 uppercase tracking-wider">Platform Advantages</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 text-slate-900 px-4">
              Built by{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Operators</span>
              {" "}for Operators
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
              Software designed by people who run hotels daily, solving real problems 
              we encountered in actual property operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="group relative bg-white shadow-lg hover:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 border border-slate-200">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center relative z-10">
                  <div className="relative mb-4 sm:mb-6 lg:mb-8">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                      <benefit.icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white relative z-10 drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Modules */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200/30 rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 mb-6 sm:mb-8 shadow-lg">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">Platform Modules</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-slate-900 px-4">
              Comprehensive{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Tools</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
              Everything you need to manage property operations efficiently, all in one integrated platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {modules.map((module, index) => (
              <Card key={index} className="group bg-white border border-slate-200 hover:border-blue-300/50 transition-all duration-300 hover:shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <module.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg sm:text-xl text-slate-900">{module.title}</h3>
                  </div>
                  <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">{module.description}</p>
                  <div className="space-y-2 sm:space-y-3">
                    {module.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Preview / Command Center */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full px-6 sm:px-8 py-3 sm:py-4 mb-6 sm:mb-8">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              <span className="text-sm sm:text-base font-semibold text-slate-700 uppercase tracking-wider">Command Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 text-slate-900 px-4">
              Real-Time{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Intelligence</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
              Monitor every aspect of your property operations from a single, powerful dashboard.
            </p>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
            {[
              { label: "System Uptime", value: "99.9%", icon: Activity, color: "from-green-500 to-emerald-500" },
              { label: "Response Time", value: "0.34s", icon: Zap, color: "from-blue-500 to-cyan-500" },
              { label: "Security Rating", value: "AAA", icon: Shield, color: "from-purple-500 to-pink-500" },
              { label: "Task Completion", value: "95%", icon: Target, color: "from-orange-500 to-amber-500" }
            ].map((metric, index) => (
              <Card key={index} className="group bg-white border border-slate-200 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-1">{metric.value}</div>
                  <div className="text-xs sm:text-sm text-slate-600">{metric.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">
                Powerful Analytics & Reporting
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                Make data-driven decisions with comprehensive reporting, financial analytics, 
                and performance metrics that help you optimize your property operations.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                {[
                  "Real-time financial reporting",
                  "Occupancy and leasing analytics",
                  "Maintenance cost tracking",
                  "Tenant satisfaction metrics"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { value: "98.5%", label: "System Uptime" },
                { value: "24/7", label: "Support Available" },
                { value: "256-bit", label: "SSL Encryption" },
                { value: "SOC 2", label: "Compliant" }
              ].map((stat, index) => (
                <Card key={index} className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200">
                  <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                    <div className="text-lg sm:text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">{stat.value}</div>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-white border-0 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-10 lg:p-16 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200/50 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 flex-shrink-0" />
                <span className="font-semibold text-slate-700 text-xs sm:text-sm md:text-base text-center">Ready to Transform Your Operations?</span>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0 hidden sm:block" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-slate-900">
                Experience the Future of{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Property Management
                </span>
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
                Trusted by forward-thinking operators who demand{" "}
                <span className="font-semibold text-slate-800">reliable, field-tested solutions</span>{" "}
                for their most critical operations.
              </p>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 sm:mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base lg:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
                  asChild
                >
                  <Link to="/os/login">
                    <Zap className="mr-2 h-5 w-5" />
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 font-bold text-sm sm:text-base lg:text-lg px-8 sm:px-10 py-4 sm:py-5 rounded-xl touch-target"
                  asChild
                >
                  <Link to="/partner-with-us">
                    <Eye className="mr-2 h-5 w-5" />
                    Schedule Demo
                  </Link>
                </Button>
              </div>
              
              {/* Trust metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 lg:pt-10 border-t border-slate-200">
                {[
                  { value: "4.8★", label: "Guest Reviews" },
                  { value: "95%", label: "Task Completion" },
                  { value: "40%", label: "Less Turnover" },
                  { value: "24hr", label: "Avg Response" }
                ].map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-lg sm:text-xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
};

export default SmartLinkOS;
