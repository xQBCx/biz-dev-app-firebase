import { MapPin, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, LOCATIONS, Location } from "@/contexts/LocationContext";
import { Badge } from "@/components/ui/badge";

export function LocationSelector() {
  const { location, setLocation, locationConfig } = useLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="h-4 w-4" />
          <span>{locationConfig.name}, {locationConfig.state}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {Object.values(LOCATIONS).map((loc) => (
          <DropdownMenuItem
            key={loc.id}
            onClick={() => loc.available && setLocation(loc.id as Location)}
            disabled={!loc.available}
            className="flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {location === loc.id && <Check className="h-4 w-4 text-primary" />}
              {location !== loc.id && <span className="w-4" />}
              {loc.name}, {loc.state}
            </span>
            {loc.comingSoon && (
              <Badge variant="secondary" className="text-xs">Soon</Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
