import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Location = 'houston' | 'california';

interface LocationConfig {
  id: Location;
  name: string;
  phone: string;
  phoneDisplay: string;
  city: string;
  state: string;
  available: boolean;
  comingSoon?: boolean;
}

export const LOCATIONS: Record<Location, LocationConfig> = {
  houston: {
    id: 'houston',
    name: 'Houston',
    phone: 'tel:7132816030',
    phoneDisplay: '(713) 281-6030',
    city: 'Houston',
    state: 'TX',
    available: true,
  },
  california: {
    id: 'california',
    name: 'California',
    phone: 'tel:1234567890', // Placeholder
    phoneDisplay: 'Coming Soon',
    city: 'Los Angeles',
    state: 'CA',
    available: false,
    comingSoon: true,
  },
};

interface LocationContextType {
  location: Location;
  setLocation: (location: Location) => void;
  locationConfig: LocationConfig;
  allLocations: LocationConfig[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location>(() => {
    // Load from localStorage or default to houston
    const saved = localStorage.getItem('sp-details-location');
    return (saved as Location) || 'houston';
  });

  useEffect(() => {
    localStorage.setItem('sp-details-location', location);
  }, [location]);

  const locationConfig = LOCATIONS[location];
  const allLocations = Object.values(LOCATIONS);

  return (
    <LocationContext.Provider value={{ location, setLocation, locationConfig, allLocations }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
