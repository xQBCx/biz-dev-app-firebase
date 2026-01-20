// Circuit Breaker - Psychology Module
// "2 Loss Limit Hit. Walk away. Discipline over Dopamine."

export interface CircuitBreakerState {
  lossCount: number;
  isLocked: boolean;
  lockedUntil: Date | null;
  lockReason: string | null;
}

export interface CircuitBreakerConfig {
  maxLossesPerDay: number;
  lockoutHours: number;
}

// Default configuration
export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  maxLossesPerDay: 2,
  lockoutHours: 24
};

// Check if circuit breaker is currently triggered
export function isCircuitBreakerTriggered(state: CircuitBreakerState): boolean {
  if (!state.isLocked) return false;
  
  if (state.lockedUntil) {
    const now = new Date();
    return now < state.lockedUntil;
  }
  
  return state.isLocked;
}

// Calculate lockout end time
export function calculateLockoutEnd(hours: number = 24): Date {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

// Format remaining lockout time
export function formatLockoutRemaining(lockedUntil: Date): string {
  const now = new Date();
  const diffMs = lockedUntil.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Lockout expired';
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Get progress percentage for lockout countdown
export function getLockoutProgress(lockedUntil: Date, totalHours: number = 24): number {
  const now = new Date();
  const totalMs = totalHours * 60 * 60 * 1000;
  const remainingMs = lockedUntil.getTime() - now.getTime();
  
  if (remainingMs <= 0) return 100;
  
  const elapsed = totalMs - remainingMs;
  return Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
}

// Check if should trigger circuit breaker after a loss
export function shouldTriggerCircuitBreaker(
  currentLossCount: number,
  config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER_CONFIG
): boolean {
  return currentLossCount >= config.maxLossesPerDay;
}

// Get circuit breaker message based on state
export function getCircuitBreakerMessage(state: CircuitBreakerState): string {
  if (!state.isLocked) {
    return `${state.lossCount}/2 losses today. Trade carefully.`;
  }
  
  if (state.lossCount >= 2) {
    return "2 Loss Limit Hit. Walk away. Discipline over Dopamine.";
  }
  
  return state.lockReason || "Trading locked. Please wait.";
}

// Get severity level for UI display
export function getCircuitBreakerSeverity(
  lossCount: number
): 'safe' | 'warning' | 'danger' | 'locked' {
  if (lossCount === 0) return 'safe';
  if (lossCount === 1) return 'warning';
  return 'locked';
}

// Get color classes based on severity
export function getCircuitBreakerColors(severity: 'safe' | 'warning' | 'danger' | 'locked'): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  switch (severity) {
    case 'safe':
      return {
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500/30',
        icon: 'text-green-500'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-500/10',
        text: 'text-yellow-500',
        border: 'border-yellow-500/30',
        icon: 'text-yellow-500'
      };
    case 'danger':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        border: 'border-orange-500/30',
        icon: 'text-orange-500'
      };
    case 'locked':
      return {
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        border: 'border-red-500/30',
        icon: 'text-red-500'
      };
  }
}

// Motivational messages for after lockout
export const RECOVERY_MESSAGES = [
  "Rest is part of the strategy. Come back stronger.",
  "Every successful trader knows when to step back.",
  "Protect your capital. Protect your mindset.",
  "Tomorrow brings new setups. Today, recover.",
  "Discipline is your edge. You made the right call."
];

// Get random recovery message
export function getRandomRecoveryMessage(): string {
  return RECOVERY_MESSAGES[Math.floor(Math.random() * RECOVERY_MESSAGES.length)];
}

// Trading rules reminder
export const TRADING_RULES = [
  "Never risk more than 2% per trade",
  "Wait for confirmed breakouts with volume",
  "Stop loss is non-negotiable",
  "Take profits at Target 1 (75% position)",
  "Two losses = done for the day"
];
