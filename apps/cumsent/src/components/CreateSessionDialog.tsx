import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useConsentSessions } from "@/hooks/useConsentSessions";
import { Copy, Check, Share2 } from "lucide-react";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateSessionDialog = ({ open, onOpenChange }: CreateSessionDialogProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { createSession, generateShareUrl } = useConsentSessions();

  const handleCreate = async () => {
    setIsCreating(true);
    
    const { data, error } = await createSession();
    
    setIsCreating(false);
    
    if (error || !data) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create session",
        variant: "destructive",
      });
      return;
    }
    
    const url = generateShareUrl(data.share_token);
    setShareUrl(url);
    
    toast({
      title: "Session created!",
      description: "Share the link with your partner to begin verification.",
    });
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Consent Verification",
          text: "Join my consent verification session",
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {shareUrl ? "Share Session Link" : "Create New Session"}
          </DialogTitle>
          <DialogDescription>
            {shareUrl 
              ? "Share this link with your partner to invite them to the verification session."
              : "Create a new consent verification session and invite your partner."
            }
          </DialogDescription>
        </DialogHeader>
        
        {shareUrl ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-url">Session Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="bg-muted"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                This link expires in 24 hours. Your partner will need to sign in or create an account to join the session.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Session Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Session expires after 24 hours</li>
                <li>• Both parties must complete verification</li>
                <li>• Either party can revoke at any time</li>
              </ul>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
              <Button onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Session"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionDialog;
