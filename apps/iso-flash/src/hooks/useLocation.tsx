import { useState, useEffect } from "react";
import { getCurrentPosition } from "@/lib/capacitor";

export interface Location {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const pos = await getCurrentPosition();
        if (pos) {
          setLocation(pos);
        } else {
          setError("Unable to get location");
        }
      } catch (err) {
        setError("Location permission denied");
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const refreshLocation = async () => {
    setLoading(true);
    try {
      const pos = await getCurrentPosition();
      if (pos) {
        setLocation(pos);
        setError(null);
      }
    } catch (err) {
      setError("Unable to refresh location");
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, refreshLocation };
}
