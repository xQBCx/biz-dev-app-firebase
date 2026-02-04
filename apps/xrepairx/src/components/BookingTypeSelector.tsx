import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Users, RotateCcw, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

export type BookingType = "self" | "someone-else" | "rebook";

interface RecentBooking {
  id: string;
  service_type: string;
  preferred_date: string;
  customer_name: string;
  vehicle_info: string;
  address: string;
  city: string;
  zip_code: string;
}

interface BookingTypeSelectorProps {
  onSelect: (type: BookingType, rebookData?: RecentBooking) => void;
}

export const BookingTypeSelector = ({ onSelect }: BookingTypeSelectorProps) => {
  const [user, setUser] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRebookList, setShowRebookList] = useState(false);

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: bookings } = await supabase
          .from("bookings")
          .select("id, service_type, preferred_date, customer_name, vehicle_info, address, city, zip_code")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("preferred_date", { ascending: false })
          .limit(5);

        setRecentBookings(bookings || []);
      }
      setLoading(false);
    };

    fetchUserAndBookings();
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showRebookList) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <RotateCcw className="h-6 w-6" />
            Select a Service to Rebook
          </CardTitle>
          <CardDescription>
            Choose from your recent completed services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed bookings found.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowRebookList(false)}
              >
                Back to Options
              </Button>
            </div>
          ) : (
            <>
              {recentBookings.map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => onSelect("rebook", booking)}
                  className="w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{booking.service_type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">{booking.vehicle_info}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(booking.preferred_date), "MMM d, yyyy")} • {booking.city}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setShowRebookList(false)}
              >
                Back to Options
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">How would you like to book?</CardTitle>
        <CardDescription>
          Choose an option to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          onClick={() => onSelect("self")}
          className="w-full p-6 border rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Book for Yourself</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Schedule a detailing service for your own vehicle
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
          </div>
        </button>

        <button
          onClick={() => onSelect("someone-else")}
          className="w-full p-6 border rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Book for Someone Else</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Gift a detailing service or book on behalf of another person
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
          </div>
        </button>

        {user && (
          <button
            onClick={() => setShowRebookList(true)}
            className="w-full p-6 border rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Rebook Recent Service</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Quickly rebook a previous service with the same details
                </p>
                {recentBookings.length > 0 && (
                  <p className="text-xs text-primary mt-2">
                    {recentBookings.length} completed booking{recentBookings.length > 1 ? 's' : ''} available
                  </p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
            </div>
          </button>
        )}
      </CardContent>
    </Card>
  );
};
