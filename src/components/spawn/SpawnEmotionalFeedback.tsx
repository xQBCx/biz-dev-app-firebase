import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface EmotionalState {
  excitement: number; // 0-100
  progress: number; // 0-100
  phase: string;
}

interface SpawnEmotionalFeedbackProps {
  state: EmotionalState;
  onHeartbeat?: () => void;
}

/**
 * Component that creates emotional/dopamine-triggering visual feedback
 * Uses color shifts, pulsing, and ambient effects based on spawn progress
 */
export function SpawnEmotionalFeedback({ state, onHeartbeat }: SpawnEmotionalFeedbackProps) {
  const [breathPhase, setBreathPhase] = useState(0);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  // Breathing animation - creates a living, organic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Generate sparkles on excitement changes
  useEffect(() => {
    if (state.excitement > 50) {
      const count = Math.floor(state.excitement / 20);
      const newSparkles = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4
      }));
      setSparkles(prev => [...prev, ...newSparkles].slice(-30));

      // Trigger heartbeat callback for sound/haptics
      if (onHeartbeat && state.excitement > 70) {
        onHeartbeat();
      }
    }
  }, [state.excitement, onHeartbeat]);

  // Clean up old sparkles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.slice(-15));
    }, 2000);
    return () => clearInterval(cleanup);
  }, []);

  // Calculate dynamic values
  const breathIntensity = Math.sin((breathPhase * Math.PI) / 180) * 0.5 + 0.5;
  const glowOpacity = 0.1 + (state.excitement / 200) + (breathIntensity * 0.1);
  const hueShift = state.progress * 1.2; // Shift from blue towards green as progress increases

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Ambient background glow */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 120%, 
            hsl(${220 + hueShift} 70% 50% / ${glowOpacity}) 0%, 
            transparent 60%)`
        }}
      />

      {/* Top accent glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/3 transition-all duration-500"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(var(--primary) / ${glowOpacity * 0.5}) 0%, 
            transparent 100%)`,
          opacity: state.excitement > 30 ? 1 : 0
        }}
      />

      {/* Corner accents */}
      <div 
        className="absolute top-0 left-0 w-64 h-64"
        style={{
          background: `radial-gradient(circle at top left, 
            hsl(var(--primary) / ${glowOpacity}) 0%, 
            transparent 70%)`,
          opacity: breathIntensity
        }}
      />
      <div 
        className="absolute top-0 right-0 w-64 h-64"
        style={{
          background: `radial-gradient(circle at top right, 
            hsl(var(--primary) / ${glowOpacity * 0.7}) 0%, 
            transparent 70%)`,
          opacity: breathIntensity * 0.8
        }}
      />

      {/* Floating sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute rounded-full bg-primary/60 animate-ping"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDuration: '1.5s'
          }}
        />
      ))}

      {/* Phase-specific overlays */}
      {state.phase === 'research' && (
        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
      )}
      {state.phase === 'erp' && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
      )}
      {state.phase === 'website' && (
        <div className="absolute inset-0 bg-purple-500/5 animate-pulse" />
      )}
      {state.phase === 'launch' && (
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, 
              hsl(var(--primary) / ${0.1 + breathIntensity * 0.1}) 0%, 
              transparent 50%, 
              hsl(var(--primary) / ${0.05 + breathIntensity * 0.05}) 100%)`
          }}
        />
      )}

      {/* Progress indicator bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/50 transition-all duration-500"
          style={{ width: `${state.progress}%` }}
        />
      </div>
    </div>
  );
}

export default SpawnEmotionalFeedback;
