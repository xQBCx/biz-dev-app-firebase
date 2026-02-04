import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const NewsFooter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // TODO: Add actual newsletter subscription logic
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Thanks for subscribing! You'll hear from us soon.");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <footer className="bg-[hsl(var(--news-text))] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Stay in the Loop
            </h3>
            <p className="text-white/60 mb-8">
              Get exclusive interviews, business intelligence, and industry insights 
              delivered to your inbox every week.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[hsl(var(--news-accent))]"
                  required
                />
              </div>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[hsl(var(--news-accent))] hover:bg-[hsl(var(--news-accent))]/90 text-[hsl(var(--news-accent-foreground))] font-medium px-6"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/news" className="inline-block mb-4">
              <span className="text-3xl font-serif font-bold">
                BizDev<span className="text-[hsl(var(--news-accent))]">.</span>news
              </span>
            </Link>
            <p className="text-white/60 mb-6 max-w-sm">
              The premier destination for business development intelligence, 
              exclusive interviews, and actionable insights for modern professionals.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://x.com/bizdevnews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(var(--news-accent))] transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com/company/bizdevnews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(var(--news-accent))] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com/bizdevnews" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[hsl(var(--news-accent))] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white/90">Explore</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/news?category=interview" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  Interviews
                </Link>
              </li>
              <li>
                <Link to="/news?category=tech_brief" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  Tech Briefs
                </Link>
              </li>
              <li>
                <Link to="/news?category=news" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  Business News
                </Link>
              </li>
              <li>
                <Link to="/news?category=analysis" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-white/90">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/submit-story" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  Submit a Story
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="text-white/60 hover:text-[hsl(var(--news-accent))] transition-colors">
                  Advertise
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
          <p>© {new Date().getFullYear()} BizDev.news. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white/60 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
