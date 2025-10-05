import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, MapPin, TrendingUp, Building } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export default function MyApplications() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("franchise_applications")
        .select(`
          *,
          franchises (
            brand_name,
            logo_url,
            industry
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track your franchise applications</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track your franchise applications</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">You haven't submitted any applications yet.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">Track your franchise applications</p>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {application.franchises?.logo_url ? (
                    <img
                      src={application.franchises.logo_url}
                      alt={application.franchises.brand_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {application.franchises?.brand_name || "Franchise"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {application.franchises?.industry}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {application.desired_location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{application.desired_location}</span>
                  </div>
                )}
                {application.investment_amount && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{formatCurrency(application.investment_amount)}</span>
                  </div>
                )}
                {application.capital_available && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span>{formatCurrency(application.capital_available)} available</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Applied {format(new Date(application.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>

              {application.message && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {application.message}
                  </p>
                </div>
              )}

              {application.reviewed_at && (
                <p className="text-xs text-muted-foreground">
                  Reviewed on {format(new Date(application.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
