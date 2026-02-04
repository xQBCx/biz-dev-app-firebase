import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { 
  Sparkles, 
  Globe, 
  Rocket,
  ArrowRight,
  Layout,
  Zap
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WebsiteBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    industry: "",
    targetAudience: "",
    generationMethod: "ai_generated" as "ai_generated" | "template_based" | "hybrid",
  });

  const industries = [
    "auto_detailing",
    "restaurant",
    "fitness",
    "legal",
    "real_estate",
    "healthcare",
    "retail",
    "technology",
    "consulting",
    "other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please sign in to generate websites");
      return;
    }

    if (!formData.businessName || !formData.businessDescription) {
      toast.error("Please fill in business name and description");
      return;
    }

    setIsGenerating(true);

    try {
      // Call AI generation function
      const { data: generatedData, error: aiError } = await supabase.functions.invoke('generate-webpage', {
        body: formData
      });

      if (aiError) throw aiError;

      // Create unique domain slug from business name
      const baseSlug = formData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const uniqueSuffix = Date.now().toString(36);
      const domainSlug = `${baseSlug}-${uniqueSuffix}`;

      // Save to database
      const { data: website, error: dbError } = await supabase
        .from('generated_websites')
        .insert({
          user_id: user.id,
          business_name: formData.businessName,
          business_description: formData.businessDescription,
          industry: formData.industry,
          target_audience: formData.targetAudience,
          domain_slug: domainSlug,
          title: generatedData.title,
          meta_description: generatedData.metaDescription,
          generation_method: formData.generationMethod,
          sections: generatedData.sections,
          theme: generatedData.theme,
          ai_tokens_used: generatedData.tokensUsed || 0,
          status: 'draft'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Track usage
      await supabase.from('website_usage_tracking').insert({
        user_id: user.id,
        website_id: website.id,
        action_type: 'generate',
        ai_tokens: generatedData.tokensUsed || 0
      });

      toast.success("Website generated successfully!");
      navigate(`/websites/${website.id}`);

    } catch (error: any) {
      console.error('Generation error:', error);
      
      if (error.message?.includes('429')) {
        toast.error("Rate limit exceeded. Please wait a moment and try again.");
      } else if (error.message?.includes('402')) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error(error.message || "Failed to generate website");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Website Builder</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Build a professional website in minutes. Just describe your business and let AI do the rest.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="p-6 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">Go from zero to a complete website in under 2 minutes</p>
          </Card>
          <Card className="p-6 text-center">
            <Layout className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Professional Design</h3>
            <p className="text-sm text-muted-foreground">Industry-optimized layouts and best practices built-in</p>
          </Card>
          <Card className="p-6 text-center">
            <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Fully Integrated</h3>
            <p className="text-sm text-muted-foreground">Connect CRM, forms, and other Biz Dev tools seamlessly</p>
          </Card>
        </div>

        {/* Generation Form */}
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessName" className="text-base">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="e.g., Shine Auto Detailing"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="businessDescription" className="text-base">Business Description *</Label>
              <Textarea
                id="businessDescription"
                placeholder="Describe what your business does, what makes it unique, and who you serve..."
                value={formData.businessDescription}
                onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                className="mt-2 min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: Include key services, unique selling points, and your target customers
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="industry" className="text-base">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleInputChange("industry", value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select industry (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience" className="text-base">Target Audience</Label>
                <Input
                  id="targetAudience"
                  placeholder="e.g., luxury car owners"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="pt-6 border-t">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !formData.businessName || !formData.businessDescription}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Generating Your Website...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Generate Website
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What happens next?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ AI generates professional copy tailored to your business</li>
            <li>✓ Creates industry-optimized layout with best practices</li>
            <li>✓ Suggests relevant images and design elements</li>
            <li>✓ Sets up forms and CTAs that convert</li>
            <li>✓ You can customize everything before publishing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}