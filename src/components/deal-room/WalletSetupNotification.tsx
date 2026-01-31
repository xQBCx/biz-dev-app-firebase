import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight, X } from "lucide-react";
import { useState } from "react";

interface WalletSetupNotificationProps {
  dealRoomName?: string;
  onDismiss?: () => void;
  variant?: "banner" | "card";
}

export function WalletSetupNotification({
  dealRoomName,
  onDismiss,
  variant = "banner",
}: WalletSetupNotificationProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (variant === "card") {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-foreground">
                Set Up Your XDK Wallet
              </h4>
              <p className="text-sm text-muted-foreground">
                {dealRoomName
                  ? `You've been added to "${dealRoomName}" to receive payouts.`
                  : "You've been added to receive payouts in this Deal Room."}
                {" "}Complete your wallet setup to receive funds.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <Button asChild>
                <Link to="/profile?tab=wallet">
                  <span className="hidden sm:inline">Set Up Wallet</span>
                  <span className="sm:hidden">Setup</span>
                  <ArrowRight className="h-4 w-4 ml-1 sm:ml-2" />
                </Link>
              </Button>
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Banner variant (default)
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base">
              Set Up Your XDK Wallet
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Complete wallet setup to receive payouts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:flex-shrink-0">
          <Button asChild size="sm" className="flex-1 sm:flex-none">
            <Link to="/profile?tab=wallet">
              <span className="hidden sm:inline">Set Up Now</span>
              <span className="sm:hidden">Setup</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
