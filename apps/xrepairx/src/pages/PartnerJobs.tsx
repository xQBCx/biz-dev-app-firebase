import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Calendar, Navigation, User } from "lucide-react";
import { format } from "date-fns";

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
  full_name: string;
};

export default function PartnerJobs() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: membership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) return;

    // Fetch bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .eq("business_id", membership.business_id)
      .order("preferred_date", { ascending: true })
      .order("preferred_time", { ascending: true });

    if (bookingsError) {
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
      return;
    }

    setBookings(bookingsData || []);

    // Fetch staff
    const { data: staffMembers } = await supabase
      .from("business_members")
      .select("user_id")
      .eq("business_id", membership.business_id)
      .eq("role", "staff");

    if (staffMembers) {
      const staffIds = staffMembers.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", staffIds);

      setStaff(profiles?.map(p => ({ id: p.id, full_name: p.full_name || "Unknown" })) || []);
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

    fetchData();
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

  const getStaffName = (staffId: string | null) => {
    if (!staffId) return "Unassigned";
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember?.full_name || "Unknown";
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterDate !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const bookingDate = new Date(booking.preferred_date);
      
      if (filterDate === "today" && bookingDate.toDateString() !== today.toDateString()) return false;
      if (filterDate === "upcoming" && bookingDate < today) return false;
      if (filterDate === "past" && bookingDate >= today) return false;
    }
    
    if (filterStatus !== "all" && booking.status !== filterStatus) return false;
    
    return true;
  });

  const groupedByDate = filteredBookings.reduce((acc, booking) => {
    const date = booking.preferred_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const groupedByStaff = filteredBookings.reduce((acc, booking) => {
    const staffId = booking.assigned_staff_id || "unassigned";
    if (!acc[staffId]) acc[staffId] = [];
    acc[staffId].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const JobCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{booking.customer_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{booking.service_type}</p>
          </div>
          <Badge variant={
            booking.status === "completed" ? "default" :
            booking.status === "confirmed" ? "secondary" :
            booking.status === "in-progress" ? "secondary" :
            "outline"
          }>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.preferred_date), "MMM dd, yyyy")} at {booking.preferred_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1">{booking.address}, {booking.city}, {booking.zip_code}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{booking.customer_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{getStaffName(booking.assigned_staff_id)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInMaps(booking.address, booking.city, booking.zip_code, booking.latitude, booking.longitude)}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>

          <Select
            value={booking.assigned_staff_id || "unassigned"}
            onValueChange={(value) => value !== "unassigned" && assignStaff(booking.id, value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Assign staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Jobs & Routes</h2>
        <p className="text-muted-foreground">
          Manage jobs by location and schedule
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterDate} onValueChange={setFilterDate}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="by-date" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-date">By Date</TabsTrigger>
          <TabsTrigger value="by-staff">By Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="by-date" className="space-y-6">
          {Object.keys(groupedByDate).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No jobs found</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedByDate)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, jobs]) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {format(new Date(date), "EEEE, MMMM dd, yyyy")}
                    <Badge variant="outline" className="ml-2">{jobs.length} jobs</Badge>
                  </h3>
                  {jobs.map(job => <JobCard key={job.id} booking={job} />)}
                </div>
              ))
          )}
        </TabsContent>

        <TabsContent value="by-staff" className="space-y-6">
          {Object.keys(groupedByStaff).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No jobs found</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedByStaff).map(([staffId, jobs]) => (
              <div key={staffId} className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {getStaffName(staffId === "unassigned" ? null : staffId)}
                  <Badge variant="outline" className="ml-2">{jobs.length} jobs</Badge>
                </h3>
                {jobs.map(job => <JobCard key={job.id} booking={job} />)}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
