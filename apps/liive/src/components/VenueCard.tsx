import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Music, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VenueCardProps {
  id: string;
  name: string;
  type: string;
  genre: string;
  crowdLevel: "low" | "medium" | "high" | "packed";
  image: string;
  distance: string;
  openUntil: string;
}

const VenueCard = ({ id, name, type, genre, crowdLevel, image, distance, openUntil }: VenueCardProps) => {
  const navigate = useNavigate();
  
  const crowdColors = {
    low: "bg-green-500/20 text-green-400 border-green-500/50",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    packed: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  const crowdLabels = {
    low: "Chill",
    medium: "Moderate",
    high: "Busy",
    packed: "Packed",
  };

  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow group">
      {/* Image with overlay */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"></div>
        
        {/* Live indicator */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-red-500/90 text-white border-0 animate-pulse-glow">
            <div className="w-2 h-2 bg-white rounded-full mr-1.5"></div>
            LIVE
          </Badge>
        </div>

        {/* Crowd level */}
        <div className="absolute top-3 left-3">
          <Badge className={`border ${crowdColors[crowdLevel]}`}>
            <Users className="w-3 h-3 mr-1" />
            {crowdLabels[crowdLevel]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">{type}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            <Music className="w-3 h-3 mr-1" />
            {genre}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {distance}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Until {openUntil}
          </Badge>
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
          onClick={() => navigate(`/venue/${id}`)}
        >
          View Live Feed
        </Button>
      </div>
    </Card>
  );
};

export default VenueCard;
