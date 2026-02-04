import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Star, Camera, Search, MapPin } from "lucide-react";
import { AdminRatingDialog } from "@/components/AdminRatingDialog";
import { JobPhotoUpload } from "@/components/JobPhotoUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  address: string;
  city: string;
  zip_code: string;
  notes: string | null;
  vehicle_info: string | null;
  user_id: string | null;
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ratedBookings, setRatedBookings] = useState<Set<string>>(new Set());
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    fetchRatedBookings();
  }, [locationFilter, statusFilter]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (locationFilter !== "all") {
        query = query.ilike("city", `%${locationFilter}%`);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRatedBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("ratings")
        .select("booking_id")
        .eq("rater_id", user.id)
        .eq("rating_type", "customer_rating");

      if (error) throw error;
      
      setRatedBookings(new Set(data?.map(r => r.booking_id) || []));
    } catch (error: any) {
      console.error("Error fetching rated bookings:", error);
    }
  };

  const handleRateCustomer = (booking: Booking) => {
    setSelectedBooking(booking);
    setRatingDialogOpen(true);
  };

  const handleRatingSubmitted = () => {
    fetchRatedBookings();
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast({
        title: "Success",
        description: "Booking status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setBookings(bookings.filter(b => b.id !== id));
      toast({
        title: "Success",
        description: "Booking deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      completed: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  const filteredBookings = bookings.filter(b =>
    b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold">All Bookings</h2>
          <p className="text-muted-foreground">{filteredBookings.length} bookings</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[150px]"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[130px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Houston">Houston</SelectItem>
              <SelectItem value="California">California</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.customer_name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{booking.customer_email}</div>
                    <div className="text-muted-foreground">{booking.customer_phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{booking.service_type}</div>
                    {booking.vehicle_info && (
                      <div className="text-muted-foreground">{booking.vehicle_info}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{booking.preferred_date}</div>
                    <div className="text-muted-foreground">{booking.preferred_time}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{booking.address}</div>
                    <div className="text-muted-foreground">
                      {booking.city}, {booking.zip_code}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => updateStatus(booking.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {booking.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setPhotoDialogOpen(true);
                      }}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Photos
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {booking.status === "completed" && booking.user_id && (
                    <Button
                      variant={ratedBookings.has(booking.id) ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleRateCustomer(booking)}
                      disabled={ratedBookings.has(booking.id)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      {ratedBookings.has(booking.id) ? "Rated" : "Rate"}
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBooking(booking.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedBooking && (
        <>
          <AdminRatingDialog
            open={ratingDialogOpen}
            onOpenChange={setRatingDialogOpen}
            bookingId={selectedBooking.id}
            customerId={selectedBooking.user_id || ""}
            customerName={selectedBooking.customer_name}
            onRatingSubmitted={handleRatingSubmitted}
          />
          
          <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Job Photos - {selectedBooking.customer_name}</DialogTitle>
              </DialogHeader>
              <JobPhotoUpload bookingId={selectedBooking.id} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
