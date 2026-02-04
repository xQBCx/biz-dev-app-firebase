import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FlashButton } from "@/components/FlashButton";
import { BottomNav } from "@/components/BottomNav";
import { Users, TrendingUp, MapPin, SlidersHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useLocation } from "@/hooks/useLocation";
import { useNearbyPhotographers } from "@/hooks/useNearbyPhotographers";
import { useFlashSession } from "@/hooks/useFlashSession";
import { useBooking } from "@/hooks/useBooking";
import { useRealtimeSessions } from "@/hooks/useRealtimeSessions";
import { toggleTorch } from "@/lib/capacitor";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SessionPreferencesDialog, SessionPreferences } from "@/components/SessionPreferencesDialog";
import { SearchFilters, FilterOptions } from "@/components/SearchFilters";
import { BookingDialog, BookingData } from "@/components/BookingDialog";
import { ScheduledSessionsList } from "@/components/ScheduledSessionsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const navigate = useNavigate();
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [showPhotographerDialog, setShowPhotographerDialog] = useState(false);
  const [selectedPhotographer, setSelectedPhotographer] = useState<any>(null);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingMode, setBookingMode] = useState<"instant" | "scheduled">("instant");
  const [torchInterval, setTorchInterval] = useState<NodeJS.Timeout | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    maxRate: 200,
    minRating: 0,
    maxDistance: 10,
  });
  
  const { user } = useAuth();
  const { data: userProfile } = useProfile(user?.id);
  const { location, loading: locationLoading } = useLocation();
  const { data: nearbyPhotographers = [] } = useNearbyPhotographers(location, !isFlashActive, filters);
  const { createSession } = useFlashSession();
  const { createBooking } = useBooking();
  const queryClient = useQueryClient();
  
  // Real-time session updates for photographers
  useRealtimeSessions(user?.id);
  
  // Fetch pending sessions for photographers
  const { data: pendingSessions = [] } = useQuery({
    queryKey: ["photographer-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id || !userProfile?.is_photographer) return [];
      
      const { data, error } = await supabase
        .from("sessions")
        .select("*, profiles:client_id(*)")
        .eq("photographer_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!userProfile?.is_photographer,
  });

  const togglePhotographerMode = useMutation({
    mutationFn: async (isPhotographer: boolean) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const updates: any = { is_photographer: isPhotographer };
      
      // If becoming a photographer, also enable availability
      if (isPhotographer && location) {
        updates.is_available = true;
        updates.location_lat = location.latitude;
        updates.location_lng = location.longitude;
      } else if (!isPhotographer) {
        updates.is_available = false;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success(
        userProfile?.is_photographer 
          ? "Switched to client mode" 
          : "Photographer mode activated!"
      );
    },
    onError: () => {
      toast.error("Failed to update mode");
    },
  });

  const toggleAvailability = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const newAvailability = !userProfile?.is_available;
      
      const updates: any = { is_available: newAvailability };
      
      // Update location when going available
      if (newAvailability && location) {
        updates.location_lat = location.latitude;
        updates.location_lng = location.longitude;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success(
        userProfile?.is_available 
          ? "You're now offline" 
          : "You're now available for sessions!"
      );
    },
    onError: () => {
      toast.error("Failed to update availability");
    },
  });

  const acceptSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "active", started_at: new Date().toISOString() })
        .eq("id", sessionId);
      
      if (error) throw error;
      return sessionId;
    },
    onSuccess: (sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["photographer-sessions", user?.id] });
      toast.success("Session accepted! Opening chat...");
      // Navigate to chat after brief delay
      setTimeout(() => {
        navigate(`/chat/${sessionId}`);
      }, 1000);
    },
  });

  const rejectSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("sessions")
        .update({ status: "cancelled" })
        .eq("id", sessionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photographer-sessions", user?.id] });
      toast.success("Session declined");
    },
  });

  const startTorchBlink = () => {
    let isOn = false;
    const interval = setInterval(async () => {
      isOn = !isOn;
      await toggleTorch(isOn);
    }, 500); // Blink every 500ms
    setTorchInterval(interval);
  };

  const stopTorchBlink = async () => {
    if (torchInterval) {
      clearInterval(torchInterval);
      setTorchInterval(null);
    }
    await toggleTorch(false);
  };

  const handleFlash = async () => {
    if (!location) {
      toast.error("Location required", {
        description: "Please enable location services",
      });
      return;
    }

    if (nearbyPhotographers.length === 0) {
      toast.error("No photographers nearby", {
        description: "Try again later or check a different location",
      });
      return;
    }

    setIsFlashActive(true);
    startTorchBlink();
    
    toast.success("Flash signal sent!", {
      description: `${nearbyPhotographers.length} nearby photographer${nearbyPhotographers.length > 1 ? 's' : ''} notified`,
    });

    // Show photographer selection after 2 seconds
    setTimeout(() => {
      setSelectedPhotographer(nearbyPhotographers[0]);
      setShowPhotographerDialog(true);
    }, 2000);
    
    // Auto-cancel after 30 seconds if no selection
    setTimeout(() => {
      if (isFlashActive) {
        setIsFlashActive(false);
        setShowPhotographerDialog(false);
        stopTorchBlink();
      }
    }, 30000);
  };

  const handleAcceptPhotographer = () => {
    if (!selectedPhotographer) return;
    setShowPhotographerDialog(false);
    if (bookingMode === "instant") {
      setShowPreferencesDialog(true);
    } else {
      setShowBookingDialog(true);
    }
  };

  const handleScheduleClick = (photographer: any) => {
    setSelectedPhotographer(photographer);
    setBookingMode("scheduled");
    setShowBookingDialog(true);
  };

  const handlePreferencesConfirm = async (preferences: SessionPreferences) => {
    if (!selectedPhotographer || !location) return;

    try {
      const session = await createSession.mutateAsync({
        location,
        photographerId: selectedPhotographer.id,
        hourlyRate: selectedPhotographer.hourly_rate || 25,
        deviceUsed: preferences.deviceUsed,
        allowPhotographerPortfolio: preferences.allowPhotographerPortfolio,
        editingRequested: preferences.editingRequested,
        editingFee: preferences.editingFee,
      });

      toast.success("Session created!", {
        description: `Waiting for ${selectedPhotographer.full_name} to accept. You'll be notified when they join.`,
      });

      setShowPreferencesDialog(false);
      setIsFlashActive(false);
      stopTorchBlink();
      
      // Navigate to chats page to see the pending session
      setTimeout(() => {
        navigate('/chats');
      }, 1500);
    } catch (error) {
      toast.error("Failed to create session");
    }
  };

  const handleBookingConfirm = async (bookingData: BookingData) => {
    if (!selectedPhotographer || !location) return;

    try {
      await createBooking.mutateAsync({
        location,
        photographerId: selectedPhotographer.id,
        hourlyRate: selectedPhotographer.hourly_rate || 25,
        scheduledAt: bookingData.scheduledAt,
        deviceUsed: bookingData.deviceUsed,
        allowPhotographerPortfolio: bookingData.allowPhotographerPortfolio,
        editingRequested: bookingData.editingRequested,
        editingFee: bookingData.editingFee,
      });

      toast.success("Session scheduled!", {
        description: `${selectedPhotographer.full_name} has been notified`,
      });

      setShowBookingDialog(false);
      setSelectedPhotographer(null);
    } catch (error) {
      toast.error("Failed to schedule session");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTorchBlink();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ISO Flash" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            {!userProfile?.is_photographer && (
              <SearchFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                photographerCount={nearbyPhotographers.length}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Status Card */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{nearbyPhotographers.length}</p>
                <p className="text-xs text-muted-foreground">Available Now</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button 
              onClick={() => togglePhotographerMode.mutate(false)}
              disabled={togglePhotographerMode.isPending}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                !userProfile?.is_photographer 
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I need a photo
            </button>
            <button 
              onClick={() => togglePhotographerMode.mutate(true)}
              disabled={togglePhotographerMode.isPending}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                userProfile?.is_photographer 
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I am a Flasher
            </button>
          </div>
        </div>

        {/* Photographer Availability Toggle */}
        {userProfile?.is_photographer && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold mb-1">Availability</h3>
                <p className="text-sm text-muted-foreground">
                  {userProfile.is_available ? "You're visible to clients" : "You're currently offline"}
                </p>
              </div>
              <Button
                onClick={() => toggleAvailability.mutate()}
                disabled={toggleAvailability.isPending}
                variant={userProfile.is_available ? "default" : "outline"}
                className={userProfile.is_available ? "shadow-[0_0_20px_hsl(var(--primary)/0.5)]" : ""}
              >
                {userProfile.is_available ? "Available" : "Offline"}
              </Button>
            </div>
          </div>
        )}

        {/* Only show flash button for clients */}
        {!userProfile?.is_photographer && (
          <>
            <Tabs defaultValue="flash" className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="flash">Flash Now</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>
              
              <TabsContent value="flash" className="space-y-6">
                {/* Flash Button */}
                <div className="flex flex-col items-center gap-6">
                  <FlashButton onFlash={handleFlash} isActive={isFlashActive} />
                  
                  {isFlashActive ? (
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary animate-pulse">Searching for Flashers...</p>
                      <p className="text-sm text-muted-foreground">Active for 30 seconds</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-lg font-bold">Ready to Flash?</p>
                      <p className="text-sm text-muted-foreground">Tap the button to signal nearby photographers</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">Upcoming Sessions</h3>
                  <p className="text-sm text-muted-foreground">Your scheduled photography sessions</p>
                </div>
                <ScheduledSessionsList userId={user?.id || ""} userRole="client" />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Photographer waiting screen and pending sessions */}
        {userProfile?.is_photographer && userProfile.is_available && (
          <Tabs defaultValue="pending" className="space-y-6 mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingSessions.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Incoming Flash Requests</h2>
                  {pendingSessions.map((session: any) => (
                    <div key={session.id} className="bg-card border border-border rounded-xl p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-primary">
                              {session.profiles?.full_name?.[0] || "C"}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold">{session.profiles?.full_name || "Client"}</p>
                            <p className="text-sm text-muted-foreground">{session.location_name || "Nearby"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">${session.hourly_rate}/hr</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => acceptSession.mutate(session.id)}
                          disabled={acceptSession.isPending}
                          className="flex-1"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => rejectSession.mutate(session.id)}
                          disabled={rejectSession.isPending}
                          variant="outline"
                          className="flex-1"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 text-center py-8">
                  <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Star className="h-16 w-16 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Waiting for Flash signals...</p>
                    <p className="text-sm text-muted-foreground">You'll be notified when a client needs you</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scheduled">
              <div className="mb-4">
                <h2 className="text-xl font-bold">Upcoming Bookings</h2>
                <p className="text-sm text-muted-foreground">Your scheduled photography sessions</p>
              </div>
              <ScheduledSessionsList userId={user?.id || ""} userRole="photographer" />
            </TabsContent>
          </Tabs>
        )}

        {/* How it works - only for clients */}
        {!userProfile?.is_photographer && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">How it works</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Flash your signal</p>
                  <p className="text-sm text-muted-foreground">Press the button to alert nearby Flashers</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Get matched instantly</p>
                  <p className="text-sm text-muted-foreground">Connect with available photographers in seconds</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-success font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Capture the moment</p>
                  <p className="text-sm text-muted-foreground">Get your perfect shot and rate your experience</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />

      {/* Photographer Match Dialog */}
      <Dialog open={showPhotographerDialog} onOpenChange={setShowPhotographerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Photographer Found!</DialogTitle>
            <DialogDescription>
              A photographer is available nearby
            </DialogDescription>
          </DialogHeader>
          
          {selectedPhotographer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {selectedPhotographer.full_name?.[0] || "P"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{selectedPhotographer.full_name}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-warning fill-warning" />
                    <span className="font-medium">{selectedPhotographer.rating?.toFixed(1) || "5.0"}</span>
                    <span className="text-muted-foreground">
                      ({selectedPhotographer.total_sessions || 0} sessions)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Hourly Rate</span>
                  <span className="text-2xl font-bold">${selectedPhotographer.hourly_rate || 25}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Distance: ~0.5 miles • ETA: 2 min
                </p>
              </div>

              {selectedPhotographer.bio && (
                <p className="text-sm text-muted-foreground">{selectedPhotographer.bio}</p>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowPhotographerDialog(false);
                    setIsFlashActive(false);
                    stopTorchBlink();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleAcceptPhotographer}
                  disabled={createSession.isPending}
                >
                  {createSession.isPending ? "Creating..." : "Accept & Start"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Preferences Dialog */}
      <SessionPreferencesDialog
        open={showPreferencesDialog}
        onClose={() => {
          setShowPreferencesDialog(false);
          setIsFlashActive(false);
          stopTorchBlink();
        }}
        onConfirm={handlePreferencesConfirm}
        photographerName={selectedPhotographer?.full_name || "Photographer"}
      />

      {/* Booking Dialog */}
      <BookingDialog
        open={showBookingDialog}
        onClose={() => {
          setShowBookingDialog(false);
          setSelectedPhotographer(null);
        }}
        onConfirm={handleBookingConfirm}
        photographerName={selectedPhotographer?.full_name || "Photographer"}
        hourlyRate={selectedPhotographer?.hourly_rate || 25}
      />

      <BottomNav />
    </div>
  );
}
