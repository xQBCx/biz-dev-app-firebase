import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, MapPin, TrendingUp, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface FranchiseApplicationsListProps {
  franchiseId: string;
}

export function FranchiseApplicationsList({ franchiseId }: FranchiseApplicationsListProps) {
  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ["franchise-applications", franchiseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("franchise_applications")
        .select("*")
        .eq("franchise_id", franchiseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("franchise_applications")
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success(`Application ${newStatus}`);
      refetch();
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("Failed to update application");
    }
  };

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
    return <div className="text-muted-foreground">Loading applications...</div>;
  }

  if (!applications || applications.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No applications received yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Applicant</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    Applied {format(new Date(application.created_at), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <Badge variant={getStatusColor(application.status)}>
                {application.status}
              </Badge>
            </div>

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
              {application.experience_years && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{application.experience_years} years exp.</span>
                </div>
              )}
            </div>

            {application.message && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.message}
                </p>
              </div>
            )}

            {application.status === "pending" && (
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(application.id, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleStatusChange(application.id, "approved")}
                >
                  Approve
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
