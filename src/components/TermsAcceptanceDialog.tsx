import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsOfService } from "./TermsOfService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";

interface TermsAcceptanceDialogProps {
  open: boolean;
  onAccepted: () => void;
}

export const TermsAcceptanceDialog = ({ open, onAccepted }: TermsAcceptanceDialogProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!hasRead) {
      toast({
        title: "Please confirm",
        description: "You must confirm that you have read and agree to the Terms of Service.",
        variant: "destructive",
      });
      return;
    }

    setIsAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("user_terms_acceptance")
        .upsert(
          {
            user_id: user.id,
            terms_version: "1.0",
            ip_address: null,
            user_agent: navigator.userAgent,
          },
          {
            onConflict: "user_id,terms_version",
            // Avoid UPDATE (no UPDATE policy); treat existing row as success
            ignoreDuplicates: true,
          }
        );

      if (error) throw error;

      toast({
        title: "Terms Accepted",
        description: "Welcome to Biz Dev App!",
      });

      onAccepted();
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast({
        title: "Error",
        description: "Failed to record terms acceptance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Terms of Service</DialogTitle>
          <DialogDescription>
            Please read and accept our Terms of Service to continue using Biz Dev App.
          </DialogDescription>
        </DialogHeader>
        
        <TermsOfService />
        
        <DialogFooter className="flex-col sm:flex-col gap-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked as boolean)}
              disabled={isAccepting}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-relaxed cursor-pointer"
            >
              I have read and agree to the Terms of Service. I understand that by clicking "I Accept," 
              I am entering into a legally binding agreement with Business Development LLC.
            </label>
          </div>
          
          <Button
            onClick={handleAccept}
            disabled={!hasRead || isAccepting}
            className="w-full"
            size="lg"
          >
            {isAccepting ? (
              <>
                <Loader className="mr-2" />
                Processing...
              </>
            ) : (
              "I Accept"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
