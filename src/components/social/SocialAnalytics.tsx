import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export const SocialAnalytics = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Analytics</CardTitle>
        <CardDescription>
          Track performance across all connected platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-8">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground text-center">
          Connect accounts and publish posts to see analytics
        </p>
      </CardContent>
    </Card>
  );
};