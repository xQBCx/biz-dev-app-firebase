import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Rocket, Zap } from "lucide-react";

interface SpawnTransitionProps {
  isActive: boolean;
  phase: 'awakening' | 'processing' | 'completed';
  message?: string;
  onComplete?: () => void;
}

export function SpawnTransition({ isActive, phase, message, onComplete }: SpawnTransitionProps) {
  const [opacity, setOpacity] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isActive) {
      setOpacity(1);
      
      // Generate random particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
      
      if (phase === 'completed' && onComplete) {
        const timer = setTimeout(() => {
          setOpacity(0);
          setTimeout(onComplete, 500);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setOpacity(0);
    }
  }, [isActive, phase, onComplete]);

  if (!isActive && opacity === 0) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500",
        "bg-gradient-to-br from-background via-background to-primary/10"
      )}
      style={{ opacity }}
    >
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-primary/50 rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '2s'
          }}
        />
      ))}

      {/* Central animation */}
      <div className="relative">
        {/* Outer ring */}
        <div className={cn(
          "absolute inset-0 -m-20 rounded-full border-2 border-primary/20",
          phase === 'processing' && "animate-[spin_3s_linear_infinite]"
        )} />
        
        {/* Middle ring */}
        <div className={cn(
          "absolute inset-0 -m-12 rounded-full border border-primary/30",
          phase === 'processing' && "animate-[spin_2s_linear_infinite_reverse]"
        )} />

        {/* Core */}
        <div className={cn(
          "relative w-32 h-32 rounded-full flex items-center justify-center",
          "bg-gradient-to-br from-primary/20 to-primary/5",
          phase === 'processing' && "animate-pulse"
        )}>
          {phase === 'awakening' && (
            <Sparkles className="w-12 h-12 text-primary animate-bounce" />
          )}
          {phase === 'processing' && (
            <Zap className="w-12 h-12 text-primary animate-pulse" />
          )}
          {phase === 'completed' && (
            <Rocket className="w-12 h-12 text-primary animate-bounce" />
          )}
        </div>

        {/* Message */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className={cn(
            "text-lg font-medium text-center transition-all duration-500",
            phase === 'completed' ? "text-primary" : "text-muted-foreground"
          )}>
            {message || (
              phase === 'awakening' ? "Awakening AGI systems..." :
              phase === 'processing' ? "Creating your business..." :
              "Your business is ready!"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SpawnTransition;
