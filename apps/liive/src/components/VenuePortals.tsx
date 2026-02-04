import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import nightclub1 from '@/assets/venues/nightclub-1.jpg';
import bar1 from '@/assets/venues/bar-1.jpg';
import xgames1 from '@/assets/venues/xgames-1.jpg';
import restaurant1 from '@/assets/venues/restaurant-1.jpg';
import vip1 from '@/assets/venues/vip-1.jpg';
import rooftop1 from '@/assets/venues/rooftop-1.jpg';

interface Portal {
  id: number;
  image: string;
  label: string;
  slug: string;
  x: number;
  y: number;
  z: number;
  rotateY: number;
  rotateX: number;
  scale: number;
  speed: number;
  delay: number;
}

const venueImages = [
  { src: nightclub1, label: 'Nightclub', slug: 'club-neon-nights' },
  { src: bar1, label: 'Cocktail Bar', slug: 'the-velvet-lounge' },
  { src: xgames1, label: 'X-Games', slug: 'extreme-arena' },
  { src: restaurant1, label: 'Fine Dining', slug: 'the-golden-fork' },
  { src: vip1, label: 'VIP Lounge', slug: 'skyline-vip' },
  { src: rooftop1, label: 'Rooftop Bar', slug: 'cloud-nine-rooftop' },
];

const generatePortals = (): Portal[] => {
  const portals: Portal[] = [];
  const positions = [
    // Left side portals
    { x: -85, y: -20, z: 100, rotateY: 25, rotateX: 0 },
    { x: -70, y: 40, z: 200, rotateY: 20, rotateX: -5 },
    { x: -90, y: -60, z: 300, rotateY: 30, rotateX: 5 },
    // Right side portals
    { x: 85, y: 20, z: 150, rotateY: -25, rotateX: 0 },
    { x: 70, y: -40, z: 250, rotateY: -20, rotateX: 5 },
    { x: 90, y: 60, z: 350, rotateY: -30, rotateX: -5 },
    // Top portals
    { x: -30, y: 70, z: 180, rotateY: 10, rotateX: -15 },
    { x: 30, y: 80, z: 280, rotateY: -10, rotateX: -20 },
    // Bottom portals
    { x: -40, y: -70, z: 220, rotateY: 15, rotateX: 15 },
    { x: 40, y: -80, z: 320, rotateY: -15, rotateX: 20 },
    // Far depth portals
    { x: -50, y: 0, z: 400, rotateY: 12, rotateX: 0 },
    { x: 50, y: 10, z: 450, rotateY: -12, rotateX: -5 },
  ];

  positions.forEach((pos, index) => {
    const venue = venueImages[index % venueImages.length];
    portals.push({
      id: index,
      image: venue.src,
      label: venue.label,
      slug: venue.slug,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      rotateY: pos.rotateY,
      rotateX: pos.rotateX,
      scale: 0.8 + Math.random() * 0.4,
      speed: 40 + Math.random() * 20,
      delay: index * 0.5,
    });
  });

  return portals;
};

export const VenuePortals = () => {
  const [portals] = useState<Portal[]>(generatePortals);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const [, forceUpdate] = useState(0);
  const isPausedRef = useRef(false);
  const navigate = useNavigate();

  const handlePortalClick = useCallback((slug: string) => {
    navigate(`/venue/${slug}`);
  }, [navigate]);

  const handlePointerEnter = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const handlePointerLeave = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Only advance time if not paused
      if (!isPausedRef.current) {
        timeRef.current += delta;
      }
      
      forceUpdate(n => n + 1);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const getPortalStyle = useCallback((portal: Portal): React.CSSProperties => {
    const time = timeRef.current;
    // Calculate z position with looping
    const cycleLength = 500;
    const currentZ = ((portal.z - time * portal.speed) % cycleLength + cycleLength) % cycleLength;
    
    // Map z to visual depth (closer = larger, farther = smaller)
    const normalizedZ = currentZ / cycleLength;
    const perspective = 1 - normalizedZ * 0.8;
    const opacity = Math.max(0, Math.min(1, (1 - normalizedZ) * 1.5 - 0.2));
    
    // Calculate position based on depth
    const xOffset = portal.x * perspective;
    const yOffset = portal.y * perspective;
    const scale = portal.scale * perspective * 0.9;
    const isClickable = opacity > 0.3;

    return {
      position: 'absolute',
      left: `calc(50% + ${xOffset}%)`,
      top: `calc(50% + ${yOffset}%)`,
      transform: `
        translate(-50%, -50%)
        perspective(1000px)
        rotateY(${portal.rotateY}deg)
        rotateX(${portal.rotateX}deg)
        scale(${scale})
      `,
      opacity: opacity * 0.85,
      zIndex: Math.floor((1 - normalizedZ) * 100),
      transition: isPausedRef.current ? 'all 0.3s ease-out' : 'opacity 0.3s ease',
      pointerEvents: isClickable ? 'auto' as const : 'none' as const,
      cursor: isClickable ? 'pointer' : 'default',
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}
    >
      {portals.map((portal) => (
        <div
          key={portal.id}
          className="portal-window group"
          style={getPortalStyle(portal)}
          onClick={() => handlePortalClick(portal.slug)}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          {/* Responsive portal container - scales for mobile/tablet/desktop */}
          <div className="relative w-[200px] h-[113px] sm:w-[320px] sm:h-[180px] md:w-[420px] md:h-[236px] lg:w-[600px] lg:h-[338px] rounded-lg overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-110 group-active:scale-105">
            {/* Digital frame border */}
            <div className="absolute inset-0 rounded-lg border border-primary/30 sm:border-2 sm:border-primary/40 z-20 pointer-events-none group-hover:border-primary/70 transition-colors duration-300" />
            
            {/* Corner accents - smaller on mobile */}
            <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-t border-l sm:border-t-2 sm:border-l-2 border-primary z-20 group-hover:border-primary transition-colors" />
            <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-t border-r sm:border-t-2 sm:border-r-2 border-primary z-20 group-hover:border-primary transition-colors" />
            <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-b border-l sm:border-b-2 sm:border-l-2 border-primary z-20 group-hover:border-primary transition-colors" />
            <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-b border-r sm:border-b-2 sm:border-r-2 border-primary z-20 group-hover:border-primary transition-colors" />
            
            {/* Venue image with color overlay */}
            <div className="relative w-full h-full">
              <img
                src={portal.image}
                alt={portal.label}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
              {/* Digital color overlay - matches theme */}
              <div 
                className="absolute inset-0 mix-blend-color"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(280, 60%, 30%) 0%, hsl(300, 80%, 60%) 100%)',
                }}
              />
              <div 
                className="absolute inset-0 mix-blend-overlay opacity-60"
                style={{ 
                  background: 'linear-gradient(180deg, transparent 0%, hsl(280, 60%, 20%) 100%)',
                }}
              />
              {/* Scanline effect - subtle */}
              <div 
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                }}
              />
              {/* Privacy blur on faces - subtle vignette effect */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 30%, rgba(57, 46, 78, 0.4) 100%)',
                }}
              />
              {/* Hover glow overlay */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
            </div>
            
            {/* Label - responsive sizing */}
            <div className="absolute bottom-1 left-1 right-1 sm:bottom-2 sm:left-2 sm:right-2 z-20">
              <div className="bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 sm:px-2 sm:py-1 border border-primary/30 group-hover:border-primary/60 group-hover:bg-background/90 transition-all duration-300">
                <span className="text-[10px] sm:text-xs font-medium text-primary">{portal.label}</span>
              </div>
            </div>
            
            {/* Click hint on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
              <div className="bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-primary/50">
                <span className="text-xs sm:text-sm font-medium text-primary">Tap to View</span>
              </div>
            </div>
            
            {/* Glow effect - reduced on mobile for performance */}
            <div 
              className="absolute -inset-2 sm:-inset-4 rounded-xl opacity-20 sm:opacity-30 -z-10 blur-lg sm:blur-xl group-hover:opacity-50 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.5) 0%, transparent 70%)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
