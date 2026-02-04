import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Shield, FileText } from "lucide-react";

interface NDASignatureProps {
  deal: any;
  userId: string;
}

const NDASignature = ({ deal, userId }: NDASignatureProps) => {
  const [agreed, setAgreed] = useState(false);
  const [signedName, setSignedName] = useState("");
  const queryClient = useQueryClient();

  // Fetch NDA template
  const { data: ndaTemplate, isLoading } = useQuery({
    queryKey: ["nda-template", deal.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nda_templates")
        .select("*")
        .eq("deal_id", deal.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const signNDA = useMutation({
    mutationFn: async () => {
      if (!ndaTemplate) throw new Error("NDA template not found");

      // Get IP address (in production, this should be from server-side)
      const ipAddress = "0.0.0.0"; // Placeholder

      const { error } = await supabase.from("nda_signatures").insert({
        deal_id: deal.id,
        user_id: userId,
        nda_template_id: ndaTemplate.id,
        signed_name: signedName,
        ip_address: ipAddress,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nda-signature", deal.id, userId] });
      toast.success("NDA signed successfully");
    },
    onError: () => {
      toast.error("Failed to sign NDA");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !signedName.trim()) {
      toast.error("Please agree to the NDA and enter your full legal name");
      return;
    }
    signNDA.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Shield className="h-12 w-12 text-accent animate-pulse" />
      </div>
    );
  }

  if (!ndaTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-2xl font-bold">NDA Not Available</h2>
              <p className="text-muted-foreground">
                No NDA template is configured for this deal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-accent" />
              <div>
                <CardTitle className="text-2xl">{ndaTemplate.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {deal.title} - Version {ndaTemplate.version}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* NDA Text */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Non-Disclosure Agreement
              </Label>
              <ScrollArea className="h-96 w-full border border-border rounded-md p-4 bg-card">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                  {ndaTemplate.body}
                </div>
              </ScrollArea>
            </div>

            {/* Signature Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signedName">Full Legal Name *</Label>
                <Input
                  id="signedName"
                  value={signedName}
                  onChange={(e) => setSignedName(e.target.value)}
                  placeholder="Enter your full legal name"
                  required
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <Label
                  htmlFor="agree"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  I have read and agree to the terms of this Non-Disclosure Agreement.
                  I understand that by signing, I am legally bound to maintain confidentiality
                  of all information disclosed.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!agreed || !signedName.trim() || signNDA.isPending}
              >
                {signNDA.isPending ? "Signing..." : "Sign NDA & Access Data Room"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Your IP address and timestamp will be recorded for legal purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NDASignature;
