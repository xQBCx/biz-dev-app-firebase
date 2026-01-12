import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

export default function BdSrvsContact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission - in production, this would call an edge function
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Message sent! I'll be in touch shortly.");
  };

  return (
    <>
      <Helmet>
        <title>Contact | Bill Mercer - BDSRVS</title>
        <meta name="description" content="Get in touch with Bill Mercer for strategic consulting, advisory engagements, or to discuss your business challenges." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/bdsrvs" className="text-xl font-bold tracking-tight">
              BDSRVS
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link to="/bdsrvs/about" className="text-slate-300 hover:text-white transition-colors">About</Link>
              <Link to="/bdsrvs/services" className="text-slate-300 hover:text-white transition-colors">Services</Link>
              <Link to="/bdsrvs/casework" className="text-slate-300 hover:text-white transition-colors">Casework</Link>
              <Link to="/bdsrvs/contact" className="text-white font-medium">Contact</Link>
            </nav>
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link to="/auth">Enter Platform</Link>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/bdsrvs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-slate-300 mb-12">
              Whether you have a specific project in mind or just want to explore possibilities—I'm here to help.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="md:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Send a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">Message Sent!</h3>
                        <p className="text-slate-400 mb-6">
                          Thank you for reaching out. I typically respond within 24 business hours.
                        </p>
                        <Button onClick={() => setIsSubmitted(false)} variant="outline" className="border-slate-600">
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Name</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="bg-slate-900 border-slate-700 text-white"
                              placeholder="Your name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="bg-slate-900 border-slate-700 text-white"
                              placeholder="you@company.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-slate-300">Company (Optional)</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-white"
                            placeholder="Your company name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-slate-300">Message</Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="bg-slate-900 border-slate-700 text-white min-h-[150px]"
                            placeholder="Tell me about your project, challenge, or question..."
                          />
                        </div>

                        <div className="flex items-start gap-2 text-sm text-slate-400">
                          <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p>Your information is kept confidential and will never be shared with third parties.</p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Message"
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info Sidebar */}
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Email</p>
                        <a href="mailto:bill@bdsrvs.com" className="text-white hover:text-primary transition-colors">
                          bill@bdsrvs.com
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">
                      Typically respond within 24 business hours.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Schedule a Call</p>
                        <p className="text-white">30-minute consultation</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                      <a href="https://calendly.com/billmercer" target="_blank" rel="noopener noreferrer">
                        Book Time
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Existing Clients</p>
                        <p className="text-white">Use the Biz Dev App</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Link to="/auth">Enter Platform</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-slate-800">
          <div className="max-w-6xl mx-auto text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} BDSRVS. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
