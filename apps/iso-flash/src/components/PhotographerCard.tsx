import { Star, Zap, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolioPhotos } from "@/hooks/usePortfolioPhotos";
import { useShare } from "@/hooks/useShare";

interface PhotographerCardProps {
  photographer: any;
  onFlashNow: () => void;
  onSchedule: () => void;
  isCreatingSession: boolean;
  isCreatingBooking: boolean;
}

export function PhotographerCard({
  photographer,
  onFlashNow,
  onSchedule,
  isCreatingSession,
  isCreatingBooking,
}: PhotographerCardProps) {
  const { data: portfolioPhotos = [] } = usePortfolioPhotos(photographer.id);
  const { sharePhotographerProfile } = useShare();

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-4 mb-3">
        <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-secondary">
            {photographer.full_name?.[0] || "P"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold truncate">{photographer.full_name}</p>
            {photographer.rating >= 4.9 && (
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-3 w-3 text-primary" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-warning fill-warning" />
              {photographer.rating?.toFixed(1) || "5.0"}
            </span>
            <span>•</span>
            <span>{photographer.distance?.toFixed(1) || "0"} km</span>
            <span>•</span>
            <span>${photographer.hourly_rate || 25}/hr</span>
          </div>
          {photographer.experience_level && (
            <p className="text-xs text-muted-foreground capitalize mt-1">
              {photographer.experience_level} photographer
            </p>
          )}
        </div>
      </div>

      {/* Portfolio Preview */}
      {portfolioPhotos.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {portfolioPhotos.map((photo) => (
              <div
                key={photo.id}
                className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.title || "Portfolio photo"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onFlashNow}
          disabled={isCreatingSession}
          className="flex-1"
        >
          Flash Now
        </Button>
        <Button
          size="sm"
          onClick={onSchedule}
          disabled={isCreatingBooking}
          className="flex-1"
        >
          <Calendar className="h-4 w-4 mr-1" />
          Schedule
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => sharePhotographerProfile(photographer)}
          className="flex-shrink-0"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
