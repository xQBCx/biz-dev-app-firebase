import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase, Users, GraduationCap, Heart, ArrowRight, TrendingUp, Shield, Zap, Star, Award, Coffee, Globe, Lightbulb, Target, CheckCircle, Building2, Rocket, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface Job {
  id: string;
  title: string;
  location: string;
  department: string;
  type: string;
  description: string;
  active: boolean;
  created_at: string;
}
const Careers = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('job_postings').select('*').eq('active', true).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const culture = [{
    icon: Rocket,
    title: "Innovation First",
    description: "Build hospitality technology with cutting-edge solutions and creative problem-solving.",
    stats: "Fast-moving projects"
  }, {
    icon: Users,
    title: "Collaborative Team",
    description: "Work with cross-functional teams where diverse perspectives drive breakthrough results.",
    stats: "High team satisfaction"
  }, {
    icon: Target,
    title: "Growth Focused",
    description: "Continuous learning culture with mentorship, training, and career advancement opportunities.",
    stats: "Internal promotions"
  }];
  const careerPaths = [{
    icon: Building2,
    title: "Technology & Engineering",
    roles: ["Software Engineers", "Data Scientists", "DevOps Engineers", "Product Managers"],
    description: "Build the next generation of hospitality management platforms"
  }, {
    icon: Users,
    title: "Operations & Management",
    roles: ["Property Managers", "Operations Directors", "Regional Managers", "Training Specialists"],
    description: "Drive operational excellence across our property portfolio"
  }, {
    icon: TrendingUp,
    title: "Sales & Business Development",
    roles: ["Account Executives", "Business Development", "Customer Success", "Partnership Managers"],
    description: "Expand our market presence and build lasting client relationships"
  }, {
    icon: Lightbulb,
    title: "Marketing & Creative",
    roles: ["Marketing Managers", "Content Creators", "Brand Designers", "Digital Specialists"],
    description: "Shape our brand story and drive market awareness"
  }];
  const benefits = [{
    category: "Health & Wellness",
    icon: Heart,
    perks: ["Medical, dental & vision", "Gym membership", "Wellness stipend"]
  }, {
    category: "Financial Security",
    icon: Shield,
    perks: ["Competitive pay + bonuses", "401(k) matching", "Stock options"]
  }, {
    category: "Work-Life Balance",
    icon: Coffee,
    perks: ["Remote flexibility", "Unlimited PTO", "Paid parental leave"]
  }, {
    category: "Growth & Development",
    icon: GraduationCap,
    perks: ["Learning budget", "Conference sponsorship", "Mentorship programs"]
  }];
  const testimonials = [{
    quote: "SmartLink provided incredible growth opportunities. The team values initiative and I've been able to take on meaningful projects.",
    author: "Alex Chen",
    title: "Software Engineer",
    tenure: "With SmartLink"
  }, {
    quote: "The collaborative culture here is exceptional. Every voice is heard, and innovation is genuinely encouraged at all levels.",
    author: "Sarah Martinez",
    title: "Product Manager",
    tenure: "Team member"
  }, {
    quote: "Great work-life balance. I can focus on delivering results while still having time for family and personal interests.",
    author: "David Kim",
    title: "Operations Director",
    tenure: "Team member"
  }];
  return <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
        
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-6 py-2 mb-8">
              <Rocket className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Join Our Mission</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-slate-900 leading-tight">
              Build Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Career</span>{" "}
              with SmartLink
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join a dynamic team building modern hospitality technology. Make an impact while 
              accelerating your professional growth in a fast-rising company.
            </p>
            
            <div className="flex flex-wrap justify-center gap-12 text-lg font-medium text-slate-600 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Growing Team</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Multiple Open Roles</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
                <span>Strong Culture</span>
              </div>
            </div>
            
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <a href="#open-positions">
                View Open Positions
                <ArrowRight className="ml-3 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      

      {/* Career Paths */}
      <section className="py-12 bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">Career Paths</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Explore diverse opportunities across our organization and find the perfect role to advance your career.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {careerPaths.map((path, index) => <Card key={index} className="bg-white border-0 shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="relative mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl"></div>
                      <path.icon className="h-6 w-6 text-white relative z-10 drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{path.title}</h3>
                  <p className="text-slate-600 mb-4 text-sm leading-relaxed">{path.description}</p>
                  
                  <div className="space-y-2">
                    {path.roles.map((role, roleIndex) => <div key={roleIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700 text-sm font-medium">{role}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Employee Testimonials */}
      

      {/* Benefits & Perks */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">Benefits & Perks</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive benefits designed to support your well-being, growth, and success at every stage of your career.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => <Card key={index} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-lg rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center relative overflow-hidden">
                      {/* Glossy overlay effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl"></div>
                      <benefit.icon className="h-6 w-6 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{benefit.category}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {benefit.perks.map((perk, perkIndex) => <div key={perkIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700">{perk}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">Open Positions</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Ready to take the next step in your career? Explore our current openings and find your perfect fit.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isLoading ? <div className="col-span-2 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-slate-600 mt-4">Loading positions...</p>
              </div> : jobs.length === 0 ? <div className="col-span-2 text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-full"></div>
                  <Briefcase className="h-12 w-12 text-white relative z-10 drop-shadow-lg" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">No Current Openings</h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                  While we don't have any open positions at the moment, we're always looking for exceptional talent to join our growing team.
                </p>
                <p className="text-slate-500 mb-8">
                  Send us your resume and we'll keep you in mind for future opportunities that match your skills and interests.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold" asChild>
                  <a href="mailto:careers@smartlink.com">
                    Submit Your Resume
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </div> : jobs.map(job => <Card key={job.id} className="bg-white border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{job.title}</h3>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            <span>{job.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{job.type}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {job.type}
                      </Badge>
                    </div>
                    
                    <p className="text-slate-600 mb-8 leading-relaxed line-clamp-3">
                      {job.description}
                    </p>
                    
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl" asChild>
                      <Link to={`/careers/${job.id}`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>)}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Join Our Team?</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Have questions about our open positions or want to learn more about working at SmartLink? Our HR team is here to help.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">+1 (720) 238-3008</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">careers@smartlinkmgt.com</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Monday - Friday, 9AM - 5PM EST</span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>;
};
export default Careers;