import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Store, Upload, DollarSign, Loader2 } from "lucide-react";

export default function AIProviderPortal() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    displayName: "",
    website: "",
    description: "",
    contactName: "",
    contactEmail: user?.email || "",
    contactPhone: "",
    apiEndpoint: "",
    redemptionUrl: "",
    webhookUrl: "",
    proposedWholesalePercent: "60",
    affiliatePercent: "5",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a provider application.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    try {
      // Create provider record
      const { data: provider, error: providerError } = await supabase
        .from("ai_providers")
        .insert({
          user_id: user!.id,
          company_name: formData.companyName,
          display_name: formData.displayName,
          website: formData.website,
          description: formData.description,
          api_endpoint: formData.apiEndpoint,
          redemption_url: formData.redemptionUrl,
          webhook_url: formData.webhookUrl,
          status: "pending",
          terms_accepted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (providerError) throw providerError;

      // Create application record
      const { error: applicationError } = await supabase
        .from("ai_provider_applications")
        .insert({
          provider_id: provider.id,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          application_data: {
            wholesale_percent: formData.proposedWholesalePercent,
            affiliate_percent: formData.affiliatePercent,
          },
        });

      if (applicationError) throw applicationError;

      // Create affiliate terms
      const { error: affiliateError } = await supabase
        .from("ai_affiliate_terms")
        .insert({
          provider_id: provider.id,
          lifetime_commission_percent: parseFloat(formData.affiliatePercent),
        });

      if (affiliateError) throw affiliateError;

      toast({
        title: "Application Submitted!",
        description: "Your provider application has been submitted for review. You'll be notified once approved.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))]">
            Provider Portal
          </h1>
          <p className="text-lg text-muted-foreground">
            Join our AI Gift Cards marketplace and reach customers worldwide
          </p>
        </div>

        <Card className="border-[hsl(var(--neon-blue))]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[hsl(var(--neon-blue))]" />
              Provider Application
            </CardTitle>
            <CardDescription>
              Complete this application to start selling AI credits through our platform. All applications require admin approval before going live.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Company Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="AI Corp Inc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="AI Corp"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your AI service and what users can do with credits..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Technical Integration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Technical Integration</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint (for credit issuance)</Label>
                  <Input
                    id="apiEndpoint"
                    type="url"
                    value={formData.apiEndpoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                    placeholder="https://api.example.com/credits"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll call this endpoint to issue credits when a card is redeemed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redemptionUrl">Redemption URL *</Label>
                  <Input
                    id="redemptionUrl"
                    type="url"
                    required
                    value={formData.redemptionUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, redemptionUrl: e.target.value }))}
                    placeholder="https://example.com/redeem"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where customers will be redirected to complete redemption
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
                    placeholder="https://example.com/webhooks/aigiftcards"
                  />
                  <p className="text-xs text-muted-foreground">
                    For receiving postback notifications about new accounts and spend events
                  </p>
                </div>
              </div>

              {/* Pricing Terms */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[hsl(var(--neon-purple))]" />
                  Proposed Pricing Terms
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wholesalePercent">Wholesale Price (% of face value) *</Label>
                    <Input
                      id="wholesalePercent"
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={formData.proposedWholesalePercent}
                      onChange={(e) => setFormData(prev => ({ ...prev, proposedWholesalePercent: e.target.value }))}
                      placeholder="60"
                    />
                    <p className="text-xs text-muted-foreground">
                      Default: 50-75% of face value
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="affiliatePercent">Lifetime Affiliate Commission % *</Label>
                    <Input
                      id="affiliatePercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      value={formData.affiliatePercent}
                      onChange={(e) => setFormData(prev => ({ ...prev, affiliatePercent: e.target.value }))}
                      placeholder="5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Commission on all future purchases by referred customers
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  By submitting this application, you agree to our provider terms including payment processing, 
                  data privacy, and marketplace guidelines. Your application will be reviewed by our team.
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
