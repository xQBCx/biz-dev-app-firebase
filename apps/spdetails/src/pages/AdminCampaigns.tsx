import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Mail, MessageSquare, Phone, Megaphone, Play, Pause, BarChart3 } from "lucide-react";

type CampaignType = 'email' | 'sms' | 'direct_mail' | 'phone' | 'social_media' | 'google_ads';
type LeadType = 'office_building' | 'golf_course' | 'high_income_neighborhood' | 'dealership_small' | 'dealership_luxury' | 'fleet_company';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  campaign_type: CampaignType;
  target_lead_types: LeadType[];
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
}

const campaignTypeLabels: Record<CampaignType, { label: string; icon: React.ElementType }> = {
  email: { label: "Email Campaign", icon: Mail },
  sms: { label: "SMS Campaign", icon: MessageSquare },
  direct_mail: { label: "Direct Mail", icon: Mail },
  phone: { label: "Phone Outreach", icon: Phone },
  social_media: { label: "Social Media", icon: Megaphone },
  google_ads: { label: "Google Ads", icon: BarChart3 }
};

const leadTypeLabels: Record<LeadType, string> = {
  office_building: "Office Buildings",
  golf_course: "Golf Courses",
  high_income_neighborhood: "High-Income Neighborhoods",
  dealership_small: "Small/Medium Dealerships",
  dealership_luxury: "Luxury Dealerships",
  fleet_company: "Fleet Companies"
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800"
};

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    campaign_type: "email" as CampaignType,
    target_lead_types: [] as LeadType[],
    budget: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch campaigns", variant: "destructive" });
    } else {
      setCampaigns(data || []);
    }
    setLoading(false);
  };

  const handleAddCampaign = async () => {
    if (!newCampaign.name) {
      toast({ title: "Error", description: "Campaign name is required", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('marketing_campaigns').insert({
      name: newCampaign.name,
      description: newCampaign.description || null,
      campaign_type: newCampaign.campaign_type,
      target_lead_types: newCampaign.target_lead_types,
      budget: newCampaign.budget ? parseFloat(newCampaign.budget) : null,
      status: 'draft'
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Campaign created!" });
      setIsAddDialogOpen(false);
      setNewCampaign({
        name: "",
        description: "",
        campaign_type: "email",
        target_lead_types: [],
        budget: ""
      });
      fetchCampaigns();
    }
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    const { error } = await supabase
      .from('marketing_campaigns')
      .update({ status: newStatus })
      .eq('id', campaignId);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Campaign status updated" });
      fetchCampaigns();
    }
  };

  const toggleLeadType = (type: LeadType) => {
    setNewCampaign(prev => ({
      ...prev,
      target_lead_types: prev.target_lead_types.includes(type)
        ? prev.target_lead_types.filter(t => t !== type)
        : [...prev.target_lead_types, type]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage marketing campaigns</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Set up a new marketing campaign</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input 
                  value={newCampaign.name} 
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  placeholder="Q1 Fleet Company Outreach"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={newCampaign.description} 
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                  placeholder="Campaign goals and strategy..."
                />
              </div>
              <div>
                <Label>Campaign Type</Label>
                <Select 
                  value={newCampaign.campaign_type} 
                  onValueChange={(v) => setNewCampaign({...newCampaign, campaign_type: v as CampaignType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(campaignTypeLabels).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audiences</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(leadTypeLabels).map(([value, label]) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={value}
                        checked={newCampaign.target_lead_types.includes(value as LeadType)}
                        onCheckedChange={() => toggleLeadType(value as LeadType)}
                      />
                      <label htmlFor={value} className="text-sm">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Budget ($)</Label>
                <Input 
                  type="number"
                  value={newCampaign.budget} 
                  onChange={(e) => setNewCampaign({...newCampaign, budget: e.target.value})}
                  placeholder="1000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCampaign}>Create Campaign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaign Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {campaigns.filter(c => c.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${campaigns.reduce((sum, c) => sum + (c.budget || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No campaigns yet. Create your first campaign to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target Audiences</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const TypeIcon = campaignTypeLabels[campaign.campaign_type]?.icon || Megaphone;
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="font-medium">{campaign.name}</div>
                        {campaign.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {campaign.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          <span>{campaignTypeLabels[campaign.campaign_type]?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {campaign.target_lead_types?.slice(0, 2).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {leadTypeLabels[type]?.split(' ')[0]}
                            </Badge>
                          ))}
                          {(campaign.target_lead_types?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{campaign.target_lead_types.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.budget ? `$${campaign.budget.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {campaign.status === 'draft' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            >
                              <Play className="h-3 w-3 mr-1" /> Launch
                            </Button>
                          )}
                          {campaign.status === 'active' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                            >
                              <Pause className="h-3 w-3 mr-1" /> Pause
                            </Button>
                          )}
                          {campaign.status === 'paused' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateCampaignStatus(campaign.id, 'active')}
                            >
                              <Play className="h-3 w-3 mr-1" /> Resume
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
