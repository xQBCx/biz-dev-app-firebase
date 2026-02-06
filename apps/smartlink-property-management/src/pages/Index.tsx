import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { Building2, Users, BarChart3, Shield, Zap, CheckCircle, ArrowRight, LayoutDashboard, GraduationCap, ClipboardCheck, Quote, Sparkles, Star, Rocket } from "lucide-react";
const Index = () => {
  const valuePillars = [{
    icon: LayoutDashboard,
    title: "SmartLink OS",
    description: "Your property's command center tasks, SOPs, and audit-ready reporting."
  }, {
    icon: GraduationCap,
    title: "Training Academy",
    description: "Career paths from new hire to GM, keeping talent engaged and growing."
  }, {
    icon: ClipboardCheck,
    title: "Operations Suite",
    description: "Front desk, housekeeping, and maintenance workflows digitized and accountable."
  }];
  const howItWorks = [{
    step: 1,
    title: "Digitize Operations",
    description: "Replace paper SOPs and manual checklists with digital workflows. Track task completion in real-time and maintain instant compliance documentation.",
    result: "28% fewer missed tasks"
  }, {
    step: 2,
    title: "Train & Certify",
    description: "Onboard staff through structured learning paths with skill certifications. Standardize training across all roles and track career progression.",
    result: "2x faster onboarding"
  }, {
    step: 3,
    title: "Measure & Scale",
    description: "Monitor performance with real-time dashboards. Generate automated audit reports and use data-driven insights to optimize operations.",
    result: "18% higher guest satisfaction"
  }];
  const metrics = ["40% Lower Staff Turnover", "24hr Avg Response Time", "4.8★ Review Scores", "95% Task Completion"];
  const testimonials = [{
    quote: "SmartLink's training program transformed how we onboard new staff. What used to take weeks now happens in days, and our team actually retains what they learn.",
    name: "Sarah Johnson",
    role: "General Manager",
    property: "Boutique Property"
  }, {
    quote: "The management approach is refreshingly practical. Our staff turnover dropped significantly once we implemented their structured training paths.",
    name: "Michael Chen",
    role: "Operations Director",
    property: "Independent Hotel"
  }, {
    quote: "Finally, a team that understands hospitality from the ground up. Their training modules and accountability systems have made a real difference in our guest scores.",
    name: "Lisa Rodriguez",
    role: "Property Owner",
    property: "Hospitality Group"
  }];
  return <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-28 min-h-[90vh] sm:min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-24 sm:-translate-y-48 translate-x-24 sm:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-40 sm:w-80 h-40 sm:h-80 bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl translate-y-20 sm:translate-y-40 -translate-x-20 sm:-translate-x-40"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-sm border border-blue-200/30 rounded-full px-4 sm:px-10 py-2.5 sm:py-4 mb-5 sm:mb-8 shadow-lg">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Rocket className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-xs sm:text-base font-bold text-slate-800">Built by Hotel Operators</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight text-slate-900 px-2">
              The Future of{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Hospitality Management
              </span>
            </h1>
            
            <p className="text-sm sm:text-lg lg:text-xl text-slate-600 mb-5 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2">Purpose-built by real hotel operators to solve real operational challenges. Field-tested workflows, proven training systems, and performance insights designed for modern hospitality.</p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6 mb-6 sm:mb-12 text-xs sm:text-base px-2">
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-medium">Reduce costs 30%</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-medium">Boost satisfaction</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="font-medium">Audit-ready</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 sm:mb-16 px-2">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-h-[48px]" asChild>
                <Link to="/partner-with-us">
                  Start Your Transformation
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/80 backdrop-blur-sm border-2 border-slate-300 text-slate-700 hover:bg-white font-bold text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3 rounded-xl w-full sm:w-auto min-h-[48px]" asChild>
                <Link to="/smartlink-os">
                  Explore Platform
                  <LayoutDashboard className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 pt-6 sm:pt-12 lg:pt-16 border-t border-slate-200 px-2">
              <div className="text-center group">
                <div className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-br from-green-500 to-emerald-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">4.8★</div>
                <div className="text-[10px] sm:text-sm text-slate-600 font-medium">Guest Reviews</div>
              </div>
              <div className="text-center group">
                <div className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">95%</div>
                <div className="text-[10px] sm:text-sm text-slate-600 font-medium">Task Completion</div>
              </div>
              <div className="text-center group">
                <div className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">40%</div>
                <div className="text-[10px] sm:text-sm text-slate-600 font-medium">Less Turnover</div>
              </div>
              <div className="text-center group">
                <div className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-br from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform duration-300">24hr</div>
                <div className="text-[10px] sm:text-sm text-slate-600 font-medium">Avg Response</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements - hidden on mobile for cleaner look */}
        <div className="hidden sm:block absolute bottom-20 left-10 w-20 h-20 bg-blue-300/20 rounded-full blur-xl animate-pulse"></div>
        <div className="hidden sm:block absolute top-40 right-20 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="hidden lg:block absolute top-1/2 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="hidden lg:block absolute bottom-1/3 right-1/3 w-6 h-6 bg-purple-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '3s' }}></div>
      </section>

      {/* Value Pillars */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-slate-100 rounded-full px-4 sm:px-8 py-2.5 sm:py-4 mb-4 sm:mb-8">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              <span className="text-xs sm:text-base font-semibold text-slate-700 uppercase tracking-wider">Platform Overview</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 text-slate-900 px-2">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-xs sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
              Purpose-built tools designed by hotel operators to solve real operational challenges.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {valuePillars.map((pillar, index) => (
              <Card key={index} className="group relative bg-white shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden transition-all duration-500 border border-slate-200 hover:border-blue-500/30 h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-5 sm:p-6 lg:p-8 text-center relative z-10 flex flex-col h-full">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-all duration-500">
                      <pillar.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 transition-colors duration-300 text-slate-900 group-hover:text-blue-600">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-slate-600 flex-grow">
                    {pillar.description}
                  </p>
                  
                  <Link to="/smartlink-os" className="mt-4 sm:mt-6 transition-all duration-300 block">
                    <div className="inline-flex items-center font-semibold text-xs sm:text-sm text-blue-600 hover:text-purple-600">
                      <span>Learn More</span>
                      <ArrowRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <Button variant="outline" size="lg" className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 font-bold text-sm sm:text-base px-5 sm:px-8 py-3 rounded-xl w-full sm:w-auto min-h-[48px]" asChild>
              <Link to="/smartlink-os">
                Explore All Features
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 sm:py-16 lg:py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white rounded-full px-4 sm:px-8 py-2.5 sm:py-4 mb-4 sm:mb-8 shadow-sm">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              <span className="text-xs sm:text-base font-semibold text-slate-700 uppercase tracking-wider">Get Started</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 text-slate-900 px-2">
              How It{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-base lg:text-lg max-w-2xl mx-auto px-2">
              A simple, proven process to transform your operations
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, index) => (
              <div 
                key={index} 
                className="relative bg-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Step Number */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {step.step}
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">
                    {step.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-xs sm:text-sm lg:text-base leading-relaxed mb-4 sm:mb-6">
                  {step.description}
                </p>
                
                {/* Result Badge */}
                <div className="pt-3 sm:pt-4 border-t border-slate-100">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {step.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes/Metrics Band - Professional Edition */}
      <section className="relative py-10 sm:py-14 lg:py-16 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Enhanced background pattern and effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(147,51,234,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30"></div>
        
        {/* Floating accent elements */}
        <div className="absolute top-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-x-16 sm:-translate-x-32 -translate-y-16 sm:-translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-tl from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl translate-x-12 sm:translate-x-24 translate-y-12 sm:translate-y-24"></div>
        
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 relative z-10">
          {/* Professional section header */}
          <div className="text-center mb-6 sm:mb-10 lg:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 mb-4 sm:mb-6 shadow-xl">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Proven Results</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-2">
              Real Impact, <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Real Results</span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-2xl mx-auto px-2">
              Measurable outcomes that drive your business forward
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6 xl:gap-8 max-w-6xl mx-auto">
            {metrics.map((metric, index) => <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group-hover:scale-105 shadow-xl hover:shadow-2xl h-full flex flex-col justify-between min-h-[100px] sm:min-h-[140px] lg:min-h-[180px]">
                  {/* Enhanced metric display with gradient backgrounds */}
                  <div className="relative mb-1 sm:mb-3 lg:mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative text-sm sm:text-lg md:text-xl lg:text-3xl xl:text-4xl font-bold text-white mb-1 sm:mb-2 lg:mb-3 group-hover:text-blue-300 transition-colors duration-300 leading-tight">
                      {metric}
                    </div>
                  </div>
                  
                  {/* Professional category labels */}
                  <div className="text-[9px] sm:text-xs lg:text-sm text-white/70 uppercase tracking-wide font-semibold leading-tight">
                    {index === 0 && "Retention"}
                    {index === 1 && "Guest Services"}
                    {index === 2 && "Guest Experience"}
                    {index === 3 && "Operations"}
                  </div>
                  
                  {/* Subtle progress indicator */}
                  <div className="mt-2 sm:mt-3 lg:mt-4 w-full bg-white/10 rounded-full h-1 sm:h-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-1000 group-hover:w-full" style={{
                  width: index === 0 ? '85%' : index === 1 ? '92%' : index === 2 ? '78%' : '100%'
                }}></div>
                  </div>
                </div>
              </div>)}
          </div>
          
          {/* Bottom accent */}
          <div className="text-center mt-6 sm:mt-10 lg:mt-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 shadow-xl">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-400" />
              <span className="text-xs sm:text-sm lg:text-lg font-bold text-white uppercase tracking-wider">Performance-Focused</span>
              <Star className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-10 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        {/* Background effects - simplified for mobile */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="hidden sm:block absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl -translate-x-24 sm:-translate-x-48 -translate-y-24 sm:-translate-y-48"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 shadow-lg">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Quote className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">Client Success</span>
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-6 text-slate-900 px-2">
              What Our Partners{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Say</span>
            </h2>
            <p className="text-xs sm:text-base lg:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed px-2">
              Real results from hospitality professionals who transformed their operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="group relative bg-white border border-slate-200 shadow-lg rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10">
                  {/* Quote icon */}
                  <div className="mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                      <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <blockquote className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed mb-4 sm:mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  {/* Author section */}
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{testimonial.name}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500">{testimonial.role}</p>
                        <p className="text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{testimonial.property}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Verification badge */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white border border-blue-200/50 rounded-full p-1.5 sm:p-2 shadow-sm">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                  </div>
                </CardContent>
              </Card>)}
          </div>
          
          {/* Bottom CTA accent */}
          <div className="text-center mt-8 sm:mt-12 lg:mt-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Trusted by Operators</span>
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        {/* Background effects - simplified */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.06),transparent_50%)]"></div>
        <div className="hidden sm:block absolute top-0 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl translate-x-24 -translate-y-24"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-full px-4 sm:px-6 py-2 mb-5 sm:mb-8 shadow-sm">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 uppercase tracking-wider">Get Started</span>
            </div>
            
            {/* Headline */}
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 text-slate-900 leading-tight px-2">
              Transform Your Property{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Today
              </span>
            </h2>
            
            <p className="text-xs sm:text-base lg:text-xl text-slate-600 mb-6 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2">
              Trusted by <span className="font-semibold text-blue-700">forward-thinking operators</span> achieving{" "}
              <span className="font-semibold text-green-700">30% cost reductions</span> and{" "}
              <span className="font-semibold text-purple-700">higher guest satisfaction</span>.
            </p>
            
            {/* Social proof indicators */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10 px-2">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm">30-day setup</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm">No setup fees</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                <CheckCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="font-medium text-xs sm:text-sm">24/7 support</span>
              </div>
            </div>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 sm:mb-10 px-2">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 font-bold text-sm sm:text-base px-6 sm:px-10 py-3 rounded-xl w-full sm:w-auto min-h-[48px]" asChild>
                <Link to="/partner-with-us">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-xl shadow-lg w-full sm:w-auto min-h-[48px]" asChild>
                <Link to="/smartlink-os">
                  Watch Demo
                  <LayoutDashboard className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="text-center px-2">
              <p className="text-slate-500 text-xs sm:text-sm mb-3">
                Trusted by hospitality professionals nationwide
              </p>
              <div className="flex justify-center items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full border-2 border-white shadow-md"></div>
                </div>
                <span className="text-slate-700 text-xs sm:text-sm font-medium">
                  Growing portfolio
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>;
};
export default Index;