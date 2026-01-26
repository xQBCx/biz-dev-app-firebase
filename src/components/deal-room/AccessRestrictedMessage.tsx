import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

interface AccessRestrictedMessageProps {
  tabName?: string;
}

export function AccessRestrictedMessage({ tabName }: AccessRestrictedMessageProps) {
  return (
    <Card className="p-8 text-center">
      <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
      <p className="text-muted-foreground">
        You don't have permission to view {tabName ? `the ${tabName} tab` : "this content"}.
        <br />
        Contact a deal room admin if you need access.
      </p>
    </Card>
  );
}
