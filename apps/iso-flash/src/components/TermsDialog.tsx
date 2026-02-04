import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsDialog({ open, onAccept, onDecline }: TermsDialogProps) {
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Quick Agreement</DialogTitle>
          <DialogDescription>
            The essentials before we start
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4 text-sm">
            {/* Plain language summary */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="font-medium text-foreground mb-2">📸 Here's the deal:</p>
              <p className="text-muted-foreground">
                ISO Flash connects people who want photos with people who take them. 
                We're the matchmaker, not the photographer.
              </p>
            </div>

            <section>
              <h3 className="font-semibold text-base mb-2">You're Responsible For:</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Your phone, camera, and equipment</li>
                <li>Backing up your photos</li>
                <li>Your own safety when meeting up</li>
                <li>Content you create or share</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">We're Not Responsible For:</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Lost, stolen, or damaged equipment</li>
                <li>Quality of photos (that's between you two)</li>
                <li>Disputes between users</li>
                <li>In-person incidents or injuries</li>
                <li>How photos get used after the session</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">The Rules:</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Be honest about who you are</li>
                <li>Don't use the platform for anything illegal</li>
                <li>Respect other users</li>
                <li>Get permission before using someone's photos</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Photos & Content:</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Seekers</strong> own their session photos</li>
                <li><strong>Photographers</strong> need permission to use session photos in their portfolio</li>
                <li>ISO Flash can feature content for platform promotion</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Money Stuff:</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Photographers set their own rates</li>
                <li>Payment disputes are between you and the other party</li>
                <li>You handle your own taxes</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">The Legal Bits:</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                You agree to hold ISO Flash harmless from any claims arising from your use of the service. 
                The service is provided "as is" without warranties. Any disputes will be resolved through 
                binding arbitration. We can update these terms anytime — we'll let you know if we do.
              </p>
            </section>

            <div className="p-3 rounded-lg bg-muted/50 border border-border mt-4">
              <p className="text-xs text-muted-foreground text-center">
                Full legal terms available at isoflash.com/terms
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox 
            id="terms" 
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I understand and agree
          </label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onDecline}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!agreed}>
            Let's Go
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
