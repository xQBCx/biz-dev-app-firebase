import { useState, useRef, useCallback, TouchEvent } from "react";
import { useHaptics } from "./useHaptics";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const { lightTap, mediumTap } = useHaptics();

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Apply resistance to make pulling feel natural
      const distance = Math.min(diff / resistance, threshold * 1.5);
      setPullDistance(distance);
      
      // Haptic feedback when crossing threshold
      if (distance >= threshold && pullDistance < threshold) {
        mediumTap();
      }
    }
  }, [isRefreshing, resistance, threshold, pullDistance, mediumTap]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      lightTap();
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh, lightTap]);

  const pullProgress = Math.min(pullDistance / threshold, 1);

  return {
    isRefreshing,
    pullDistance,
    pullProgress,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
