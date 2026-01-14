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
import bizdevLogo from "@/assets/bizdev-monogram.png";

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

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/bdsrvs" className="flex items-center gap-3">
              <img src={bizdevLogo} alt="Biz Dev" className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight text-foreground">BDSRVS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <Link to="/bdsrvs/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/bdsrvs/services" className="text-muted-foreground hover:text-foreground transition-colors">Services</Link>
              <Link to="/bdsrvs/contact" className="text-foreground font-medium">Contact</Link>
            </nav>
            <Button asChild>
              <Link to="/auth">Enter Platform</Link>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <Link to="/bdsrvs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="text-4xl font-bold mb-4 text-foreground">Get in Touch</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Whether you have a specific project in mind or just want to explore possibilities—I'm here to help.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="md:col-span-2">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Send a Message</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                        <p className="text-muted-foreground mb-6">
                          Thank you for reaching out. I typically respond within 24 business hours.
                        </p>
                        <Button onClick={() => setIsSubmitted(false)} variant="outline">
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground">Name</Label>
                            <Input
                              id="name"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="bg-background border-border text-foreground"
                              placeholder="Your name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="bg-background border-border text-foreground"
                              placeholder="you@company.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-foreground">Company (Optional)</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="bg-background border-border text-foreground"
                            placeholder="Your company name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-foreground">Message</Label>
                          <Textarea
                            id="message"
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="bg-background border-border text-foreground min-h-[150px]"
                            placeholder="Tell me about your project, challenge, or question..."
                          />
                        </div>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
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
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href="mailto:bill@bdsrvs.com" className="text-foreground hover:underline transition-colors">
                          bill@bdsrvs.com
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Typically respond within 24 business hours.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Schedule a Call</p>
                        <p className="text-foreground">30-minute consultation</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/book/bill-mercer">
                        Book Time
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Existing Clients</p>
                        <p className="text-foreground">Use the Biz Dev App</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth">Enter Platform</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border">
          <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} BDSRVS. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
