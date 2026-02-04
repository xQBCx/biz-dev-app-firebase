import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface Subscription {
  id: string;
  name: string;
  price: number;
  renewalDate: string;
}

export function SubscriptionTracker() {
  const [subs] = useState<Subscription[]>([
    { id: "1", name: "Netflix", price: 15.99, renewalDate: "2025-11-15" },
    { id: "2", name: "Spotify", price: 9.99, renewalDate: "2025-11-01" },
  ]);

  const total = subs.reduce((sum, s) => sum + s.price, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription Tracker
          <Badge variant="outline">${total.toFixed(2)}/mo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {subs.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">{sub.name}</div>
              <div className="text-sm text-muted-foreground">Renews: {sub.renewalDate}</div>
            </div>
            <div className="text-lg font-bold">${sub.price}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
