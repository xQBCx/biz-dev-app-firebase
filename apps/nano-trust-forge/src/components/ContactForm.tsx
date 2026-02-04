import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Building, User, Send } from "lucide-react";

const ContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    investor_type: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("leads").insert([formData]);

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Thank you for your interest. Our team will contact you shortly.",
      });

      setFormData({
        name: "",
        email: "",
        organization: "",
        investor_type: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container px-6">
        <div className="mx-auto max-w-4xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Request Investor Access
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Qualified institutional and accredited investors can request access to our
              Virtual Data Room for detailed documentation and investment materials.
            </p>
          </div>

          <Card className="border-2 border-border bg-card p-8 shadow-lg md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4 text-gold" />
                    Full Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Smith"
                    className="border-2 transition-all focus:border-gold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mail className="h-4 w-4 text-gold" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@institution.com"
                    className="border-2 transition-all focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Building className="h-4 w-4 text-gold" />
                    Organization
                  </label>
                  <Input
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Investment Firm LLC"
                    className="border-2 transition-all focus:border-gold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Investor Type
                  </label>
                  <Input
                    name="investor_type"
                    value={formData.investor_type}
                    onChange={handleChange}
                    placeholder="Institutional, Family Office, etc."
                    className="border-2 transition-all focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Message
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Please provide details about your investment interests and any specific questions..."
                  className="border-2 resize-none transition-all focus:border-gold"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group w-full bg-black text-white hover:bg-black/90 transition-all hover:scale-[1.02] disabled:opacity-50"
                size="lg"
              >
                {loading ? "Submitting..." : "Submit Request"}
                <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By submitting this form, you acknowledge that you are an accredited or institutional
                investor and agree to our confidentiality terms.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
