import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function PartnerSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    cancellation_hours: 24,
    cancellation_refund_percent: 100,
    cancellation_partial_hours: 24,
    cancellation_partial_refund_percent: 50,
  });

  useEffect(() => {
    fetchBusinessSettings();
  }, []);

  const fetchBusinessSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's business
      const { data: membership } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", user.id)
        .eq("role", "partner")
        .maybeSingle();

      if (!membership) return;

      setBusinessId(membership.business_id);

      // Get business settings
      const { data: business } = await supabase
        .from("businesses")
        .select("cancellation_hours, cancellation_refund_percent, cancellation_partial_hours, cancellation_partial_refund_percent")
        .eq("id", membership.business_id)
        .single();

      if (business) {
        setSettings({
          cancellation_hours: business.cancellation_hours || 24,
          cancellation_refund_percent: business.cancellation_refund_percent || 100,
          cancellation_partial_hours: business.cancellation_partial_hours || 24,
          cancellation_partial_refund_percent: business.cancellation_partial_refund_percent || 50,
        });
      }
    } catch (error: any) {
      console.error("Error fetching business settings:", error);
    }
  };

  const handleSave = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update(settings)
        .eq("id", businessId);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Cancellation policy has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Business Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Cancellation Policy</CardTitle>
          <CardDescription>
            Set default refund policies for all bookings. These can be overridden per booking if needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Full Refund Policy</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cancellation_hours">Hours Before Service</Label>
                <Input
                  id="cancellation_hours"
                  type="number"
                  min="0"
                  value={settings.cancellation_hours}
                  onChange={(e) => setSettings({ ...settings, cancellation_hours: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cancellations this many hours before service get full refund
                </p>
              </div>
              <div>
                <Label htmlFor="cancellation_refund_percent">Refund Percentage</Label>
                <Input
                  id="cancellation_refund_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.cancellation_refund_percent}
                  onChange={(e) => setSettings({ ...settings, cancellation_refund_percent: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground mt-1">% of payment refunded</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Partial Refund Policy</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="cancellation_partial_hours">Hours Before Service</Label>
                <Input
                  id="cancellation_partial_hours"
                  type="number"
                  min="0"
                  value={settings.cancellation_partial_hours}
                  onChange={(e) => setSettings({ ...settings, cancellation_partial_hours: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Cancellations within this window get partial refund
                </p>
              </div>
              <div>
                <Label htmlFor="cancellation_partial_refund_percent">Refund Percentage</Label>
                <Input
                  id="cancellation_partial_refund_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.cancellation_partial_refund_percent}
                  onChange={(e) => setSettings({ ...settings, cancellation_partial_refund_percent: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground mt-1">% of payment refunded</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Example Policy:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Cancel {settings.cancellation_hours}+ hours before service: {settings.cancellation_refund_percent}% refund
              </li>
              <li>
                Cancel within {settings.cancellation_partial_hours} hours: {settings.cancellation_partial_refund_percent}% refund
              </li>
              <li>No-show or same-day cancellation: No refund</li>
            </ul>
          </div>

          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
