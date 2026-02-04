import { useState, useRef, useCallback, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh = ({
  children,
  onRefresh,
  className,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) => {
  const queryClient = useQueryClient();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY.current === 0) return;

    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      startY.current = 0;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance as user pulls further
    const resistedDistance = Math.min(distance * 0.5, threshold * 1.5);
    setPullDistance(resistedDistance);
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          // Default behavior: invalidate all queries
          await queryClient.invalidateQueries();
        }
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    startY.current = 0;
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh, queryClient]);

  const showIndicator = pullDistance > 0 || isRefreshing;
  const isPastThreshold = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex items-center justify-center transition-all duration-200 z-10 pointer-events-none",
          showIndicator ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: isRefreshing ? 48 : pullDistance,
          top: 0,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full bg-background border shadow-sm transition-all",
            isPastThreshold || isRefreshing ? "text-primary" : "text-muted-foreground"
          )}
        >
          <RefreshCw
            className={cn(
              "w-5 h-5 transition-transform",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing 
                ? undefined 
                : `rotate(${Math.min(pullDistance * 2, 180)}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content with transform during pull */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: showIndicator
            ? `translateY(${isRefreshing ? 48 : pullDistance}px)`
            : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};
