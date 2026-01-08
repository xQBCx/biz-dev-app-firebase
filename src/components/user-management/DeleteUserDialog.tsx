import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle, Trash2, Archive, FlaskConical, UserX, Bot, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string;
  } | null;
  onDeleted: () => void;
}

type DeletionReason = "test_account" | "fraudulent_user" | "fake_robo_account" | "other";

const deletionReasonLabels: Record<DeletionReason, { label: string; icon: React.ReactNode; description: string }> = {
  test_account: {
    label: "Test account",
    icon: <FlaskConical className="h-4 w-4" />,
    description: "This was a test/demo account for development purposes",
  },
  fraudulent_user: {
    label: "Fraudulent user",
    icon: <UserX className="h-4 w-4" />,
    description: "This user was engaging in fraudulent or malicious activity",
  },
  fake_robo_account: {
    label: "Fake/Robo account",
    icon: <Bot className="h-4 w-4" />,
    description: "This was an automated or fake account, not a real person",
  },
  other: {
    label: "Other",
    icon: <HelpCircle className="h-4 w-4" />,
    description: "Another reason not listed above",
  },
};

export function DeleteUserDialog({ open, onOpenChange, user, onDeleted }: DeleteUserDialogProps) {
  const [eraseData, setEraseData] = useState<"keep" | "erase">("keep");
  const [deletionReason, setDeletionReason] = useState<DeletionReason>("test_account");
  const [otherReason, setOtherReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    
    const finalReason = deletionReason === "other" ? otherReason.trim() : deletionReason;
    
    if (deletionReason === "other" && !otherReason.trim()) {
      toast.error("Please specify the reason for deletion");
      return;
    }
    
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: {
          userId: user.id,
          eraseData: eraseData === "erase",
          deletionReason: finalReason,
          deletionReasonType: deletionReason,
        },
      });

      if (error) throw error;

      // Show warning if email had previous issues
      if (data.emailHistory?.hasPreviousIssues) {
        toast.warning(`Note: This email (${user.email}) was previously flagged: ${data.emailHistory.previousReasons.join(', ')}`);
      }

      toast.success(data.message || "User deleted successfully");
      onDeleted();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setConfirmText("");
    setEraseData("keep");
    setDeletionReason("test_account");
    setOtherReason("");
  };

  const canDelete = confirmText === "DELETE" && user && (deletionReason !== "other" || otherReason.trim());

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              You are about to delete <strong>{user?.full_name || user?.email}</strong>.
            </p>
            
            {/* Deletion Reason Section */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <p className="text-sm font-medium text-foreground">Why are you deleting this user?</p>
              
              <RadioGroup value={deletionReason} onValueChange={(v) => setDeletionReason(v as DeletionReason)}>
                {(Object.entries(deletionReasonLabels) as [DeletionReason, typeof deletionReasonLabels.test_account][]).map(([key, config]) => (
                  <div key={key} className="flex items-start space-x-3 p-2 rounded-md hover:bg-background/50 transition-colors">
                    <RadioGroupItem value={key} id={`reason-${key}`} className="mt-0.5" />
                    <div className="space-y-0.5 flex-1">
                      <Label htmlFor={`reason-${key}`} className="flex items-center gap-2 font-medium cursor-pointer text-sm">
                        {config.icon}
                        {config.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              
              {deletionReason === "other" && (
                <Textarea
                  placeholder="Please specify the reason for deletion..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="mt-2"
                  rows={2}
                />
              )}
            </div>
            
            {/* Data Handling Section */}
            <div className="bg-muted p-4 rounded-lg space-y-4">
              <p className="text-sm font-medium text-foreground">What should happen to their data?</p>
              
              <RadioGroup value={eraseData} onValueChange={(v) => setEraseData(v as "keep" | "erase")}>
                <div className="flex items-start space-x-3 p-3 rounded-md border bg-background">
                  <RadioGroupItem value="keep" id="keep" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="keep" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Archive className="h-4 w-4 text-muted-foreground" />
                      Keep data (recommended)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Remove the user's login but preserve their activity logs, messages, and other records for audit purposes.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-md border border-destructive/50 bg-background">
                  <RadioGroupItem value="erase" id="erase" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="erase" className="flex items-center gap-2 font-medium cursor-pointer text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Erase all data
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete all user data including activity logs, messages, permissions, and any associated records. This cannot be undone.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm">
                Type <strong>DELETE</strong> to confirm:
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={resetForm}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
