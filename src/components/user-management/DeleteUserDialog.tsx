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
import { Loader2, AlertTriangle, Trash2, Archive } from "lucide-react";
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

export function DeleteUserDialog({ open, onOpenChange, user, onDeleted }: DeleteUserDialogProps) {
  const [eraseData, setEraseData] = useState<"keep" | "erase">("keep");
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: {
          userId: user.id,
          eraseData: eraseData === "erase",
        },
      });

      if (error) throw error;

      toast.success(data.message || "User deleted successfully");
      onDeleted();
      onOpenChange(false);
      setConfirmText("");
      setEraseData("keep");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = confirmText === "DELETE" && user;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              You are about to delete <strong>{user?.full_name || user?.email}</strong>.
            </p>
            
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
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
