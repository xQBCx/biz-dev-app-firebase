import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Instagram, ArrowRight, Sparkles, Star, Shield, Zap, Rocket } from "lucide-react";
const Footer = () => {
  return <footer className="relative bg-black text-white overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.1),transparent_40%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(147,51,234,0.1),transparent_40%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30"></div>
      
      {/* Floating accent elements */}
      <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -translate-x-24 sm:-translate-x-32 -translate-y-24 sm:-translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-gradient-to-tl from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl translate-x-16 sm:translate-x-24 translate-y-16 sm:translate-y-24"></div>
      
      {/* Minimal floating particles */}
      <div className="absolute top-20 left-20 w-1 h-1 bg-blue-400/40 rounded-full animate-pulse hidden sm:block"></div>
      <div className="absolute bottom-20 right-20 w-1 h-1 bg-purple-400/40 rounded-full animate-pulse hidden sm:block" style={{
      animationDelay: '1s'
    }}></div>
      <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-indigo-300/60 rounded-full animate-pulse hidden sm:block" style={{
      animationDelay: '2s'
    }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        {/* Top Section with Enhanced Branding */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-all duration-500 group-hover:rotate-3">
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl sm:rounded-2xl"></div>
                {/* Inner glow */}
                <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-lg sm:rounded-xl blur-sm"></div>
                <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-white relative z-10 drop-shadow-lg group-hover:rotate-12 transition-transform duration-300" />
              </div>
              {/* Enhanced logo glow */}
              <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/40 to-purple-700/40 rounded-xl sm:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              {/* Floating particles effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-1 -left-1 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                <div className="absolute -top-2 right-1 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-300"></div>
                <div className="absolute -bottom-1 -left-2 w-1 h-1 bg-blue-200 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
            <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-wide hover:tracking-wider transition-all duration-300">
              SmartLink
            </span>
          </div>
          <p className="text-sm sm:text-base lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
            Professional property management solutions powered by{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
              intelligent technology
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-blue-400" />
              <h3 className="font-bold text-white text-lg sm:text-xl lg:text-2xl">About SmartLink</h3>
            </div>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed">Transforming hospitality operations with Tech-powered workflows and comprehensive training systems.</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 border border-white/20">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                <span className="text-xs sm:text-sm font-medium text-white">SOC2 Compliant</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-purple-400" />
              <h3 className="font-bold text-white text-lg sm:text-xl lg:text-2xl">Navigation</h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {[{
              to: "/about",
              label: "About"
            }, {
              to: "/who-we-manage",
              label: "Who We Manage"
            }, {
              to: "/partner-with-us",
              label: "Partner With Us"
            }, {
              to: "/careers",
              label: "Careers"
            }].map((link, index) => <li key={index}>
                  <Link to={link.to} className="group flex items-center gap-2 text-sm sm:text-base text-white/80 hover:text-white transition-all duration-300 min-h-[40px] sm:min-h-0">
                    <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* SmartLink OS */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-indigo-400" />
              <h3 className="font-bold text-white text-lg sm:text-xl lg:text-2xl">SmartLink OS</h3>
            </div>
            <ul className="space-y-2 sm:space-y-3">
              {[{
              to: "/smartlink-os",
              label: "Platform Overview"
            }, {
              to: "/os/login",
              label: "Dashboard Login"
            }].map((link, index) => <li key={index}>
                  <Link to={link.to} className="group flex items-center gap-2 text-sm sm:text-base text-white/80 hover:text-white transition-all duration-300 min-h-[40px] sm:min-h-0">
                    <div className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>)}
            </ul>
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-4 sm:mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">24/7 Support</span>
              </div>
              <p className="text-xs text-white/85">Expert assistance whenever you need it</p>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-green-400" />
              <h3 className="font-bold text-white text-lg sm:text-xl lg:text-2xl">Get in Touch</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-white/85 hover:text-white transition-colors duration-300 group min-h-[40px] sm:min-h-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 group-hover:text-white transition-colors duration-300 flex-shrink-0" />
                <span className="break-all">support@smartlinkmgt.com</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-white/85 hover:text-white transition-colors duration-300 group min-h-[40px] sm:min-h-0">
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 group-hover:text-white transition-colors duration-300 flex-shrink-0" />
                <span>(720) 238-3008  </span>
              </div>
              <Link to="/contact" className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-white/85 hover:text-white transition-colors duration-300 group min-h-[40px] sm:min-h-0">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400 group-hover:text-white transition-colors duration-300 flex-shrink-0" />
                <span>Contact Form</span>
              </Link>
            </div>
            
            {/* Social Links */}
            <div className="pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3">Follow Us</p>
              <div className="flex items-center gap-2 sm:gap-3">
                {[{
                icon: Linkedin,
                color: "text-blue-400"
              }, {
                icon: Instagram,
                color: "text-purple-400"
              }].map((social, index) => <button key={index} className="w-10 h-10 sm:w-11 sm:h-11 bg-white/5 hover:bg-white/15 border border-white/20 hover:border-white/40 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group touch-target">
                    <social.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${social.color} group-hover:text-white transition-colors duration-300`} />
                  </button>)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-6 sm:pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-white/60 text-xs sm:text-sm text-center sm:text-left">
              <p>© 2026 SmartLink. All rights reserved.</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <Link to="/future-vision" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
                <span className="hidden sm:inline">•</span>
                <Link to="/future-vision" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:gap-3 text-white/40 text-[10px] sm:text-xs">
                <span>v{import.meta.env.VITE_APP_VERSION || '1.0.0'}</span>
                <span>•</span>
                <span>Build: {import.meta.env.VITE_GIT_SHA?.substring(0, 7) || 'dev'}</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] sm:text-xs font-medium text-white">All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;