import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Image, Video } from 'lucide-react';

interface MediaItem {
  url: string;
  type: 'photo' | 'video';
  timestamp: Date;
}

interface MediaGalleryProps {
  media: MediaItem[];
  onRemove?: (url: string) => void;
  title?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  onRemove,
  title = 'Captured Media'
}) => {
  if (media.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="py-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Image className="h-5 w-5" />
          {title} ({media.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((item) => (
            <div
              key={item.url}
              className="relative aspect-video rounded-lg overflow-hidden bg-muted group"
            >
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Video className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
              
              {onRemove && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemove(item.url)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <span className="text-xs text-white">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
