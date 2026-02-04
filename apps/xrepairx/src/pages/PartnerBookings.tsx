import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Calendar, Ban } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  assigned_staff_id: string | null;
};

type Staff = {
  id: string;
  email: string;
};

export default function PartnerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchStaff();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("business_id", membership.business_id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
      return;
    }

    setBookings(data || []);
  };

  const fetchStaff = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return;

    const { data } = await supabase
      .from("business_members")
      .select("user_id")
      .eq("business_id", membership.business_id)
      .eq("role", "staff");

    if (data) {
      // Get user emails for staff
      const staffIds = data.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", staffIds);

      setStaff(profiles?.map(p => ({ id: p.id, email: p.full_name || p.id })) || []);
    }
  };

  const assignStaff = async (bookingId: string, staffId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ assigned_staff_id: staffId })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Staff assigned successfully",
    });

    fetchBookings();
  };

  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

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

    fetchBookings();
  };

  const openInMaps = (address: string, city: string, zipCode: string, lat: number | null, lng: number | null) => {
    const fullAddress = `${address}, ${city}, ${zipCode}`;
    
    // Check if we have coordinates
    if (lat && lng) {
      // Try to open in native maps app if on mobile
      const url = `https://maps.apple.com/?q=${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      // Fallback to Google Maps with address
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
      window.open(url, '_blank');
    }
  };

  const cancelBooking = async (bookingId: string) => {
    toast({
      title: "Stripe Required",
      description: "Please configure Stripe to process refunds. Once enabled, cancellations will automatically refund customers based on your cancellation policy.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
        <p className="text-muted-foreground">
          Manage your business bookings
        </p>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{booking.customer_name}</CardTitle>
                <Badge variant={
                  booking.status === "completed" ? "default" :
                  booking.status === "confirmed" ? "secondary" :
                  "outline"
                }>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {booking.customer_email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {booking.customer_phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {booking.preferred_date} at {booking.preferred_time}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {booking.address}, {booking.city}, {booking.zip_code}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openInMaps(booking.address, booking.city, booking.zip_code, booking.latitude, booking.longitude)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Open in Maps
                </Button>

                <Select
                  value={booking.status}
                  onValueChange={(value) => updateStatus(booking.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={booking.assigned_staff_id || "unassigned"}
                  onValueChange={(value) => value !== "unassigned" && assignStaff(booking.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {booking.status !== "cancelled" && booking.status !== "completed" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Ban className="h-4 w-4 mr-2" />
                        Cancel & Refund
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking & Issue Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will cancel the booking and process a refund based on your cancellation policy.
                          The refund amount will be calculated automatically.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cancelBooking(booking.id)}>
                          Cancel & Refund
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
