import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus, Trash2, Navigation, Star } from "lucide-react";

interface UserLocation {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  is_default: boolean;
}

export function LocationManager() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", address: "" });

  useEffect(() => {
    if (user) fetchLocations();
  }, [user]);

  const fetchLocations = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_locations")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const addCurrentLocation = async () => {
    if (!user || !newLocation.name.trim()) {
      toast.error("Please enter a location name");
      return;
    }

    setIsAdding(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const { error } = await supabase.from("user_locations").insert({
        user_id: user.id,
        name: newLocation.name.trim(),
        address: newLocation.address.trim() || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        lat: latitude,
        lng: longitude,
        is_default: locations.length === 0,
      });

      if (error) throw error;
      toast.success("Location added");
      setNewLocation({ name: "", address: "" });
      fetchLocations();
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location");
    } finally {
      setIsAdding(false);
    }
  };

  const setAsDefault = async (id: string) => {
    if (!user) return;
    try {
      // Remove default from all
      await supabase
        .from("user_locations")
        .update({ is_default: false })
        .eq("user_id", user.id);
      
      // Set new default
      const { error } = await supabase
        .from("user_locations")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
      toast.success("Default location updated");
      fetchLocations();
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("Failed to update default");
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Location deleted");
      fetchLocations();
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading locations...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          My Locations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label>Location Name</Label>
            <Input
              placeholder="e.g., Home, Office, Gym"
              value={newLocation.name}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Address (optional)</Label>
            <Input
              placeholder="123 Main St, City, State"
              value={newLocation.address}
              onChange={(e) => setNewLocation((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <Button onClick={addCurrentLocation} disabled={isAdding} className="w-full">
            <Navigation className="h-4 w-4 mr-2" />
            {isAdding ? "Getting location..." : "Add Current Location"}
          </Button>
        </div>

        {locations.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <Label>Saved Locations</Label>
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {loc.is_default && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{loc.address}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!loc.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAsDefault(loc.id)}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLocation(loc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
