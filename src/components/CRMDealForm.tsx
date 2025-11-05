import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface CRMDealFormProps {
  dealId?: string;
  onSuccess?: () => void;
}

export const CRMDealForm = ({ dealId, onSuccess }: CRMDealFormProps) => {
  const { user } = useAuth();
  const { activeClientId } = useActiveClient();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    stage: "qualification",
    probability: "25",
    expected_close_date: "",
    description: "",
    deal_type: "",
    company_id: "",
    contact_id: "",
    recurring_revenue: "",
    recurring_type: "",
    commission_rate: "",
    upfront_amount: "",
  });

  useEffect(() => {
    if (user) {
      loadContactsAndCompanies();
    }
  }, [user, activeClientId]);

  const loadContactsAndCompanies = async () => {
    if (!user) return;
    
    try {
      const contactsQuery = supabase.from("crm_contacts").select("*").eq("user_id", user.id);
      const companiesQuery = supabase.from("crm_companies").select("*").eq("user_id", user.id);
      
      if (activeClientId) {
        contactsQuery.eq("client_id", activeClientId);
        companiesQuery.eq("client_id", activeClientId);
      } else {
        contactsQuery.is("client_id", null);
        companiesQuery.is("client_id", null);
      }
      
      const [contactsRes, companiesRes] = await Promise.all([contactsQuery, companiesQuery]);
      
      if (!contactsRes.error) setContacts(contactsRes.data || []);
      if (!companiesRes.error) setCompanies(companiesRes.data || []);
    } catch (error) {
      console.error("Error loading contacts/companies:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("crm_deals")
        .insert({
          name: formData.name,
          deal_type: formData.deal_type || null,
          description: formData.description || null,
          stage: formData.stage,
          user_id: user.id,
          client_id: activeClientId || null,
          company_id: formData.company_id || null,
          contact_id: formData.contact_id || null,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          probability: formData.probability ? parseInt(formData.probability) : 0,
          expected_close_date: formData.expected_close_date || null,
          recurring_revenue: formData.recurring_revenue ? parseFloat(formData.recurring_revenue) : null,
          recurring_type: formData.recurring_type || null,
          commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null,
          upfront_amount: formData.upfront_amount ? parseFloat(formData.upfront_amount) : null,
        });

      if (error) throw error;

      toast.success("Deal created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/crm");
      }
    } catch (error) {
      console.error("Error creating deal:", error);
      toast.error("Failed to create deal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="name">Deal Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Customer Linking */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="company_id">Company</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Link this deal to a company in your CRM</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.company_id}
              onValueChange={(value) => setFormData({ ...formData, company_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="contact_id">Contact</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Link this deal to a specific contact person</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.contact_id}
              onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Revenue Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="amount">One-Time Amount ($)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total value of one-time charges or project cost</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="upfront_amount">Upfront SPIFF ($)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sales Performance Incentive Fund - one-time bonus payment</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="upfront_amount"
              type="number"
              step="0.01"
              value={formData.upfront_amount}
              onChange={(e) => setFormData({ ...formData, upfront_amount: e.target.value })}
            />
          </div>
        </div>

        {/* Recurring Revenue */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="recurring_revenue">Monthly Recurring ($)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Monthly recurring revenue (e.g., internet service fee)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="recurring_revenue"
              type="number"
              step="0.01"
              value={formData.recurring_revenue}
              onChange={(e) => setFormData({ ...formData, recurring_revenue: e.target.value })}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="commission_rate">Commission Rate (%)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Percentage of monthly recurring revenue paid as commission</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="commission_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.commission_rate}
              onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="recurring_type">Recurring Type</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Frequency of recurring payments</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.recurring_type}
              onValueChange={(value) => setFormData({ ...formData, recurring_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="probability">Win Probability (%)</Label>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
            />
          </div>
        </div>

        {/* Deal Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="stage">Deal Stage</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current stage in your sales pipeline</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.stage}
              onValueChange={(value) => setFormData({ ...formData, stage: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualification">Qualification</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expected_close_date">Expected Close Date</Label>
            <Input
              id="expected_close_date"
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="deal_type">Deal Type</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Category of the deal (e.g., "Internet Service", "Fiber Install", "Enterprise Contract")</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="deal_type"
            value={formData.deal_type}
            onChange={(e) => setFormData({ ...formData, deal_type: e.target.value })}
            placeholder="e.g., Internet Service, Fiber Install"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Add notes, requirements, or important details about this deal..."
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Creating..." : "Create Deal"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/crm")}>
            Cancel
          </Button>
        </div>
      </form>
    </TooltipProvider>
  );
};
