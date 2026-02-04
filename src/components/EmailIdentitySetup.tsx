import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mail, Plus, Trash2, CheckCircle } from "lucide-react";

export const EmailIdentitySetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");

  const { data: identities, isLoading } = useQuery({
    queryKey: ["email-identities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_identities")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addIdentityMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("email_identities")
        .insert([{
          user_id: user!.id,
          email: newEmail,
          display_name: newDisplayName || null,
          connector_type: "imap_smtp",
          is_active: true,
          is_primary: !identities || identities.length === 0,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-identities"] });
      toast({
        title: "Email Identity Added",
        description: "You can now send emails from this address",
      });
      setNewEmail("");
      setNewDisplayName("");
      setIsAdding(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePrimaryMutation = useMutation({
    mutationFn: async (identityId: string) => {
      // First, set all identities to not primary
      await supabase
        .from("email_identities")
        .update({ is_primary: false })
        .eq("user_id", user!.id);

      // Then set the selected one as primary
      const { error } = await supabase
        .from("email_identities")
        .update({ is_primary: true })
        .eq("id", identityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-identities"] });
      toast({
        title: "Primary Email Updated",
      });
    },
  });

  const deleteIdentityMutation = useMutation({
    mutationFn: async (identityId: string) => {
      const { error } = await supabase
        .from("email_identities")
        .delete()
        .eq("id", identityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-identities"] });
      toast({
        title: "Email Identity Removed",
      });
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Identities
          </CardTitle>
          <CardDescription>
            Manage the email addresses you send from. BizDev uses Resend to deliver your emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {identities && identities.length > 0 ? (
            <div className="space-y-3">
              {identities.map((identity) => (
                <div
                  key={identity.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{identity.email}</p>
                      {identity.is_primary && (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      {!identity.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {identity.display_name && (
                      <p className="text-sm text-muted-foreground">
                        {identity.display_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!identity.is_primary && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePrimaryMutation.mutate(identity.id)}
                      >
                        Set as Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteIdentityMutation.mutate(identity.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No email identities configured</p>
              <p className="text-sm">Add your first email identity to start sending</p>
            </div>
          )}

          {isAdding ? (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  placeholder="you@example.com or use onboarding@resend.dev for testing"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For testing, use: <code className="bg-muted px-1 py-0.5 rounded">onboarding@resend.dev</code>
                </p>
              </div>
              <div>
                <Label>Display Name (optional)</Label>
                <Input
                  placeholder="Your Name or Company Name"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => addIdentityMutation.mutate()}
                  disabled={!newEmail || addIdentityMutation.isPending}
                >
                  Add Identity
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewEmail("");
                    setNewDisplayName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Email Identity
            </Button>
          )}

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">📧 About Email Sending</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Test Mode:</strong> Use <code className="bg-muted px-1 py-0.5 rounded">onboarding@resend.dev</code> for immediate testing</li>
              <li>• <strong>Production:</strong> Add your own domain in Resend (https://resend.com/domains)</li>
              <li>• <strong>Deliverability:</strong> Verify your domain with SPF, DKIM, and DMARC for best results</li>
              <li>• <strong>Limits:</strong> Free tier includes 100 emails/day, 3,000/month</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
