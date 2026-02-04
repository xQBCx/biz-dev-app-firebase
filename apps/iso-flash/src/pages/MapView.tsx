import { BottomNav } from "@/components/BottomNav";
import { MapPin, Zap } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import { useNearbyPhotographers } from "@/hooks/useNearbyPhotographers";
import { useFlashSession } from "@/hooks/useFlashSession";
import { useBooking } from "@/hooks/useBooking";
import { toast } from "sonner";
import { useState, useCallback } from "react";
import { SessionPreferencesDialog, SessionPreferences } from "@/components/SessionPreferencesDialog";
import { SearchFilters, FilterOptions } from "@/components/SearchFilters";
import { BookingDialog, BookingData } from "@/components/BookingDialog";
import { PhotographerCard } from "@/components/PhotographerCard";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useQueryClient } from "@tanstack/react-query";

export default function MapView() {
  const queryClient = useQueryClient();
  const { location, loading: locationLoading } = useLocation();
  const [filters, setFilters] = useState<FilterOptions>({
    maxRate: 200,
    minRating: 0,
    maxDistance: 10,
  });
  const { data: nearbyPhotographers = [] } = useNearbyPhotographers(location, false, filters);
  const { createSession } = useFlashSession();
  const { createBooking } = useBooking();
  const [selectedPhotographer, setSelectedPhotographer] = useState<any>(null);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const handleRequest = (photographer: any) => {
    if (!location) {
      toast.error("Location required");
      return;
    }
    setSelectedPhotographer(photographer);
    setShowPreferencesDialog(true);
  };

  const handleSchedule = (photographer: any) => {
    if (!location) {
      toast.error("Location required");
      return;
    }
    setSelectedPhotographer(photographer);
    setShowBookingDialog(true);
  };

  const handlePreferencesConfirm = async (preferences: SessionPreferences) => {
    if (!selectedPhotographer || !location) return;

    try {
      await createSession.mutateAsync({
        location,
        photographerId: selectedPhotographer.id,
        hourlyRate: selectedPhotographer.hourly_rate || 25,
        deviceUsed: preferences.deviceUsed,
        allowPhotographerPortfolio: preferences.allowPhotographerPortfolio,
        editingRequested: preferences.editingRequested,
        editingFee: preferences.editingFee,
      });
      toast.success("Session request sent!");
      setShowPreferencesDialog(false);
    } catch (error) {
      toast.error("Failed to send request");
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
      toast.success("Session scheduled!");
      setShowBookingDialog(false);
    } catch (error) {
      toast.error("Failed to schedule session");
    }
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["nearby-photographers"] });
    toast.success("Refreshed!");
  }, [queryClient]);

  // Generate random positions for map pins
  const photographersWithPositions = nearbyPhotographers.map((photographer, index) => ({
    ...photographer,
    x: `${30 + (index * 15) % 50}%`,
    y: `${30 + (index * 20) % 50}%`,
  }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Nearby Flashers</h1>
          <SearchFilters 
            filters={filters} 
            onFiltersChange={setFilters}
            photographerCount={nearbyPhotographers.length}
          />
        </div>
      </header>

      {/* Map Area */}
      <div className="relative h-[400px] bg-muted overflow-hidden">
        {/* Grid pattern for map effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        {/* You are here */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <div className="h-16 w-16 rounded-full bg-primary/30"></div>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Photographer pins */}
        {photographersWithPositions.map((photographer: any) => (
          <div
            key={photographer.id}
            className="absolute z-20"
            style={{ left: photographer.x, top: photographer.y }}
          >
            <div className="relative group cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shadow-[0_0_20px_hsl(var(--secondary)/0.5)] border-2 border-background">
                <MapPin className="h-5 w-5 text-secondary-foreground" />
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-card border border-border rounded-lg p-2 shadow-lg whitespace-nowrap">
                  <p className="font-medium text-sm">{photographer.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    ${photographer.hourly_rate || 25}/hr
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photographer List */}
      <div className="max-w-lg mx-auto px-4 py-4">
        {locationLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Finding nearby photographers...</p>
          </div>
        ) : nearbyPhotographers.length > 0 ? (
          <div className="space-y-3">
            {nearbyPhotographers.map((photographer: any) => (
              <PhotographerCard
                key={photographer.id}
                photographer={photographer}
                onFlashNow={() => handleRequest(photographer)}
                onSchedule={() => handleSchedule(photographer)}
                isCreatingSession={createSession.isPending}
                isCreatingBooking={createBooking.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No photographers available nearby</p>
          </div>
        )}
      </div>

      {/* Session Preferences Dialog */}
      <SessionPreferencesDialog
        open={showPreferencesDialog}
        onClose={() => setShowPreferencesDialog(false)}
        onConfirm={handlePreferencesConfirm}
        photographerName={selectedPhotographer?.full_name || "Photographer"}
      />

        {/* Booking Dialog */}
        <BookingDialog
          open={showBookingDialog}
          onClose={() => setShowBookingDialog(false)}
          onConfirm={handleBookingConfirm}
          photographerName={selectedPhotographer?.full_name || "Photographer"}
          hourlyRate={selectedPhotographer?.hourly_rate || 25}
        />
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}
