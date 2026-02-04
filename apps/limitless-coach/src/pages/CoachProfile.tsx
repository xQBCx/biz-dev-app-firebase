import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Star, MapPin, Award, Clock,
  Calendar as CalendarIcon, DollarSign, CheckCircle,
  Loader2, User
} from "lucide-react";
import { format, getDay } from "date-fns";

type Coach = {
  id: string;
  full_name: string;
  bio: string | null;
  rating: number | null;
  review_count: number | null;
  location: string | null;
  specialties: string[] | null;
  session_price: number;
  avatar_url: string | null;
  featured: boolean | null;
  experience: string | null;
  certifications: string | null;
};

type CoachAvailability = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

const generateTimeSlots = (startTime: string, endTime: string) => {
  const slots: string[] = [];
  const startHour = parseInt(startTime.split(":")[0]);
  const endHour = parseInt(endTime.split(":")[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    slots.push(`${displayHour}:00 ${period}`);
  }
  return slots;
};

const defaultTimeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const CoachProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("in-person");
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isBooking, setIsBooking] = useState(false);

  // Fetch coach profile
  const { data: coach, isLoading: loading } = useQuery({
    queryKey: ["coach-profile", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle();

      if (error) throw error;
      return data as Coach | null;
    },
    enabled: !!id,
  });

  // Fetch coach availability
  const { data: availability } = useQuery({
    queryKey: ["coach-availability", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("coach_availability")
        .select("*")
        .eq("coach_id", id);

      if (error) throw error;
      return data as CoachAvailability[];
    },
    enabled: !!id,
  });

  // Get available time slots for selected date
  const getTimeSlotsForDate = (date: Date | undefined) => {
    if (!date || !availability || availability.length === 0) return defaultTimeSlots;
    
    const dayOfWeek = getDay(date);
    const dayAvailability = availability.find(a => a.day_of_week === dayOfWeek && a.is_available);
    
    if (!dayAvailability) return [];
    
    return generateTimeSlots(dayAvailability.start_time, dayAvailability.end_time);
  };

  // Check if date is available
  const isDateAvailable = (date: Date) => {
    if (!availability || availability.length === 0) return true;
    const dayOfWeek = getDay(date);
    return availability.some(a => a.day_of_week === dayOfWeek && a.is_available);
  };

  const timeSlots = getTimeSlotsForDate(selectedDate);

  const handleBookSession = async () => {
    if (!coach || !selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('coach_sessions')
        .insert({
          coach_id: coach.id,
          client_id: user?.id || null,
          client_name: bookingForm.name,
          client_email: bookingForm.email,
          client_phone: bookingForm.phone,
          session_date: format(selectedDate, 'yyyy-MM-dd'),
          session_time: selectedTime,
          session_type: sessionType,
          notes: bookingForm.notes,
          price: coach.session_price,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Session Requested!",
        description: `Your session with ${coach.full_name} has been requested. You'll receive a confirmation soon.`,
      });

      setBookingOpen(false);
      setSelectedDate(undefined);
      setSelectedTime("");
      setBookingForm({ name: "", email: "", phone: "", notes: "" });
    } catch (error: any) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error booking your session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Coach Not Found</h2>
          <p className="text-muted-foreground mb-4">This coach profile doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate('/coaches')}>Browse Coaches</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/coaches')}
            className="text-primary-foreground hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className={`h-32 ${coach.featured ? 'bg-gradient-to-br from-primary to-primary/80' : 'bg-gradient-to-br from-muted to-muted/80'}`} />
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row gap-4 -mt-12">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {coach.avatar_url ? (
                  <img 
                    src={coach.avatar_url} 
                    alt={coach.full_name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-background"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-3xl font-bold border-4 border-background">
                    {coach.full_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pt-4 sm:pt-8">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                      {coach.full_name}
                      {coach.featured && <CheckCircle className="h-5 w-5 text-accent" />}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-medium text-foreground">{coach.rating || 5.0}</span>
                        <span>({coach.review_count || 0} reviews)</span>
                      </div>
                      {coach.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{coach.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      ${coach.session_price}
                      <span className="text-sm font-normal text-muted-foreground">/session</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {coach.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{coach.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {coach.specialties && coach.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Specialties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map(specialty => (
                      <Badge key={specialty} variant="secondary" className="text-sm">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience & Certifications */}
            {(coach.experience || coach.certifications) && (
              <Card>
                <CardHeader>
                  <CardTitle>Background</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coach.experience && (
                    <div>
                      <p className="font-medium mb-1">Experience</p>
                      <p className="text-muted-foreground">{coach.experience}</p>
                    </div>
                  )}
                  {coach.certifications && (
                    <div>
                      <p className="font-medium mb-1">Certifications</p>
                      <p className="text-muted-foreground">{coach.certifications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Book a Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>60 minute session</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${coach.session_price} per session</span>
                </div>

                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Book Session with {coach.full_name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label>Select Date *</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setSelectedTime(""); // Reset time when date changes
                          }}
                          disabled={(date) => date < new Date() || !isDateAvailable(date)}
                          className="rounded-md border"
                        />
                      </div>

                      {/* Time Selection */}
                      <div className="space-y-2">
                        <Label>Select Time *</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Session Type */}
                      <div className="space-y-2">
                        <Label>Session Type</Label>
                        <Select value={sessionType} onValueChange={setSessionType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes for Coach</Label>
                        <Textarea
                          id="notes"
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any goals or concerns you'd like to discuss..."
                          rows={3}
                        />
                      </div>

                      {/* Price Summary */}
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span>Session Price</span>
                          <span className="font-semibold">${coach.session_price}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handleBookSession}
                        disabled={isBooking || !selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email}
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          "Confirm Booking"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachProfile;