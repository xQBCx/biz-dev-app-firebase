import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  FileText,
  Sparkles,
  Users,
  TrendingUp,
  Loader2,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Property = Tables<"properties">;
type PropertyStatus = Enums<"property_status">;

const STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: "NEW_LEAD", label: "New Lead" },
  { value: "ANALYZED", label: "Analyzed" },
  { value: "SELLER_OUTREACH", label: "Seller Outreach" },
  { value: "SELLER_NEGOTIATING", label: "Negotiating" },
  { value: "UNDER_CONTRACT", label: "Under Contract" },
  { value: "BUYER_MARKETING", label: "Buyer Marketing" },
  { value: "BUYER_FOUND", label: "Buyer Found" },
  { value: "ASSIGNMENT_DRAFTED", label: "Assignment Drafted" },
  { value: "SENT_TO_TITLE", label: "Sent to Title" },
  { value: "CLOSED", label: "Closed" },
  { value: "DEAD", label: "Dead" },
];

const statusColors: Record<string, string> = {
  NEW_LEAD: "bg-info/10 text-info border-info/20",
  ANALYZED: "bg-primary/10 text-primary border-primary/20",
  SELLER_OUTREACH: "bg-warning/10 text-warning border-warning/20",
  SELLER_NEGOTIATING: "bg-warning/10 text-warning border-warning/20",
  UNDER_CONTRACT: "bg-success/10 text-success border-success/20",
  BUYER_MARKETING: "bg-primary/10 text-primary border-primary/20",
  BUYER_FOUND: "bg-success/10 text-success border-success/20",
  ASSIGNMENT_DRAFTED: "bg-primary/10 text-primary border-primary/20",
  SENT_TO_TITLE: "bg-success/10 text-success border-success/20",
  CLOSED: "bg-success/10 text-success border-success/20",
  DEAD: "bg-destructive/10 text-destructive border-destructive/20",
};

const formatCurrency = (value: number | null) => {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

interface OutreachDrafts {
  sms: string;
  email: string;
  call_script: string;
}

interface BuyerMatch {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  matchScore: number;
  targetCounties: string | null;
  priceRange: string;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDraftingOutreach, setIsDraftingOutreach] = useState(false);
  const [isMatchingBuyers, setIsMatchingBuyers] = useState(false);
  
  // Outreach dialog state
  const [showOutreachDialog, setShowOutreachDialog] = useState(false);
  const [outreachDrafts, setOutreachDrafts] = useState<OutreachDrafts | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Buyer matches dialog state
  const [showBuyerMatchesDialog, setShowBuyerMatchesDialog] = useState(false);
  const [buyerMatches, setBuyerMatches] = useState<BuyerMatch[]>([]);
  const [buyerPitch, setBuyerPitch] = useState<string>("");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast.error("Property not found");
          navigate("/properties");
          return;
        }
        setProperty(data);
      } catch (error) {
        toast.error("Failed to load property");
        console.error(error);
        navigate("/properties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: PropertyStatus) => {
    if (!property) return;

    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", property.id);

      if (error) throw error;

      setProperty({ ...property, status: newStatus });
      toast.success("Status updated");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleAnalyze = async () => {
    if (!property) return;
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-property", {
        body: { propertyId: property.id },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Refresh property data
      const { data: updated } = await supabase
        .from("properties")
        .select("*")
        .eq("id", property.id)
        .single();
      
      if (updated) {
        setProperty(updated);
        toast.success("Deal analyzed successfully");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze deal");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDraftOutreach = async () => {
    if (!property) return;
    setIsDraftingOutreach(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("draft-seller-outreach", {
        body: { propertyId: property.id },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setOutreachDrafts(data.drafts);
      setShowOutreachDialog(true);
      
      // Update property status
      setProperty({ ...property, status: "SELLER_OUTREACH" });
      toast.success("Outreach drafts generated");
    } catch (error) {
      console.error("Draft error:", error);
      toast.error("Failed to generate drafts");
    } finally {
      setIsDraftingOutreach(false);
    }
  };

  const handleMatchBuyers = async () => {
    if (!property) return;
    setIsMatchingBuyers(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("match-buyers", {
        body: { propertyId: property.id },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setBuyerMatches(data.matches || []);
      setBuyerPitch(data.pitch?.pitch_template || "");
      setShowBuyerMatchesDialog(true);
      
      if (data.matches?.length > 0) {
        setProperty({ ...property, status: "BUYER_MARKETING" });
        toast.success(`Found ${data.matches.length} matching buyers`);
      } else {
        toast.info("No matching buyers found");
      }
    } catch (error) {
      console.error("Match error:", error);
      toast.error("Failed to match buyers");
    } finally {
      setIsMatchingBuyers(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </DashboardLayout>
    );
  }

  if (!property) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/properties")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">{property.address}</h1>
                <Badge
                  variant="outline"
                  className={statusColors[property.status || "NEW_LEAD"]}
                >
                  {STATUSES.find((s) => s.value === property.status)?.label || property.status}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {[property.city, property.state, property.zip].filter(Boolean).join(", ")}
                {property.county && ` • ${property.county} County`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={property.status || "NEW_LEAD"}
              onValueChange={(value) => handleStatusChange(value as PropertyStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Deal Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>List Price</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(property.list_price)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>ARV Estimate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(property.arv_estimate)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Seller Offer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(property.seller_offer_price)}</p>
            </CardContent>
          </Card>
          <Card className={property.spread && property.spread >= 10000 ? "border-success/30" : ""}>
            <CardHeader className="pb-2">
              <CardDescription>Projected Spread</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${property.spread && property.spread >= 10000 ? "text-success" : ""}`}>
                {formatCurrency(property.spread)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Motivation Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">{property.motivation_score || 0}</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(property.motivation_score || 0) * 10}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Deal Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">{property.deal_score || 0}</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success transition-all"
                    style={{ width: `${(property.deal_score || 0) * 10}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seller Info & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {property.seller_name && (
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{property.seller_name}</p>
                </div>
              )}
              {property.seller_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{property.seller_phone}</span>
                </div>
              )}
              {property.seller_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{property.seller_email}</span>
                </div>
              )}
              {!property.seller_name && !property.seller_phone && !property.seller_email && (
                <p className="text-muted-foreground text-sm">No seller information</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Actions
              </CardTitle>
              <CardDescription>Generate analysis and outreach drafts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2" 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze Deal"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2" 
                onClick={handleDraftOutreach}
                disabled={isDraftingOutreach}
              >
                {isDraftingOutreach ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {isDraftingOutreach ? "Generating..." : "Draft Seller Outreach"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2" 
                onClick={handleMatchBuyers}
                disabled={isMatchingBuyers}
              >
                {isMatchingBuyers ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {isMatchingBuyers ? "Matching..." : "Match Buyers"}
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" disabled>
                <FileText className="h-4 w-4" />
                Draft Contracts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {property.notes ? (
                <p className="text-sm whitespace-pre-wrap">{property.notes}</p>
              ) : (
                <p className="text-muted-foreground text-sm">No notes</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Outreach Drafts Dialog */}
      <Dialog open={showOutreachDialog} onOpenChange={setShowOutreachDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Outreach Drafts</DialogTitle>
            <DialogDescription>
              Review and copy these AI-generated messages. Edit as needed before sending.
            </DialogDescription>
          </DialogHeader>
          
          {outreachDrafts && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">SMS Message</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(outreachDrafts.sms, "sms")}
                  >
                    {copiedField === "sms" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Textarea 
                  value={outreachDrafts.sms} 
                  readOnly 
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Email</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(outreachDrafts.email, "email")}
                  >
                    {copiedField === "email" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Textarea 
                  value={outreachDrafts.email} 
                  readOnly 
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Call Script</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(outreachDrafts.call_script, "call")}
                  >
                    {copiedField === "call" ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Textarea 
                  value={outreachDrafts.call_script} 
                  readOnly 
                  className="min-h-[150px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowOutreachDialog(false)}>
                  Close
                </Button>
                <Button onClick={handleDraftOutreach} disabled={isDraftingOutreach}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Buyer Matches Dialog */}
      <Dialog open={showBuyerMatchesDialog} onOpenChange={setShowBuyerMatchesDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Matched Buyers</DialogTitle>
            <DialogDescription>
              {buyerMatches.length} buyers matched based on county and price preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {buyerMatches.length > 0 ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Pitch Template</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(buyerPitch, "pitch")}
                    >
                      {copiedField === "pitch" ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Textarea 
                    value={buyerPitch} 
                    readOnly 
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Top Matches</label>
                  {buyerMatches.map((buyer) => (
                    <Card key={buyer.id} className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{buyer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {buyer.priceRange} • {buyer.targetCounties || "Any area"}
                          </p>
                          {(buyer.email || buyer.phone) && (
                            <p className="text-sm mt-1">
                              {buyer.email && <span className="mr-3">{buyer.email}</span>}
                              {buyer.phone && <span>{buyer.phone}</span>}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          Score: {buyer.matchScore}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No matching buyers found. Try adding more buyers with matching criteria.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBuyerMatchesDialog(false)}>
                Close
              </Button>
              {buyerMatches.length > 0 && (
                <Button onClick={handleMatchBuyers} disabled={isMatchingBuyers}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-match
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
