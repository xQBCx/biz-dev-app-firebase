import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Building2, Wallet, EyeOff, Pencil } from "lucide-react";

type DisplayMode = 'full_name' | 'first_only' | 'company' | 'anonymous' | 'wallet' | 'custom';

interface ParticipantDisplayEditorProps {
  participantId: string;
  currentName: string;
  currentDisplayMode?: DisplayMode;
  currentDisplayOverride?: string | null;
  currentWalletAddress?: string | null;
  currentCompanyName?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const DISPLAY_MODE_OPTIONS: { value: DisplayMode; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'full_name', label: 'Full Name', icon: <User className="w-4 h-4" />, description: 'Shows first and last name' },
  { value: 'first_only', label: 'First Name Only', icon: <User className="w-4 h-4" />, description: 'Shows only first name' },
  { value: 'company', label: 'Company Name', icon: <Building2 className="w-4 h-4" />, description: 'Display as company/org' },
  { value: 'anonymous', label: 'Anonymous', icon: <EyeOff className="w-4 h-4" />, description: 'Hidden identity' },
  { value: 'wallet', label: 'Wallet Address', icon: <Wallet className="w-4 h-4" />, description: 'Show digital wallet ID' },
  { value: 'custom', label: 'Custom Name', icon: <Pencil className="w-4 h-4" />, description: 'Enter any display name' },
];

export function ParticipantDisplayEditor({
  participantId,
  currentName,
  currentDisplayMode = 'full_name',
  currentDisplayOverride,
  currentWalletAddress,
  currentCompanyName,
  open,
  onOpenChange,
  onSaved,
}: ParticipantDisplayEditorProps) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>(currentDisplayMode);
  const [customName, setCustomName] = useState(currentDisplayOverride || '');
  const [walletAddress, setWalletAddress] = useState(currentWalletAddress || '');
  const [companyName, setCompanyName] = useState(currentCompanyName || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        display_mode: displayMode,
        display_name_override: displayMode === 'custom' ? customName : null,
        wallet_address: displayMode === 'wallet' ? walletAddress : null,
        company_display_name: displayMode === 'company' ? companyName : null,
      };

      const { error } = await supabase
        .from('deal_room_participants')
        .update(updateData)
        .eq('id', participantId);

      if (error) throw error;

      toast.success('Display settings saved');
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving display settings:', error);
      toast.error('Failed to save display settings');
    } finally {
      setSaving(false);
    }
  };

  const getPreviewName = () => {
    switch (displayMode) {
      case 'full_name':
        return currentName;
      case 'first_only':
        return currentName.split(' ')[0];
      case 'company':
        return companyName || 'Company Name';
      case 'anonymous':
        return 'Anonymous Participant';
      case 'wallet':
        return walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '0x...';
      case 'custom':
        return customName || 'Custom Name';
      default:
        return currentName;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Display Name</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <p className="font-medium text-lg">{getPreviewName()}</p>
          </div>

          {/* Display Mode Select */}
          <div className="space-y-2">
            <Label>Display Mode</Label>
            <Select value={displayMode} onValueChange={(v) => setDisplayMode(v as DisplayMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISPLAY_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div>
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">- {option.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields */}
          {displayMode === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customName">Custom Display Name</Label>
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter display name..."
              />
            </div>
          )}

          {displayMode === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name..."
              />
            </div>
          )}

          {displayMode === 'wallet' && (
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono text-sm"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get display name from participant data
export function getParticipantDisplayName(participant: {
  name: string;
  display_mode?: string | null;
  display_name_override?: string | null;
  wallet_address?: string | null;
  company_display_name?: string | null;
}): string {
  const mode = participant.display_mode || 'full_name';

  switch (mode) {
    case 'full_name':
      return participant.name;
    case 'first_only':
      return participant.name.split(' ')[0];
    case 'company':
      return participant.company_display_name || participant.name;
    case 'anonymous':
      return 'Anonymous';
    case 'wallet':
      if (participant.wallet_address) {
        return `${participant.wallet_address.slice(0, 6)}...${participant.wallet_address.slice(-4)}`;
      }
      return participant.name;
    case 'custom':
      return participant.display_name_override || participant.name;
    default:
      return participant.name;
  }
}
