import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Mail, Clock, Lock, Settings } from "lucide-react";
import { ComposeEmail } from "./ComposeEmail";
import { InvitationPermissionManager } from "./user-management/InvitationPermissionManager";
import { AccessRequestPermissionManager } from "./user-management/AccessRequestPermissionManager";
import type { Json } from "@/integrations/supabase/types";

type AccessRequest = {
  id: string;
  full_name: string;
  email: string;
  company: string | null;
  reason: string | null;
  status: string;
  created_at: string;
  assigned_account_level: string | null;
  rejection_reason: string | null;
  invite_code: string | null;
  default_permissions: Json | null;
};

type AccountLevel = "free_trial" | "basic" | "professional" | "enterprise" | "partner";

export const AccessRequestManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [accountLevel, setAccountLevel] = useState<AccountLevel>("free_trial");
  const [rejectionReason, setRejectionReason] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [permissionRequest, setPermissionRequest] = useState<AccessRequest | null>(null);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [approvedPermissionInviteId, setApprovedPermissionInviteId] = useState<string | null>(null);
  const [approvedPermissionDialogOpen, setApprovedPermissionDialogOpen] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AccessRequest[];
    },
  });

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, email, fullName }: { requestId: string; email: string; fullName: string }) => {
      const invitationToken = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

      // Get current user for inviter_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the access request to retrieve default_permissions
      const { data: requestData } = await supabase
        .from("access_requests")
        .select("default_permissions")
        .eq("id", requestId)
        .single();

      // Update access request with approval
      const { error: updateError } = await supabase
        .from("access_requests")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          assigned_account_level: accountLevel,
          invite_code: invitationToken,
          invite_expires_at: expiresAt.toISOString(),
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Create a team invitation so user goes through the standard accept-invite flow
      // Include default_permissions from the access request
      const { error: inviteError } = await supabase
        .from("team_invitations")
        .insert([{
          inviter_id: user.id,
          invitee_email: email,
          invitee_name: fullName,
          assigned_role: "client_user" as const,
          invitation_token: invitationToken,
          expires_at: expiresAt.toISOString(),
          message: "Your access request has been approved! Welcome to the platform.",
          default_permissions: requestData?.default_permissions || {},
        }]);

      if (inviteError) {
        console.error("Failed to create team invitation:", inviteError);
        // Don't throw - we'll fall back to direct signup
      }

      // Send approval email via edge function
      const emailIdentities = await supabase
        .from("email_identities")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!emailIdentities.data) {
        console.warn("No email identity found - email not sent");
      } else {
        const acceptInviteUrl = `https://thebdapp.com/accept-invite/${invitationToken}`;
        const htmlEmail = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background: #000000; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <img src="https://thebdapp.com/bizdev-logo.png" alt="Biz Dev" style="height: 100px; margin-bottom: 20px;" />
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to the Platform</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hi ${fullName},
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  <strong>Congratulations!</strong> Your access request to the Business Development Platform has been approved. You are now part of an exclusive community of business professionals.
                </p>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                  Click the button below to set up your password and activate your account.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${acceptInviteUrl}" 
                     style="display: inline-block; background: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 16px;">
                    Activate Your Account
                  </a>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                  <h4 style="margin: 0 0 10px 0; color: #333;">Getting Started:</h4>
                  <ol style="margin: 0; padding-left: 20px; color: #555;">
                    <li style="margin-bottom: 8px;">Click the button above</li>
                    <li style="margin-bottom: 8px;">Create your password</li>
                    <li style="margin-bottom: 8px;">Start exploring the platform!</li>
                  </ol>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; margin: 0;">
                  Welcome to the team. If you have any questions, our team is here to help.
                </p>
              </div>
            </body>
          </html>
        `;

        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            identityId: emailIdentities.data.id,
            to: [email],
            cc: [],
            bcc: [],
            subject: "Welcome to BizDev - Your Access Has Been Approved! 🎉",
            body: `Your access request has been approved. Visit ${acceptInviteUrl} to activate your account.`,
            html: htmlEmail,
          },
        });

        if (emailError) {
          console.error("Email sending failed:", emailError);
          // Don't throw - approval still succeeded
        }
      }

      return { invitationToken, expiresAt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      toast({
        title: "Request Approved",
        description: "Approval email sent to applicant with account setup link.",
      });
      setSelectedRequest(null);
      setAccountLevel("free_trial");
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, email, fullName }: { requestId: string; email: string; fullName: string }) => {
      // Update access request with rejection
      const { error: updateError } = await supabase
        .from("access_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Send rejection email
      const emailIdentities = await supabase
        .from("email_identities")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (!emailIdentities.data) {
        console.warn("No email identity found - email not sent");
      } else {
        const { error: emailError } = await supabase.functions.invoke("send-email", {
          body: {
            identityId: emailIdentities.data.id,
            to: [email],
            cc: [],
            bcc: [],
            subject: "Regarding Your BizDev Access Request",
            body: `Hi ${fullName},

Thank you for your interest in BizDev.

After careful review, we're unable to approve your access request at this time.

${rejectionReason}

If you have any questions or would like to discuss this further, please feel free to reach out to us.

Best regards,
The BizDev Team`,
          },
        });

        if (emailError) {
          console.error("Email sending failed:", emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-requests"] });
      toast({
        title: "Request Rejected",
        description: "Rejection email sent to applicant.",
      });
      setSelectedRequest(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openEmailComposer = (email: string, subject: string) => {
    setEmailRecipient(email);
    setEmailSubject(subject);
    setEmailOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading requests...</div>;
  }

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];
  const reviewedRequests = requests?.filter(r => r.status !== "pending") || [];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Access Requests ({pendingRequests.length})</h2>
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {request.full_name}
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {request.email}
                          {request.company && ` • ${request.company}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPermissionRequest(request);
                            setPermissionDialogOpen(true);
                          }}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Set Permissions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEmailComposer(request.email, `Re: Your Access Request`)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {request.reason && (
                      <div className="p-3 bg-muted/50 rounded">
                        <p className="text-sm font-semibold mb-1">Reason for Access:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                    )}

                    {selectedRequest === request.id ? (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label>Account Level</Label>
                          <Select value={accountLevel} onValueChange={(value) => setAccountLevel(value as AccountLevel)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free_trial">Free Trial (14 days)</SelectItem>
                              <SelectItem value="basic">Basic</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                              <SelectItem value="partner">Partner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Rejection Reason (if rejecting)</Label>
                          <Textarea
                            placeholder="Explain why this request is being rejected..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate({
                              requestId: request.id,
                              email: request.email,
                              fullName: request.full_name,
                            })}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve & Send Invite
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (!rejectionReason.trim()) {
                                toast({
                                  title: "Rejection Reason Required",
                                  description: "Please provide a reason for rejection.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              rejectMutation.mutate({
                                requestId: request.id,
                                email: request.email,
                                fullName: request.full_name,
                              });
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(null);
                              setRejectionReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        Review Request
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {reviewedRequests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Reviewed Requests ({reviewedRequests.length})</h2>
            <div className="space-y-4">
              {reviewedRequests.map((request) => (
                <Card key={request.id} className={`border-l-4 ${request.status === "approved" ? "border-l-green-500" : "border-l-red-500"}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {request.full_name}
                          <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                            {request.status === "approved" ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {request.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {request.email}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {request.status === "approved" && request.invite_code && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Find the team invitation by token
                              const { data: invite } = await supabase
                                .from("team_invitations")
                                .select("id")
                                .eq("invitation_token", request.invite_code)
                                .single();
                              
                              if (invite) {
                                setApprovedPermissionInviteId(invite.id);
                                setApprovedPermissionDialogOpen(true);
                              } else {
                                toast({
                                  title: "Invitation not found",
                                  description: "Could not find the associated invitation.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Manage Permissions
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEmailComposer(request.email, `Follow-up: BizDev Access`)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {request.status === "approved" && request.assigned_account_level && (
                    <CardContent>
                      <p className="text-sm"><strong>Account Level:</strong> {request.assigned_account_level.replace(/_/g, " ").toUpperCase()}</p>
                    </CardContent>
                  )}
                  {request.status === "rejected" && request.rejection_reason && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{request.rejection_reason}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <ComposeEmail
        open={emailOpen}
        onOpenChange={setEmailOpen}
        to={emailRecipient}
        subject={emailSubject}
      />

      {/* Permission dialog for pending access requests */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Set Default Permissions
            </DialogTitle>
            <DialogDescription>
              Configure permissions that will be applied when {permissionRequest?.full_name}'s access request is approved
            </DialogDescription>
          </DialogHeader>
          {permissionRequest && (
            <AccessRequestPermissionManager
              requestId={permissionRequest.id}
              requesterEmail={permissionRequest.email}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Permission dialog for approved requests (edits team_invitation) */}
      <Dialog open={approvedPermissionDialogOpen} onOpenChange={setApprovedPermissionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Manage Permissions
            </DialogTitle>
            <DialogDescription>
              Update permissions for this approved user before they create their account
            </DialogDescription>
          </DialogHeader>
          {approvedPermissionInviteId && (
            <InvitationPermissionManager
              invitationId={approvedPermissionInviteId}
              inviteeEmail=""
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
