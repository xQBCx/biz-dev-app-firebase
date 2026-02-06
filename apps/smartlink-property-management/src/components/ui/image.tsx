import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
}

export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ 
    src, 
    alt, 
    className, 
    priority = false, 
    placeholder = 'empty',
    blurDataURL,
    sizes = '100vw',
    quality = 75,
    onLoad,
    onError,
    ...props 
  }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      onLoad?.(event);
    }, [onLoad]);

    const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
      setHasError(true);
      onError?.(event);
    }, [onError]);

    // Generate responsive srcSet for common breakpoints
    const generateSrcSet = (baseSrc: string) => {
      const breakpoints = [320, 640, 768, 1024, 1280, 1536];
      return breakpoints
        .map(width => `${baseSrc}?w=${width}&q=${quality} ${width}w`)
        .join(', ');
    };

    if (hasError) {
      return (
        <div 
          className={cn(
            "bg-muted/20 border border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground text-sm",
            className
          )}
          {...props}
        >
          Failed to load image
        </div>
      );
    }

    return (
      <div className={cn("relative overflow-hidden", className)}>
        {placeholder === 'blur' && !isLoaded && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 animate-pulse"
            style={{
              backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
              backgroundSize: 'cover',
              filter: 'blur(10px)',
            }}
          />
        )}
        
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />

        {!isLoaded && !hasError && placeholder === 'empty' && (
          <div className="absolute inset-0 bg-muted/10 animate-pulse" />
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

// Skeleton loader component for images
export const ImageSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-muted/20 animate-pulse rounded", className)} />
);

// Avatar with optimized loading
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const OptimizedAvatar = ({ 
  src, 
  alt, 
  fallback, 
  className,
  size = 'md' 
}: OptimizedAvatarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  return (
    <div className={cn(
      "relative inline-flex items-center justify-center rounded-full bg-muted overflow-hidden",
      sizeClasses[size],
      className
    )}>
      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      
      <span className={cn(
        "font-medium text-muted-foreground",
        imageLoaded && !imageError ? "opacity-0" : "opacity-100"
      )}>
        {fallback}
      </span>
    </div>
  );
};