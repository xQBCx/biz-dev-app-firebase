import { useState } from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, Loader2, Headphones, Users, Building2, Zap, Shield, Star, CheckCircle, Globe, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
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
      } = await supabase.from('inquiries').insert({
        name: formData.name,
        email: formData.email,
        message: `Subject: ${formData.subject}\n\nPhone: ${formData.phone}\n\nMessage: ${formData.message}`
      });
      if (error) throw error;
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours."
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Message Failed",
        description: "There was an error sending your message. Please try again.",
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
  const contactMethods = [{
    icon: Phone,
    title: "Call Us",
    primary: "Contact for phone support",
    secondary: "Monday - Friday, 8AM - 6PM EST",
    description: "Speak directly with our customer success team for immediate assistance"
  }, {
    icon: Mail,
    title: "Email Support",
    primary: "hello@smartlinkmgt.com",
    secondary: "Response within 24 hours",
    description: "Send us detailed questions and we'll provide comprehensive answers"
  }, {
    icon: MessageCircle,
    title: "Live Chat",
    primary: "Available 24/7",
    secondary: "Instant support",
    description: "Get real-time help through our website chat or SmartLink OS platform"
  }, {
    icon: MapPin,
    title: "Visit Our Office",
    primary: "SmartLink Headquarters",
    secondary: "Denver, Colorado",
    description: "Schedule a meeting at our modern workspace in downtown Denver"
  }];
  const departments = [{
    icon: Building2,
    title: "Property Management",
    description: "Questions about our management services, property onboarding, or operational support",
    email: "properties@smartlinkmgt.com",
    phone: "Contact via email"
  }, {
    icon: Users,
    title: "Partnerships & Sales",
    description: "Partnership opportunities, investment inquiries, or business development discussions",
    email: "partnerships@smartlinkmgt.com",
    phone: "Contact via email"
  }, {
    icon: Headphones,
    title: "Technical Support",
    description: "SmartLink OS platform support, integrations, training, or technical assistance",
    email: "support@smartlinkmgt.com",
    phone: "Contact via email"
  }, {
    icon: Globe,
    title: "General Inquiries",
    description: "Media requests, general questions, or if you're not sure which department to contact",
    email: "hello@smartlinkmgt.com",
    phone: "Contact via email"
  }];
  const faqs = [{
    question: "How quickly can you start managing my property?",
    answer: "Most properties can be onboarded within 7-14 days, depending on size and complexity."
  }, {
    question: "Do you provide 24/7 emergency support?",
    answer: "Yes, we offer round-the-clock emergency support for property-related issues."
  }, {
    question: "What markets do you serve?",
    answer: "We manage properties across major metropolitan areas with plans for national expansion."
  }];
  return <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-32 sm:-translate-y-40 lg:-translate-y-48 translate-x-32 sm:translate-x-40 lg:translate-x-48"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">Get in Touch</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-slate-900 leading-tight">
              Let's{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Connect</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              Whether you're looking to optimize your property portfolio or need support with SmartLink OS, our team is here to help you succeed.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-sm sm:text-base text-slate-500 px-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span>24/7 Emergency</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                <span>24-Hour Response</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-700 rounded-full flex-shrink-0"></div>
                <span>Expert Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-slate-900">Choose Your Method</h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We offer multiple ways to connect. Choose what works best for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {contactMethods.map((method, index) => <Card key={index} className="group relative bg-white border border-slate-200 shadow-lg hover:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-6 sm:p-8 text-center relative z-10">
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden">
                      {/* Glossy overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                      {/* Inner glow */}
                      <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-lg sm:rounded-xl blur-sm"></div>
                      <method.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white relative z-10 drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-900">{method.title}</h3>
                  <p className="text-slate-900 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{method.primary}</p>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium mb-2 sm:mb-3">{method.secondary}</p>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{method.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Contact Form & Departments */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-900">Send us a Message</h2>
                <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                  Fill out the form below and our team will get back to you within 24 hours during business hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="name" className="text-slate-700 font-semibold text-sm">Full Name *</Label>
                      <Input id="name" placeholder="Your full name" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} required className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 touch-target" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Email Address *</Label>
                      <Input id="email" type="email" placeholder="your.email@company.com" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 touch-target" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label htmlFor="phone" className="text-slate-700 font-semibold text-sm">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" value={formData.phone} onChange={e => handleInputChange("phone", e.target.value)} className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 touch-target" />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="text-slate-700 font-semibold text-sm">Subject</Label>
                      <Select onValueChange={value => handleInputChange("subject", value)}>
                        <SelectTrigger className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500 touch-target">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="partnership">Partnership Interest</SelectItem>
                          <SelectItem value="property-management">Property Management</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="careers">Career Opportunities</SelectItem>
                          <SelectItem value="media">Media & Press</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-slate-700 font-semibold text-sm">Message *</Label>
                    <Textarea id="message" placeholder="Tell us how we can help you..." value={formData.message} onChange={e => handleInputChange("message", e.target.value)} rows={6} required className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500" />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 touch-target" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Sending...
                      </> : <>
                        Send Message
                        <Send className="ml-3 h-5 w-5" />
                      </>}
                  </Button>
                  
                  <p className="text-center text-slate-500 text-xs sm:text-sm">
                    We'll respond within 24 hours during business hours.
                  </p>
                </form>
              </div>
            </div>

            {/* Departments */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-slate-900 px-2">Department Directory</h2>
              <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed px-2">
                Connect directly with the right team for faster, more specialized assistance.
              </p>

              <div className="space-y-4 sm:space-y-6">
                {departments.map((dept, index) => <Card key={index} className="bg-white border border-slate-200 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                          {/* Glossy overlay effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-lg sm:rounded-xl"></div>
                          <dept.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10 drop-shadow-lg" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-slate-900">{dept.title}</h3>
                          <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">{dept.description}</p>
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                            <a href={`mailto:${dept.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium truncate">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{dept.email}</span>
                            </a>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              {dept.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-4">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">FAQs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 text-slate-900">Frequently Asked Questions</h2>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Quick answers to common questions. Can't find what you're looking for? Contact us directly.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {faqs.map((faq, index) => <Card key={index} className="group relative bg-white border border-slate-200 shadow-lg hover:shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardContent className="p-5 sm:p-6 lg:p-8 relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:shadow-purple-500/30 transition-all duration-500 group-hover:scale-110 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-slate-900 leading-snug">{faq.question}</h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-orange-900">Emergency Support</h2>
            </div>
            
            <p className="text-orange-800 mb-8 leading-relaxed">
              For property management emergencies outside business hours, including maintenance issues, security concerns, or tenant emergencies.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold" asChild>
                <a href="tel:+15559111111">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Emergency Line: (555) 911-1111
                </a>
              </Button>
              
              <Button variant="outline" size="lg" className="border-orange-300 text-orange-700 hover:bg-orange-100" asChild>
                <a href="sms:+15559111111">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Text Emergency: (555) 911-1111
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Office Information */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Visit Our Office</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Located in the heart of Denver's tech district, our modern office space is designed for collaboration and innovation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl"></div>
                <MapPin className="h-6 w-6 text-white relative z-10 drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Address</h3>
              <p className="text-slate-300">SmartLink Headquarters</p>
              <p className="text-slate-300">1234 Innovation Drive, Suite 500</p>
              <p className="text-slate-300">Denver, Colorado 80202</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl"></div>
                <Clock className="h-6 w-6 text-white relative z-10 drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Office Hours</h3>
              <p className="text-slate-300">Monday - Friday</p>
              <p className="text-slate-300">8:00 AM - 6:00 PM EST</p>
              <p className="text-slate-300">Weekends by appointment</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl"></div>
                <Building2 className="h-6 w-6 text-white relative z-10 drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Schedule a Visit</h3>
              <p className="text-slate-300 mb-4">Book a tour of our facilities or schedule a meeting with our team.</p>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <a href="mailto:visits@smartlinkmgt.com">
                  Schedule Visit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>;
};
export default Contact;