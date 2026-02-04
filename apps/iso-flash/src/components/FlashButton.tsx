import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHaptics, ImpactStyle } from "@/hooks/useHaptics";

interface FlashButtonProps {
  onFlash: () => void;
  isActive: boolean;
}

export const FlashButton = ({ onFlash, isActive }: FlashButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { heavyTap } = useHaptics();

  const handleClick = () => {
    setIsAnimating(true);
    heavyTap();
    onFlash();
    setTimeout(() => setIsAnimating(false), 800);
  };

  return (
    <div className="relative">
      {/* Spark particles effect */}
      {isAnimating && (
        <>
          <div className="absolute inset-0 animate-spark">
            <Zap className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 h-6 w-6 text-primary" />
          </div>
          <div className="absolute inset-0 animate-spark" style={{ animationDelay: '0.1s' }}>
            <Zap className="absolute bottom-0 left-1/4 translate-y-4 h-6 w-6 text-primary rotate-45" />
          </div>
          <div className="absolute inset-0 animate-spark" style={{ animationDelay: '0.2s' }}>
            <Zap className="absolute bottom-0 right-1/4 translate-y-4 h-6 w-6 text-primary -rotate-45" />
          </div>
        </>
      )}
      
      <Button
        variant="flash"
        size="lg"
        onClick={handleClick}
        haptic={false}
        className={cn(
          "h-32 w-32 rounded-full transition-all duration-300",
          isActive && "animate-glow scale-110",
          isAnimating && "scale-95"
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Zap className="h-12 w-12" />
          <span className="text-xs font-bold">FLASH</span>
        </div>
      </Button>
    </div>
  );
};
