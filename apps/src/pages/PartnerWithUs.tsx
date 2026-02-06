import { useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building2, Users, TrendingUp, Shield, Clock, Award, BarChart3, Zap, Target, Star, ArrowRight, Loader2, Phone, Mail, MapPin, Calendar, FileText, Handshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Force refresh to clear cached errors

const PartnerWithUs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    orgName: "",
    contactName: "",
    email: "",
    phone: "",
    propertyCount: "",
    propertyType: "",
    location: "",
    notes: ""
  });
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from('leads').insert({
        org_name: formData.orgName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone || null,
        property_count: formData.propertyCount ? parseInt(formData.propertyCount) : null,
        notes: `Property Type: ${formData.propertyType}, Location: ${formData.location}, Notes: ${formData.notes}`
      });
      if (error) throw error;
      toast({
        title: "Partnership Request Submitted!",
        description: "Thank you for your interest. Our team will contact you within 24 hours."
      });

      // Reset form
      setFormData({
        orgName: "",
        contactName: "",
        email: "",
        phone: "",
        propertyCount: "",
        propertyType: "",
        location: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const partnerships = [{
    icon: Building2,
    title: "Property Owners",
    description: "Individual and institutional property owners seeking modern management services",
    stats: "Growing client base"
  }, {
    icon: Users,
    title: "Real Estate Groups",
    description: "Multi-property portfolios requiring scalable hospitality management solutions",
    stats: "Active partnerships"
  }, {
    icon: Handshake,
    title: "Investment Firms",
    description: "Investment groups seeking performance-focused property operations",
    stats: "Institutional relationships"
  }];
  const valueProps = [{
    icon: TrendingUp,
    title: "Performance Optimization",
    description: "Improve property value and operations through data-driven strategies and proven hospitality management techniques.",
    metrics: ["Operational efficiency", "Guest satisfaction tracking", "Performance analytics"]
  }, {
    icon: Shield,
    title: "Reliable Operations",
    description: "Consistent service through professional operations, compliance focus, and support systems.",
    metrics: ["Operational standards", "Compliance tracking", "Support available"]
  }, {
    icon: BarChart3,
    title: "Real-Time Visibility",
    description: "Live dashboards and detailed reporting provide transparency into your property performance.",
    metrics: ["Daily performance tracking", "ROI visibility", "Data insights"]
  }];
  const process = [{
    step: "01",
    title: "Initial Consultation",
    description: "Comprehensive property assessment and partnership strategy development",
    icon: Calendar
  }, {
    step: "02",
    title: "Custom Proposal",
    description: "Tailored management plan with transparent pricing and performance targets",
    icon: FileText
  }, {
    step: "03",
    title: "Seamless Transition",
    description: "Full onboarding with minimal disruption to existing operations",
    icon: Zap
  }, {
    step: "04",
    title: "Ongoing Optimization",
    description: "Continuous performance monitoring and strategic improvements",
    icon: Target
  }];
  const testimonials = [{
    quote: "SmartLink's training program cut our staff turnover in half. Their hands-on approach to onboarding new team members means we spend less time hiring and more time delighting guests.",
    author: "Sarah Chen",
    title: "Portfolio Director",
    properties: "Multi-property owner"
  }, {
    quote: "Working with SmartLink feels like having an extension of our own team. They manage the day-to-day so we can focus on growing our portfolio.",
    author: "Michael Rodriguez",
    title: "Principal",
    properties: "Independent properties"
  }, {
    quote: "The way SmartLink trains and supports our staff has completely changed our guest scores. Our teams are confident, well-prepared, and actually enjoy their work.",
    author: "Jennifer Walsh",
    title: "Managing Partner",
    properties: "Hospitality group"
  }];
  return <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
        
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
              <Handshake className="h-4 w-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Strategic Partnerships</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold mb-4 sm:mb-8 text-slate-900 leading-tight">
              Partner with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">SmartLink</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-2xl text-slate-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-2">
              Transform your hospitality properties with comprehensive management backed by modern technology 
              and performance-focused operations trusted by forward-thinking owners.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-12 text-sm sm:text-lg font-medium text-slate-600">
              <div className="flex items-center justify-center gap-3">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-500 rounded-full"></div>
                <span>Trusted by Leading Operators</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-purple-500 rounded-full"></div>
                <span>Growing Partnerships</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-700 rounded-full"></div>
                <span>Expanding Portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 text-slate-900">Who We Partner With</h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
              Performance-driven approach designed for diverse hospitality operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {partnerships.map((partnership, index) => <Card key={index} className="group relative bg-white border border-slate-200 shadow-lg hover:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-6 sm:p-8 lg:p-10 text-center relative z-10">
                  <div className="relative mb-5 sm:mb-8">
                    <div className="w-14 sm:w-16 lg:w-20 h-14 sm:h-16 lg:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                      <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-lg sm:rounded-xl blur-sm"></div>
                      <partnership.icon className="h-7 sm:h-8 lg:h-10 w-7 sm:w-8 lg:w-10 text-white relative z-10 drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-4 text-slate-900">{partnership.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">{partnership.description}</p>
                  <div className="bg-slate-50 rounded-lg p-2.5 sm:p-3">
                    <p className="text-slate-500 font-semibold text-xs sm:text-sm">{partnership.stats}</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 text-slate-900">Why Partner with SmartLink</h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
              Built by operators who understand hospitality—delivering measurable results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {valueProps.map((prop, index) => <Card key={index} className="bg-white border border-slate-200 shadow-lg hover:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-6 sm:p-8 lg:p-10 relative z-10">
                  <div className="relative mb-5 sm:mb-8">
                    <div className="w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-110 hover:rotate-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                      <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-lg sm:rounded-xl blur-sm"></div>
                      <prop.icon className="h-6 sm:h-7 lg:h-8 w-6 sm:w-7 lg:w-8 text-white relative z-10 drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-4 text-slate-900">{prop.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 leading-relaxed">{prop.description}</p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {prop.metrics.map((metric, metricIndex) => <div key={metricIndex} className="flex items-center gap-2 sm:gap-3">
                        <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-slate-700 font-medium">{metric}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 text-slate-900">Partnership Process</h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
              A streamlined approach to get your properties under professional management quickly and efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {process.map((step, index) => <div key={index} className="relative">
                <div className="text-center">
                  <div className="relative mb-4 sm:mb-6 lg:mb-8">
                    <div className="w-14 sm:w-16 lg:w-20 h-14 sm:h-16 lg:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-full flex items-center justify-center mx-auto shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-110 hover:rotate-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-full"></div>
                      <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-sm"></div>
                      <step.icon className="h-6 sm:h-8 lg:h-10 w-6 sm:w-8 lg:w-10 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <div className="absolute -top-1.5 sm:-top-2 -left-0.5 sm:-left-2 w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xs sm:text-sm drop-shadow-sm">{step.step}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-2 sm:mb-4 text-slate-900">{step.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed hidden sm:block">{step.description}</p>
                </div>
                
                {index < process.length - 1 && <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-slate-300 to-transparent transform translate-x-4"></div>}
              </div>)}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-10 sm:mb-16 lg:mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">What Our Partners Say</h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-2">
              Real results from real partners who've transformed their hospitality investments with SmartLink.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="bg-slate-800 border-slate-700 border rounded-2xl sm:rounded-3xl">
                <CardContent className="p-5 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-0.5 sm:gap-1 mb-4 sm:mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 sm:h-5 w-4 sm:w-5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  
                  <blockquote className="text-sm sm:text-base text-slate-200 mb-5 sm:mb-8 leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="border-t border-slate-700 pt-4 sm:pt-6">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-white text-sm sm:text-base">{testimonial.author}</p>
                        <p className="text-slate-400 text-xs sm:text-sm">{testimonial.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-semibold text-xs sm:text-sm">{testimonial.properties}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Partnership Form Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 text-slate-900">Start Your Partnership Journey</h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed px-2">
                Ready to transform your hospitality properties? Submit your information and our partnership team will contact you within 24 hours.
              </p>
            </div>
            
            <Card className="bg-white border-0 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="p-5 sm:p-8 lg:p-12">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="orgName" className="text-slate-700 font-semibold text-sm sm:text-base">Organization Name *</Label>
                      <Input id="orgName" placeholder="Your organization or company name" value={formData.orgName} onChange={e => handleInputChange("orgName", e.target.value)} required className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base" />
                    </div>
                    <div>
                      <Label htmlFor="contactName" className="text-slate-700 font-semibold text-sm sm:text-base">Contact Name *</Label>
                      <Input id="contactName" placeholder="Your full name" value={formData.contactName} onChange={e => handleInputChange("contactName", e.target.value)} required className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="email" className="text-slate-700 font-semibold text-sm sm:text-base">Email Address *</Label>
                      <Input id="email" type="email" placeholder="your.email@company.com" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-slate-700 font-semibold text-sm sm:text-base">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="propertyCount" className="text-slate-700 font-semibold text-sm sm:text-base">Number of Properties</Label>
                      <Input id="propertyCount" type="number" placeholder="e.g. 5" value={formData.propertyCount} onChange={e => handleInputChange("propertyCount", e.target.value)} className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base" />
                    </div>
                    <div>
                      <Label htmlFor="propertyType" className="text-slate-700 font-semibold text-sm sm:text-base">Primary Property Type</Label>
                      <Select onValueChange={value => handleInputChange("propertyType", value)}>
                        <SelectTrigger className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacation-rental">Vacation Rentals</SelectItem>
                          <SelectItem value="boutique-hotel">Boutique Hotels</SelectItem>
                          <SelectItem value="extended-stay">Extended Stay</SelectItem>
                          <SelectItem value="multifamily">Multifamily</SelectItem>
                          <SelectItem value="mixed-use">Mixed Use</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-slate-700 font-semibold text-sm sm:text-base">Primary Market Location</Label>
                    <Input id="location" placeholder="e.g. Miami, FL or Multiple Markets" value={formData.location} onChange={e => handleInputChange("location", e.target.value)} className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base" />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-slate-700 font-semibold text-sm sm:text-base">Investment Goals & Additional Information</Label>
                    <Textarea id="notes" placeholder="Tell us about your portfolio, investment goals, current challenges, or specific questions..." value={formData.notes} onChange={e => handleInputChange("notes", e.target.value)} rows={4} className="mt-1.5 sm:mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base" />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                        Submitting...
                      </> : <>
                        Submit Partnership Application
                        <ArrowRight className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5" />
                      </>}
                  </Button>
                  
                  <p className="text-center text-slate-500 text-xs sm:text-sm mt-3 sm:mt-4">
                    Our partnership team will review your application and contact you within 24 hours with next steps.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-10 sm:py-12 lg:py-16 bg-slate-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-white">Ready to Connect?</h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto px-2">
              Prefer to speak directly? Our partnership team is standing by to discuss your specific needs and goals.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-slate-300">
              <Phone className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400" />
              <span className="font-semibold text-sm sm:text-base">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-slate-300">
              <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400" />
              <span className="font-semibold text-sm sm:text-base">partnerships@smartlinkmgt.com</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-slate-300">
              <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-blue-400" />
              <span className="font-semibold text-sm sm:text-base">Mon-Fri, 8AM-6PM EST</span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>;
};
export default PartnerWithUs;