import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";

export default function MarketplaceCreateMarketer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    bio: "",
    experience_years: "",
    portfolio_url: "",
    min_commission_rate: "",
  });
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState("");
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState("");
  const [marketingChannels, setMarketingChannels] = useState<string[]>([]);
  const [channelInput, setChannelInput] = useState("");

  const addTag = (value: string, setter: (arr: string[]) => void, current: string[]) => {
    if (value.trim() && !current.includes(value.trim())) {
      setter([...current, value.trim()]);
    }
  };

  const removeTag = (index: number, setter: (arr: string[]) => void, current: string[]) => {
    setter(current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a marketer profile");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("marketer_profiles").insert({
        user_id: user.id,
        business_name: formData.business_name,
        bio: formData.bio,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        portfolio_url: formData.portfolio_url || null,
        min_commission_rate: formData.min_commission_rate ? parseFloat(formData.min_commission_rate) : null,
        specialization,
        target_industries: targetIndustries,
        marketing_channels: marketingChannels,
      });

      if (error) throw error;

      toast.success("Marketer profile created successfully!");
      navigate("/marketplace/marketers");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace/marketers")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketers
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Create Marketer Profile</CardTitle>
            <CardDescription>
              Showcase your expertise and connect with product owners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Your agency or business name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell product owners about your marketing expertise and track record"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of Experience</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    placeholder="e.g., 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="min_commission_rate">Min Commission Rate (%)</Label>
                  <Input
                    id="min_commission_rate"
                    type="number"
                    step="0.01"
                    value={formData.min_commission_rate}
                    onChange={(e) => setFormData({ ...formData, min_commission_rate: e.target.value })}
                    placeholder="e.g., 15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specializations</Label>
                <div className="flex gap-2">
                  <Input
                    id="specialization"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(specInput, setSpecialization, specialization);
                        setSpecInput("");
                      }
                    }}
                    placeholder="e.g., SEO, Social Media, Content Marketing"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addTag(specInput, setSpecialization, specialization);
                      setSpecInput("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialization.map((spec, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {spec}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(idx, setSpecialization, specialization)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_industries">Target Industries</Label>
                <div className="flex gap-2">
                  <Input
                    id="target_industries"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(industryInput, setTargetIndustries, targetIndustries);
                        setIndustryInput("");
                      }
                    }}
                    placeholder="e.g., SaaS, E-commerce, Healthcare"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addTag(industryInput, setTargetIndustries, targetIndustries);
                      setIndustryInput("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {targetIndustries.map((industry, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {industry}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(idx, setTargetIndustries, targetIndustries)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketing_channels">Marketing Channels</Label>
                <div className="flex gap-2">
                  <Input
                    id="marketing_channels"
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(channelInput, setMarketingChannels, marketingChannels);
                        setChannelInput("");
                      }
                    }}
                    placeholder="e.g., Google Ads, Facebook, Email"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addTag(channelInput, setMarketingChannels, marketingChannels);
                      setChannelInput("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {marketingChannels.map((channel, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {channel}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(idx, setMarketingChannels, marketingChannels)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/marketplace/marketers")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
