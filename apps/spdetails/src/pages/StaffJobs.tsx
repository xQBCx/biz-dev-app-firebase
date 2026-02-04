import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Calendar } from "lucide-react";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  status: string;
  preferred_date: string;
  preferred_time: string;
  address: string;
  city: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
};

export default function StaffJobs() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("assigned_staff_id", user.id)
      .order("preferred_date", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
      return;
    }

    setJobs(data || []);
  };

  const openInMaps = (address: string, city: string, zipCode: string, lat: number | null, lng: number | null) => {
    const fullAddress = `${address}, ${city}, ${zipCode}`;
    
    if (lat && lng) {
      const url = `https://maps.apple.com/?q=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
      window.open(url, '_blank');
    }
  };

  const updateStatus = async (jobId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", jobId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Status updated successfully",
    });

    fetchJobs();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Jobs</h2>
        <p className="text-muted-foreground">
          Jobs assigned to you
        </p>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No jobs assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{job.customer_name}</CardTitle>
                  <Badge variant={
                    job.status === "completed" ? "default" :
                    job.status === "in-progress" ? "secondary" :
                    "outline"
                  }>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {job.customer_email}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {job.customer_phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {job.preferred_date} at {job.preferred_time}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {job.address}, {job.city}, {job.zip_code}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openInMaps(job.address, job.city, job.zip_code, job.latitude, job.longitude)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>

                  {job.status === "confirmed" && (
                    <Button onClick={() => updateStatus(job.id, "in-progress")}>
                      Start Job
                    </Button>
                  )}

                  {job.status === "in-progress" && (
                    <Button onClick={() => updateStatus(job.id, "completed")}>
                      Complete Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
