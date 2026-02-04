import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Building2, 
  User, 
  Send, 
  Phone,
  Shield,
  AlertTriangle
} from "lucide-react";
import { QBCDecryptedText, QBCStaticText } from "@/components/QBCDecryptedText";

const agencies = [
  "Department of Defense (DoD)",
  "National Security Agency (NSA)",
  "Central Intelligence Agency (CIA)",
  "Department of Homeland Security (DHS)",
  "National Nuclear Security Administration (NNSA)",
  "Cybersecurity and Infrastructure Security Agency (CISA)",
  "Defense Advanced Research Projects Agency (DARPA)",
  "Defense Innovation Unit (DIU)",
  "Federal Bureau of Investigation (FBI)",
  "Department of Energy (DOE)",
  "Department of State",
  "Space Force",
  "National Reconnaissance Office (NRO)",
  "Intelligence Community (IC) - Other",
  "Defense Contractor",
  "Other Federal Agency",
  "State/Local Government",
  "Allied Foreign Government",
];

const clearanceLevels = [
  "Unclassified",
  "Confidential",
  "Secret",
  "Top Secret",
  "TS/SCI",
  "Prefer Not to Say",
];

const interestAreas = [
  "Nuclear Command & Control",
  "Critical Infrastructure Protection",
  "Intelligence Communications",
  "Defense Communications",
  "Satellite/Space Systems",
  "Tactical Field Operations",
  "Quantum-Resistant Encryption",
  "Identity & Access Management",
  "Supply Chain Security",
  "General Cybersecurity",
];

const urgencyLevels = [
  "Exploratory - Information Gathering",
  "Active Evaluation - Timeline 6+ Months",
  "Priority - Timeline 3-6 Months",
  "Urgent - Immediate Need",
];

const GovernmentContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    agency: "",
    role_title: "",
    clearance_level: "",
    interest_area: "",
    urgency_level: "",
    preferred_contact: "email",
    message: "",
    request_classified_briefing: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("government_leads").insert([formData]);

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your inquiry has been received. A cleared representative will contact you within 48 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        agency: "",
        role_title: "",
        clearance_level: "",
        interest_area: "",
        urgency_level: "",
        preferred_contact: "email",
        message: "",
        request_classified_briefing: false,
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <Card className="border-2 border-primary/30 bg-card/80 backdrop-blur-sm p-8 md:p-10">
      {/* Official Use Notice */}
      <div className="mb-8 p-4 rounded-lg bg-quantum-blue/10 border border-quantum-blue/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-quantum-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              For Official Use Only
            </p>
            <p className="text-xs text-muted-foreground">
              This form is intended for U.S. Government officials, defense contractors with active clearances, 
              and allied government representatives. All inquiries are logged and may be subject to verification.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4 text-primary" />
              Full Name *
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Full legal name"
              className="border-2 transition-all focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail className="h-4 w-4 text-primary" />
              Official Email *
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="name@agency.gov"
              className="border-2 transition-all focus:border-primary"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Phone className="h-4 w-4 text-primary" />
              Phone (Secure Line Preferred)
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="border-2 transition-all focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Role/Title
            </label>
            <Input
              name="role_title"
              value={formData.role_title}
              onChange={handleChange}
              placeholder="e.g., Program Manager, CISO, Acquisition Officer"
              className="border-2 transition-all focus:border-primary"
            />
          </div>
        </div>

        {/* Agency & Clearance */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Agency/Department *
            </label>
            <Select 
              value={formData.agency} 
              onValueChange={(value) => handleSelectChange("agency", value)}
            >
              <SelectTrigger className="border-2 focus:border-primary">
                <SelectValue placeholder="Select agency" />
              </SelectTrigger>
              <SelectContent>
                {agencies.map((agency) => (
                  <SelectItem key={agency} value={agency}>
                    {agency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Clearance Level
            </label>
            <Select 
              value={formData.clearance_level} 
              onValueChange={(value) => handleSelectChange("clearance_level", value)}
            >
              <SelectTrigger className="border-2 focus:border-primary">
                <SelectValue placeholder="Select clearance level" />
              </SelectTrigger>
              <SelectContent>
                {clearanceLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interest & Urgency */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Primary Interest Area *
            </label>
            <Select 
              value={formData.interest_area} 
              onValueChange={(value) => handleSelectChange("interest_area", value)}
            >
              <SelectTrigger className="border-2 focus:border-primary">
                <SelectValue placeholder="Select interest area" />
              </SelectTrigger>
              <SelectContent>
                {interestAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Urgency Level
            </label>
            <Select 
              value={formData.urgency_level} 
              onValueChange={(value) => handleSelectChange("urgency_level", value)}
            >
              <SelectTrigger className="border-2 focus:border-primary">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preferred Contact */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Preferred Contact Method
          </label>
          <Select 
            value={formData.preferred_contact} 
            onValueChange={(value) => handleSelectChange("preferred_contact", value)}
          >
            <SelectTrigger className="border-2 focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="secure_channel">Secure Channel (to be arranged)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Mission Requirements / Questions
          </label>
          <Textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            placeholder="Describe your operational requirements, specific use cases, or questions about QBC capabilities..."
            className="border-2 resize-none transition-all focus:border-primary"
          />
        </div>

        {/* Classified Briefing */}
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
          <Checkbox
            id="classified_briefing"
            checked={formData.request_classified_briefing}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, request_classified_briefing: checked as boolean })
            }
          />
          <div className="space-y-1">
            <label htmlFor="classified_briefing" className="text-sm font-medium text-foreground cursor-pointer">
              Request Classified Briefing
            </label>
            <p className="text-xs text-muted-foreground">
              If you require discussion of classified operational scenarios, check this box. 
              Our cleared personnel will coordinate through appropriate channels.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !formData.name || !formData.email || !formData.agency || !formData.interest_area}
          className="group w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-50"
          size="lg"
        >
          {loading ? "Submitting..." : "Submit Official Inquiry"}
          <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          All submissions are encrypted in transit and at rest. Information provided will be handled 
          in accordance with applicable security protocols and will not be shared with unauthorized parties.
        </p>
      </form>
    </Card>
  );
};

export default GovernmentContactForm;
