import { ReactNode, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
  const { isRefreshing, pullDistance, pullProgress, handlers } = usePullToRefresh({
    onRefresh,
  });

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center transition-transform duration-150 z-10"
        style={{
          transform: `translateY(${Math.max(pullDistance - 40, -40)}px)`,
          opacity: pullProgress,
        }}
      >
        <div
          className={cn(
            "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20",
            isRefreshing && "animate-pulse"
          )}
        >
          <RefreshCw
            className={cn(
              "h-5 w-5 text-primary transition-transform duration-150",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: isRefreshing ? undefined : `rotate(${pullProgress * 180}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content wrapper */}
      <div
        className="h-full overflow-y-auto"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? "transform 0.2s ease-out" : undefined,
        }}
        {...handlers}
      >
        {children}
      </div>
    </div>
  );
}
