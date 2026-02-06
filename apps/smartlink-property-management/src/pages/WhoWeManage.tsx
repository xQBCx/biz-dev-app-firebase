import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, TrendingUp, MapPin, Star, DollarSign, Home, PartyPopper, Shield, Heart, BarChart3, Target, Globe, CheckCircle, ArrowRight, Phone, Mail, Zap, Award, Sparkles, Network } from "lucide-react";
import { Link } from "react-router-dom";

// Import sector images
import hotelSectorImg from "@/assets/hotel-sector.jpg";
import residentialSectorImg from "@/assets/residential-sector.jpg";
import multifamilySectorImg from "@/assets/multifamily-sector.jpg";
import eventsSectorImg from "@/assets/events-sector.jpg";
import commercialSectorImg from "@/assets/commercial-sector.jpg";
import wellnessSectorImg from "@/assets/wellness-sector.jpg";
const WhoWeManage = () => {
  const portfolioSectors = [{
    icon: Building2,
    image: hotelSectorImg,
    title: "Hotels & Resorts",
    properties: "Live Properties",
    revenue: "Performance-Driven",
    stats: [{
      metric: "Task Completion",
      value: "Tracked",
      benchmark: "(real-time)"
    }, {
      metric: "Guest Experience",
      value: "4.7/5",
      benchmark: ""
    }, {
      metric: "Efficiency Gains",
      value: "Measured",
      benchmark: "continuously"
    }],
    types: ["Boutique Hotels (15-75 rooms)", "Luxury City Hotels (76-250 rooms)", "Destination Resorts (100+ rooms)", "Lifestyle Hotels"],
    specialization: "Operations focused on clarity, accountability, and measurable results"
  }, {
    icon: Home,
    image: residentialSectorImg,
    title: "Luxury Residential Communities",
    properties: "Premium Units",
    revenue: "Quality-Focused",
    stats: [{
      metric: "Client Satisfaction",
      value: "High",
      benchmark: "(verified)"
    }, {
      metric: "Response Standards",
      value: "Fast",
      benchmark: "priority service"
    }, {
      metric: "Service Quality",
      value: "Consistent",
      benchmark: "tracked daily"
    }],
    types: ["Private Estates", "Luxury Condominiums", "Gated Communities", "Corporate Housing"],
    specialization: "High-touch service focused on resident satisfaction"
  }, {
    icon: Users,
    image: multifamilySectorImg,
    title: "Multifamily & Mixed-Use",
    properties: "Active Units",
    revenue: "Performance-Based",
    stats: [{
      metric: "Occupancy",
      value: "Strong",
      benchmark: "(maintained)"
    }, {
      metric: "Tenant Relations",
      value: "Positive",
      benchmark: "verified feedback"
    }, {
      metric: "Operations",
      value: "Streamlined",
      benchmark: "digital workflows"
    }],
    types: ["Class A Apartments", "Mixed-Use Developments", "Student Housing", "Senior Living"],
    specialization: "Proactive maintenance systems and tenant communication"
  }, {
    icon: PartyPopper,
    image: eventsSectorImg,
    title: "Event Venues & Entertainment",
    properties: "Active Venues",
    revenue: "Event-Driven",
    stats: [{
      metric: "Booking Management",
      value: "Digital",
      benchmark: "conflict-free system"
    }, {
      metric: "Client Satisfaction",
      value: "4.8/5",
      benchmark: ""
    }, {
      metric: "Operations",
      value: "Efficient",
      benchmark: "streamlined processes"
    }],
    types: ["Corporate Event Centers", "Wedding Venues", "Entertainment Venues", "Convention Centers"],
    specialization: "End-to-end event coordination and execution"
  }, {
    icon: Shield,
    image: commercialSectorImg,
    title: "Commercial & Professional",
    properties: "Commercial Space",
    revenue: "Tenant-Focused",
    stats: [{
      metric: "Tenant Relations",
      value: "Strong",
      benchmark: "(proactive service)"
    }, {
      metric: "Operations",
      value: "Efficient",
      benchmark: "digital systems"
    }, {
      metric: "Maintenance",
      value: "Responsive",
      benchmark: "tracked completion"
    }],
    types: ["Class A Office Buildings", "Medical Centers", "Retail Spaces", "Industrial Properties"],
    specialization: "Building management optimized for tenant experience"
  }, {
    icon: Heart,
    image: wellnessSectorImg,
    title: "Wellness & Retreat Properties",
    properties: "Specialty Centers",
    revenue: "Experience-Driven",
    stats: [{
      metric: "Guest Satisfaction",
      value: "4.7/5",
      benchmark: "(verified)"
    }, {
      metric: "Service Quality",
      value: "High",
      benchmark: ""
    }, {
      metric: "Operations",
      value: "Detailed",
      benchmark: "guest-focused"
    }],
    types: ["Luxury Spa Resorts", "Meditation Retreats", "Executive Retreats", "Wellness Centers"],
    specialization: "Wellness program management and guest experience focus"
  }];
  const advantages = [{
    icon: Shield,
    title: "Consistent Operations",
    description: "Reliable systems with accountability built-in"
  }, {
    icon: Zap,
    title: "Modern Technology",
    description: "SmartLink OS provides real-time tracking and visibility"
  }, {
    icon: TrendingUp,
    title: "Performance-Focused",
    description: "Data-driven approach to operational improvement"
  }, {
    icon: Award,
    title: "Comprehensive Service",
    description: "From planning to daily execution"
  }, {
    icon: BarChart3,
    title: "Scalable Platform",
    description: "Systems designed to grow with your portfolio"
  }];
  const markets = [{
    type: "Primary Markets",
    locations: ["Colorado", "Select US Cities"]
  }, {
    type: "Growth Markets",
    locations: ["Austin", "Nashville", "Denver"]
  }, {
    type: "Specialty Markets",
    locations: ["Resort Destinations", "Unique Properties"]
  }];
  const investmentCriteria = [{
    category: "Hotels",
    minimum: "$2M+ asset value"
  }, {
    category: "Residential",
    minimum: "$5M+ community value"
  }, {
    category: "Commercial",
    minimum: "$15M+ building value"
  }, {
    category: "Specialty",
    minimum: "$3M+ unique properties"
  }];
  return <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-24 sm:-translate-y-48 translate-x-24 sm:translate-x-48"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 mb-6 sm:mb-8">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Property Management Portfolio</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-8 text-slate-900 leading-tight px-2 sm:px-0">
              Premium Property{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Portfolio</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
              We manage properties across six distinct sectors—each with tailored operations and the systems to deliver measurable results.
            </p>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-10 px-2 sm:px-0">
              <div className="flex items-center gap-2 sm:gap-3 bg-blue-50 border border-blue-200 rounded-full px-3 sm:px-5 py-2 sm:py-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-base font-medium text-blue-700">Better Results</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-purple-50 border border-purple-200 rounded-full px-3 sm:px-5 py-2 sm:py-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-base font-medium text-purple-700">Built by Operators</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-emerald-50 border border-emerald-200 rounded-full px-3 sm:px-5 py-2 sm:py-3">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-base font-medium text-emerald-700">Real Data</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto text-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-lg">
                <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">40%</div>
                <div className="text-xs sm:text-base text-slate-600">Lower Turnover</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-lg">
                <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">4.8★</div>
                <div className="text-xs sm:text-base text-slate-600">Guest Score</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-6 shadow-lg">
                <div className="text-xl sm:text-3xl font-bold text-blue-700 mb-1 sm:mb-2">+22%</div>
                <div className="text-xs sm:text-base text-slate-600">Improvement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Sectors */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-6 text-slate-900">Six Distinct Sectors</h2>
            <p className="text-sm sm:text-base lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Specialized approaches across diverse property types, each backed by proven operational standards.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {portfolioSectors.map((sector, index) => <Card key={index} className="group relative bg-white border border-slate-200 shadow-lg hover:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-4 sm:p-6 lg:p-10 relative z-10">
                  <div className="flex items-start gap-3 sm:gap-6 mb-4 sm:mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-105 sm:group-hover:scale-110 relative">
                        <img src={sector.image} alt={sector.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-800/20"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                        {sector.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 sm:gap-4">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 font-semibold text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
                          {sector.properties}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 font-semibold text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1">
                          {sector.revenue}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Success Metrics */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                    {sector.stats.map((stat, statIndex) => <div key={statIndex} className="bg-slate-50 rounded-lg p-2 sm:p-4 text-center">
                        <div className="text-sm sm:text-xl lg:text-2xl font-bold text-blue-600 mb-0.5 sm:mb-1">{stat.value}</div>
                        <div className="text-[10px] sm:text-sm text-slate-600">{stat.metric}</div>
                        {stat.benchmark && <div className="text-[8px] sm:text-xs text-slate-500 hidden sm:block">{stat.benchmark}</div>}
                      </div>)}
                  </div>
                  
                  {/* Property Types - Hidden on mobile for cleaner look */}
                  <div className="mb-4 hidden sm:block">
                    <h4 className="font-semibold text-slate-900 mb-2 sm:mb-3 text-sm sm:text-base">Property Types:</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {sector.types.map((type, typeIndex) => <Badge key={typeIndex} variant="outline" className="text-[10px] sm:text-xs border-slate-300 text-slate-600">
                          {type}
                        </Badge>)}
                    </div>
                  </div>
                  
                  {/* Specialization */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="font-semibold">Focus:</span> {sector.specialization}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* The SmartLink Advantage */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-6 text-slate-900">The SmartLink Advantage</h2>
            <p className="text-sm sm:text-base lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Consistent operations meeting hospitality standards for dependable property performance.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {advantages.map((advantage, index) => <Card key={index} className="group bg-white border border-slate-200 shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center relative z-10">
                  <div className="relative mb-3 sm:mb-6">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg sm:shadow-2xl transition-all duration-500 group-hover:scale-105 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                      <advantage.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white relative z-10 drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-xs sm:text-sm lg:text-lg font-bold mb-1 sm:mb-4 text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                    {advantage.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 leading-relaxed hidden sm:block">
                    {advantage.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Geographic Focus */}
      

      {/* Investment Criteria */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 sm:px-6 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
              <span className="text-xs sm:text-sm font-semibold text-accent-foreground uppercase tracking-wider">Investment Criteria</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold mb-3 sm:mb-6 text-foreground">
              Partnership Thresholds
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Minimum property values and partnership structures designed for premium asset management.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto mb-8 sm:mb-16">
            {investmentCriteria.map((criteria, index) => <Card key={index} className="group relative bg-background border-0 shadow-lg hover:shadow-xl rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 sm:p-6 lg:p-8 text-center relative z-10">
                   <div className="relative mb-3 sm:mb-6">
                     <div className="w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary rounded-lg sm:rounded-xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 group-hover:scale-105">
                       <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white drop-shadow-lg" />
                     </div>
                   </div>
                  
                  <h3 className="text-sm sm:text-base lg:text-lg font-display font-semibold mb-1 sm:mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {criteria.category}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-semibold">
                    {criteria.minimum}
                  </p>
                </CardContent>
              </Card>)}
          </div>

          {/* Partnership Structures */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-4 sm:mb-6 text-foreground">Partnership Structures</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <h4 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">Management Contracts</h4>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">3-5% of gross revenue + performance incentives</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <h4 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">Joint Ventures</h4>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Shared ownership with operational control</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <h4 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">Acquisition Partners</h4>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Capital partnering for strategic acquisitions</p>
              </div>
              <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 sm:p-4 lg:p-6">
                <h4 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">Development Partners</h4>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">Ground-up development with guaranteed management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-blue-100/40 rounded-full blur-3xl -translate-x-24 sm:-translate-x-48 -translate-y-24 sm:-translate-y-48"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-display font-bold mb-4 sm:mb-6 text-slate-900 leading-tight px-2 sm:px-0">
              Ready to transform your property into a{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                best-in-class operation?
              </span>
            </h2>
            
            <p className="text-sm sm:text-base lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Contact SmartLink to discover how we deliver hospitality excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mb-8 sm:mb-12 px-2 sm:px-0">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-base text-slate-600">Average 35% ROI increase</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-base text-slate-600">Hands-on training</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <span className="text-xs sm:text-base text-slate-600">Full-service approach</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 px-4 sm:px-0">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold text-sm sm:text-lg px-6 sm:px-12 py-3 sm:py-4 h-auto min-h-[44px] w-full sm:w-auto" asChild>
                <Link to="/partner-with-us">
                  Partner With Us
                  <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-6 sm:w-6" />
                </Link>
              </Button>
              
              <Button size="lg" className="bg-slate-700 text-white hover:bg-slate-800 active:bg-slate-900 transition-all duration-300 font-bold text-sm sm:text-lg px-6 sm:px-12 py-3 sm:py-4 h-auto min-h-[44px] w-full sm:w-auto" asChild>
                <a href="tel:720-238-3008">
                  <Phone className="mr-2 sm:mr-3 h-4 w-4 sm:h-6 sm:w-6" />
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>;
};
export default WhoWeManage;