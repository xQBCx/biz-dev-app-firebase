import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Clock, Eye } from "lucide-react";
import { format } from "date-fns";

interface DataIntake {
  id: string;
  partner_id: string;
  data_type: string;
  source_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  captured_at: string | null;
  processing_status: string;
  detected_issues: string[] | null;
  confidence_score: number | null;
  created_at: string;
  fleet_partners?: { partner_name: string };
}

export const FleetDataIntakePanel = () => {
  const { data: intakeItems, isLoading } = useQuery({
    queryKey: ['fleet-data-intake'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet_data_intake')
        .select(`
          *,
          fleet_partners (partner_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as DataIntake[];
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'analyzed': return 'default';
      case 'lead_created': return 'default';
      case 'no_opportunity': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading data intake...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Visual Data Intake Queue</h2>
        <p className="text-sm text-muted-foreground">Incoming images and video from fleet partners for AI analysis</p>
      </div>

      {intakeItems?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">Visual data from fleet partners will appear here for processing</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {intakeItems?.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(item.processing_status)}>
                        {item.processing_status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{item.data_type}</Badge>
                      {item.fleet_partners && (
                        <span className="text-sm text-muted-foreground">
                          from {item.fleet_partners.partner_name}
                        </span>
                      )}
                    </div>
                    {item.location_address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {item.location_address}
                      </div>
                    )}
                    {item.detected_issues && item.detected_issues.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.detected_issues.map((issue, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                      </span>
                      {item.confidence_score && (
                        <span>Confidence: {(item.confidence_score * 100).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {item.source_url && (
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
