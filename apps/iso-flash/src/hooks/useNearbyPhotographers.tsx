import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "./useLocation";

export interface PhotographerFilters {
  maxRate?: number;
  minRating?: number;
  maxDistance?: number;
}

export function useNearbyPhotographers(
  location: Location | null, 
  enabled = true,
  filters?: PhotographerFilters
) {
  return useQuery({
    queryKey: ["nearbyPhotographers", location, filters],
    queryFn: async () => {
      if (!location) return [];

      // Calculate distance range based on filter (default 5km)
      const maxDistanceKm = filters?.maxDistance || 10;
      const latRange = maxDistanceKm * 0.009; // Rough approximation: 1km ≈ 0.009 degrees
      const lngRange = maxDistanceKm * 0.009;

      let query = supabase
        .from("profiles")
        .select("*")
        .eq("is_photographer", true)
        .eq("is_available", true)
        .gte("location_lat", location.latitude - latRange)
        .lte("location_lat", location.latitude + latRange)
        .gte("location_lng", location.longitude - lngRange)
        .lte("location_lng", location.longitude + lngRange);

      // Apply rate filter - include null rates (photographers who haven't set a rate)
      if (filters?.maxRate !== undefined) {
        query = query.or(`hourly_rate.lte.${filters.maxRate},hourly_rate.is.null`);
      }

      // Apply rating filter
      if (filters?.minRating !== undefined && filters.minRating > 0) {
        query = query.gte("rating", filters.minRating);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Calculate actual distance for each photographer
      const photographersWithDistance = (data || []).map(photographer => {
        const lat1 = location.latitude;
        const lon1 = location.longitude;
        const lat2 = photographer.location_lat;
        const lon2 = photographer.location_lng;
        
        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return { ...photographer, distance };
      });

      // Sort by distance
      return photographersWithDistance.sort((a, b) => a.distance - b.distance);
    },
    enabled: enabled && !!location,
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
