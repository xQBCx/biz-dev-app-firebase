import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, MapPin, DollarSign, Fuel, Link2, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PRODUCT_TYPES = ["Crude Oil", "D6 Fuel Oil", "D2 Diesel", "Jet Fuel A1", "LNG", "LPG", "Gasoline", "Bitumen"];
const LOCATIONS = ["Houston, TX", "Rotterdam, Netherlands", "Singapore", "Fujairah, UAE", "Lagos, Nigeria"];

export default function XCommodityNewListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [okariDevices, setOkariDevices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    product_type: "",
    quantity: "",
    quantity_unit: "barrels",
    price_per_unit: "",
    price_type: "fixed" as "fixed" | "floating",
    location: "",
    delivery_terms: "FOB",
    description: "",
    okari_device_id: ""
  });

  useEffect(() => {
    if (user) {
      supabase
        .from("commodity_okari_devices")
        .select("id, device_id, facility_name, device_type, location")
        .eq("owner_user_id", user.id)
        .then(({ data }) => setOkariDevices(data || []));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.product_type || !formData.quantity || !formData.price_per_unit || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("commodity_user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        navigate("/xcommodity/onboard");
        return;
      }

      const { error } = await supabase.from("commodity_listings").insert([{
        seller_id: profile.id,
        product_type: formData.product_type,
        quantity: parseFloat(formData.quantity),
        quantity_unit: formData.quantity_unit,
        price_per_unit: parseFloat(formData.price_per_unit),
        price_type: formData.price_type,
        location: formData.location,
        delivery_terms: formData.delivery_terms,
        okari_device_id: formData.okari_device_id || null,
        verification_status: formData.okari_device_id ? "okari_live" : "unverified",
        status: "active"
      }]);

      if (error) throw error;
      toast.success("Listing created!");
      navigate("/xcommodity/marketplace");
    } catch (error: any) {
      toast.error(error.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/xcommodity/marketplace")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Listing</h1>
            <p className="text-muted-foreground">List your verified commodity</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Type *</Label>
                  <Select value={formData.product_type} onValueChange={(v) => setFormData({ ...formData, product_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Terms</Label>
                  <Select value={formData.delivery_terms} onValueChange={(v) => setFormData({ ...formData, delivery_terms: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOB">FOB</SelectItem>
                      <SelectItem value="CIF">CIF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Quantity *</Label>
                  <Input type="number" placeholder="e.g. 2000000" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={formData.quantity_unit} onValueChange={(v) => setFormData({ ...formData, quantity_unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barrels">Barrels</SelectItem>
                      <SelectItem value="mt">Metric Tons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Additional details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" />Pricing</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price per Unit (USD) *</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 85.50" value={formData.price_per_unit} onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Price Type</Label>
                  <Select value={formData.price_type} onValueChange={(v: "fixed" | "floating") => setFormData({ ...formData, price_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="floating">Platts Floating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Location</CardTitle></CardHeader>
            <CardContent>
              <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>{LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />Okari GX Verification
                <Badge variant="secondary" className="ml-2">Platinum</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {okariDevices.length > 0 ? (
                <Select value={formData.okari_device_id} onValueChange={(v) => setFormData({ ...formData, okari_device_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select device (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No device</SelectItem>
                    {okariDevices.map((d) => <SelectItem key={d.id} value={d.id}>{d.facility_name || d.device_id} - {d.location}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-muted-foreground text-center py-4">No Okari devices connected</p>
              )}
              {formData.okari_device_id && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-4">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium">This listing will be Okari Verified</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/xcommodity/marketplace")}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
