import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  venueId: string;
  venueName: string;
}

const BookingForm = ({ venueId, venueName }: BookingFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [partySize, setPartySize] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a booking",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!date || !partySize) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("bookings")
        .insert({
          venue_id: venueId,
          user_id: user.id,
          booking_date: date.toISOString(),
          party_size: parseInt(partySize),
          special_requests: specialRequests || null,
        });

      if (error) throw error;

      toast({
        title: "Booking submitted!",
        description: `Your booking at ${venueName} has been submitted. You'll receive confirmation soon.`,
      });

      // Reset form
      setDate(undefined);
      setPartySize("");
      setSpecialRequests("");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking failed",
        description: "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 bg-card border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">Make a Reservation</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date">Date & Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="partySize">Party Size</Label>
          <Input
            id="partySize"
            type="number"
            min="1"
            max="50"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            placeholder="Number of guests"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Textarea
            id="specialRequests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requirements or preferences..."
            rows={4}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Request Booking"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          Your booking request will be sent to the venue for confirmation
        </p>
      </form>
    </Card>
  );
};

export default BookingForm;
