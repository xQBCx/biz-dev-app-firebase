import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Bell, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ParticipantWalletSettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: {
    id: string;
    user_id: string | null;
    requires_wallet_setup: boolean;
    wallet_address: string | null;
    profiles?: {
      full_name: string | null;
      email?: string | null;
    } | null;
  };
  dealRoomId: string;
  dealRoomName: string;
  onUpdate: () => void;
}

export function ParticipantWalletSettingsPanel({
  open,
  onOpenChange,
  participant,
  dealRoomId,
  dealRoomName,
  onUpdate,
}: ParticipantWalletSettingsPanelProps) {
  const [requiresWalletSetup, setRequiresWalletSetup] = useState(
    participant.requires_wallet_setup
  );
  const [saving, setSaving] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);

  const hasWallet = !!participant.wallet_address;
  const participantName = participant.profiles?.full_name || "Participant";

  const handleToggleChange = async (checked: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("deal_room_participants")
        .update({ requires_wallet_setup: checked })
        .eq("id", participant.id);

      if (error) throw error;

      setRequiresWalletSetup(checked);
      toast.success(
        checked
          ? "Wallet setup requirement enabled"
          : "Wallet setup requirement disabled"
      );

      // If enabling and they don't have a wallet, send notification
      if (checked && !hasWallet && participant.user_id) {
        await sendNotification();
      }

      onUpdate();
    } catch (error: any) {
      console.error("Error updating wallet requirement:", error);
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  const sendNotification = async () => {
    if (!participant.user_id) {
      toast.error("Cannot send notification: participant has no user account");
      return;
    }

    setSendingNotification(true);
    try {
      const { error } = await supabase.functions.invoke(
        "send-wallet-setup-notification",
        {
          body: {
            participant_id: participant.id,
            deal_room_id: dealRoomId,
            deal_room_name: dealRoomName,
          },
        }
      );

      if (error) throw error;
      toast.success("Wallet setup notification sent");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  const getWalletStatus = () => {
    if (hasWallet) {
      return {
        icon: CheckCircle,
        text: "Wallet Connected",
        variant: "default" as const,
        className: "bg-green-500/20 text-green-600 border-green-500/30",
      };
    }
    if (requiresWalletSetup) {
      return {
        icon: AlertCircle,
        text: "Setup Required",
        variant: "outline" as const,
        className: "bg-amber-500/20 text-amber-600 border-amber-500/30",
      };
    }
    return {
      icon: Wallet,
      text: "Not Required",
      variant: "secondary" as const,
      className: "",
    };
  };

  const status = getWalletStatus();
  const StatusIcon = status.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Settings
          </SheetTitle>
          <SheetDescription>
            Configure XDK wallet requirements for {participantName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Current Status */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current Status
                  </p>
                  <p className="text-lg font-semibold">{participantName}</p>
                </div>
                <Badge className={status.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.text}
                </Badge>
              </div>

              {hasWallet && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">Wallet Address</p>
                  <p className="text-sm font-mono truncate">
                    {participant.wallet_address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Toggle Setting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/50">
            <div className="space-y-1">
              <Label htmlFor="requires-wallet" className="text-base font-medium">
                Requires Wallet Setup
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable if this participant will receive XDK payouts and needs to
                set up their withdrawal wallet.
              </p>
            </div>
            <Switch
              id="requires-wallet"
              checked={requiresWalletSetup}
              onCheckedChange={handleToggleChange}
              disabled={saving}
            />
          </div>

          {/* Send Notification Button */}
          {requiresWalletSetup && !hasWallet && participant.user_id && (
            <Button
              onClick={sendNotification}
              disabled={sendingNotification}
              className="w-full"
              variant="outline"
            >
              {sendingNotification ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Send Wallet Setup Reminder
                </>
              )}
            </Button>
          )}

          {/* Info Text */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              When wallet setup is required, the participant will receive an
              in-app notification prompting them to configure their XDK wallet
              for receiving payouts.
            </p>
            {!participant.user_id && (
              <p className="text-amber-600">
                ⚠️ This participant doesn't have a user account yet. They'll
                receive the notification once they accept their invitation.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
