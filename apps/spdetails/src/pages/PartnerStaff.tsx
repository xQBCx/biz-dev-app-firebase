import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Mail, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

type StaffMember = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
  full_name?: string;
  assigned_jobs?: number;
};

export default function PartnerStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return;
    setBusinessId(membership.business_id);

    // Get all staff members
    const { data: staffMembers } = await supabase
      .from("business_members")
      .select("*")
      .eq("business_id", membership.business_id)
      .eq("role", "staff")
      .order("created_at", { ascending: false });

    if (!staffMembers) return;

    // Get user details and job counts
    const staffWithDetails = await Promise.all(
      staffMembers.map(async (member) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", member.user_id)
          .single();

        const { count } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("assigned_staff_id", member.user_id)
          .neq("status", "completed")
          .neq("status", "cancelled");

        return {
          ...member,
          email: profile?.email || "No email",
          full_name: profile?.full_name || "Unknown",
          assigned_jobs: count || 0,
        };
      })
    );

    setStaff(staffWithDetails);
  };

  const handleInviteStaff = async () => {
    if (!businessId || !inviteEmail) {
      toast({
        title: "Error",
        description: "Please provide an email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail,
        password: Math.random().toString(36).slice(-12) + "A1!",
        options: {
          data: {
            full_name: inviteName || inviteEmail.split("@")[0],
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Create profile
      await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: inviteName || inviteEmail.split("@")[0],
        email: inviteEmail,
      });

      // Add to business_members
      const { error: memberError } = await supabase
        .from("business_members")
        .insert({
          business_id: businessId,
          user_id: authData.user.id,
          role: "staff",
        });

      if (memberError) throw memberError;

      toast({
        title: "Success",
        description: `Invited ${inviteEmail} to your team. They'll receive an email to set their password.`,
      });

      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteName("");
      fetchStaff();
    } catch (error: any) {
      console.error("Error inviting staff:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite staff member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    try {
      // Check if staff has active jobs
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("assigned_staff_id", userId)
        .neq("status", "completed")
        .neq("status", "cancelled");

      if (count && count > 0) {
        toast({
          title: "Cannot remove staff",
          description: "This staff member has active jobs assigned. Please reassign them first.",
          variant: "destructive",
        });
        return;
      }

      // Remove from business_members
      const { error } = await supabase
        .from("business_members")
        .delete()
        .eq("user_id", userId)
        .eq("business_id", businessId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Staff member removed from your team",
      });

      fetchStaff();
    } catch (error: any) {
      console.error("Error removing staff:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove staff member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">
            Invite and manage your team members
          </p>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team. They'll receive an email to set up their account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button
                onClick={handleInviteStaff}
                disabled={loading || !inviteEmail}
                className="w-full"
              >
                {loading ? "Sending Invitation..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {staff.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg">No staff members yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start building your team by inviting staff members
                  </p>
                </div>
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Your First Staff Member
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          staff.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {member.full_name || "Unknown"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Staff</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(member.created_at), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {member.assigned_jobs} active job{member.assigned_jobs !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.full_name || member.email} from your team?
                          {member.assigned_jobs > 0 && (
                            <span className="block mt-2 text-destructive font-semibold">
                              This staff member has {member.assigned_jobs} active job(s) assigned.
                              Please reassign them first.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveStaff(member.user_id)}
                          disabled={member.assigned_jobs > 0}
                        >
                          Remove Staff
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
