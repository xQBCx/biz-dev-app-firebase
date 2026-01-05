import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { 
  Play, 
  Lock, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  History
} from "lucide-react";

interface Formulation {
  id: string;
  name: string;
  description: string | null;
  version: number;
  is_active: boolean;
  formulation_status: string;
  activated_at: string | null;
}

interface FormulationActivatorProps {
  formulation: Formulation;
  dealRoomId: string;
  onUpdate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FormulationActivator = ({
  formulation,
  dealRoomId,
  onUpdate,
  open,
  onOpenChange,
}: FormulationActivatorProps) => {
  const { user } = useAuth();
  const [activating, setActivating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [changeReason, setChangeReason] = useState("");

  const handleActivate = async () => {
    if (!user) return;

    setActivating(true);
    try {
      // Log version history
      await (supabase as any).from("formulation_version_history").insert({
        formulation_id: formulation.id,
        version: formulation.version,
        changes_json: {
          action: "activated",
          previous_status: formulation.formulation_status,
          new_status: "active",
        },
        changed_by: user.id,
        change_reason: changeReason || "Formulation activated",
      });

      // Update formulation status
      const { error } = await (supabase as any)
        .from("blender_formulations")
        .update({
          is_active: true,
          formulation_status: "active",
          activated_at: new Date().toISOString(),
          activated_by: user.id,
        })
        .eq("id", formulation.id);

      if (error) throw error;

      toast.success("Formulation activated - rules are now locked");
      onUpdate();
      onOpenChange(false);
      setConfirmOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to activate formulation");
    } finally {
      setActivating(false);
    }
  };

  const isActive = formulation.is_active || formulation.formulation_status === "active";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isActive ? (
                <Lock className="w-5 h-5 text-amber-500" />
              ) : (
                <Play className="w-5 h-5 text-primary" />
              )}
              {isActive ? "Formulation Active" : "Activate Formulation"}
            </DialogTitle>
            <DialogDescription>
              {isActive
                ? "This formulation is locked. Rules cannot be modified."
                : "Activate to lock rules and begin credit-to-payout conversions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Formulation Info */}
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{formulation.name}</h3>
                  {formulation.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formulation.description}
                    </p>
                  )}
                </div>
                <Badge variant={isActive ? "default" : "secondary"}>
                  v{formulation.version}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Status: <span className="capitalize font-medium">{formulation.formulation_status}</span>
                </span>
              </div>
            </Card>

            {isActive ? (
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700">Formulation is Active</p>
                  <p className="text-sm text-amber-600/80">
                    Attribution rules are locked and cannot be retroactively changed for completed work.
                  </p>
                  {formulation.activated_at && (
                    <p className="text-xs text-amber-500 mt-2">
                      Activated: {new Date(formulation.activated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Important Warning</p>
                    <p className="text-sm text-destructive/80">
                      Once activated, attribution rules become forward-only. You cannot change 
                      payout percentages for work already credited under this formulation.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Activation Reason (optional)</Label>
                  <Textarea
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    placeholder="e.g., All parties have reviewed and agreed to the terms..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => setConfirmOpen(true)} 
                  className="w-full gap-2"
                >
                  <Play className="w-4 h-4" />
                  Activate Formulation
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Activation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate "{formulation.name}"? 
              This will lock the attribution rules and begin applying them to all future contributions.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActivate}
              disabled={activating}
              className="gap-2"
            >
              {activating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Confirm & Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
