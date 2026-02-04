import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Camera, Smartphone } from "lucide-react";

interface SessionPreferencesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (preferences: SessionPreferences) => void;
  photographerName: string;
}

export interface SessionPreferences {
  deviceUsed: "client_phone" | "photographer_phone";
  allowPhotographerPortfolio: boolean;
  editingRequested: boolean;
  editingFee?: number;
}

export function SessionPreferencesDialog({ 
  open, 
  onClose, 
  onConfirm,
  photographerName 
}: SessionPreferencesDialogProps) {
  const [deviceUsed, setDeviceUsed] = useState<"client_phone" | "photographer_phone">("photographer_phone");
  const [allowPortfolio, setAllowPortfolio] = useState(false);
  const [wantEditing, setWantEditing] = useState(false);
  const [editingFee, setEditingFee] = useState("");

  const handleConfirm = () => {
    onConfirm({
      deviceUsed,
      allowPhotographerPortfolio: allowPortfolio,
      editingRequested: wantEditing,
      editingFee: wantEditing && editingFee ? parseFloat(editingFee) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Session Preferences</DialogTitle>
          <DialogDescription>
            Configure how your session with {photographerName} will work
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Which device will be used?</Label>
            <RadioGroup value={deviceUsed} onValueChange={(value) => setDeviceUsed(value as any)}>
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="photographer_phone" id="photographer_phone" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="photographer_phone" className="flex items-center gap-2 cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <span className="font-medium">Photographer's Phone</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Photos taken on photographer's device (recommended for better camera quality)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="client_phone" id="client_phone" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="client_phone" className="flex items-center gap-2 cursor-pointer">
                    <Smartphone className="h-4 w-4" />
                    <span className="font-medium">Your Phone</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Photos taken on your device (you keep full control)
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="portfolio" 
                checked={allowPortfolio}
                onCheckedChange={(checked) => setAllowPortfolio(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="portfolio" className="font-medium cursor-pointer">
                  Allow photographer to use photos in portfolio
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Photos can be showcased by {photographerName} to demonstrate their work quality to future clients
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="editing" 
                checked={wantEditing}
                onCheckedChange={(checked) => setWantEditing(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="editing" className="font-medium cursor-pointer">
                  Request photo/video editing
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Photographer will edit and enhance your photos for an additional fee
                </p>
              </div>
            </div>
            
            {wantEditing && (
              <div className="ml-7 mt-3">
                <Label htmlFor="editing-fee" className="text-sm">Editing Fee (optional)</Label>
                <Input
                  id="editing-fee"
                  type="number"
                  step="0.01"
                  placeholder="Enter agreed editing fee"
                  value={editingFee}
                  onChange={(e) => setEditingFee(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Start Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
