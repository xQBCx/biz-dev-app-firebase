// Risk Calculator - Enforces the 2% Rule
// "Discipline Over Dopamine" - Users cannot override position sizes

export interface PositionSizeResult {
  shares: number;
  maxRiskAmount: number;
  entryPrice: number;
  stopLossPrice: number;
  riskPerShare: number;
  target1Price: number;
  target1Shares: number;
  runnerShares: number;
  potentialProfit: number;
  riskRewardRatio: number;
  isValid: boolean;
  validationErrors: string[];
}

// Constants
const RISK_PERCENTAGE = 0.02; // 2% max risk per trade
const TARGET_1_MULTIPLIER = 1.5; // Target 1 at 1.5x risk
const TARGET_1_EXIT_PERCENTAGE = 0.75; // Exit 75% at Target 1
const MIN_SHARES = 1;
const MIN_ACCOUNT_BALANCE = 100;
const MAX_RISK_SMALL_ACCOUNT = 100; // $100 max risk for accounts under $5k

// Calculate position size based on 2% rule
export function calculatePositionSize(
  accountBalance: number,
  entryPrice: number,
  stopLossPrice: number,
  direction: 'long' | 'short'
): PositionSizeResult {
  const validationErrors: string[] = [];

  // Validate inputs
  if (accountBalance < MIN_ACCOUNT_BALANCE) {
    validationErrors.push(`Account balance must be at least $${MIN_ACCOUNT_BALANCE}`);
  }

  if (entryPrice <= 0) {
    validationErrors.push('Entry price must be positive');
  }

  if (stopLossPrice <= 0) {
    validationErrors.push('Stop loss price must be positive');
  }

  // Validate stop loss direction
  if (direction === 'long' && stopLossPrice >= entryPrice) {
    validationErrors.push('For long trades, stop loss must be below entry price');
  }

  if (direction === 'short' && stopLossPrice <= entryPrice) {
    validationErrors.push('For short trades, stop loss must be above entry price');
  }

  // Calculate risk per share
  const riskPerShare = Math.abs(entryPrice - stopLossPrice);
  
  if (riskPerShare === 0) {
    validationErrors.push('Risk per share cannot be zero');
  }

  // Calculate max risk amount (2% of account OR $100 for small accounts)
  let maxRiskAmount = accountBalance * RISK_PERCENTAGE;
  
  // Small account protection: cap at $100 for accounts under $5k
  if (accountBalance < 5000) {
    maxRiskAmount = Math.min(maxRiskAmount, MAX_RISK_SMALL_ACCOUNT);
  }

  // Calculate position size
  const rawShares = riskPerShare > 0 ? maxRiskAmount / riskPerShare : 0;
  const shares = Math.max(MIN_SHARES, Math.floor(rawShares));

  // Calculate Target 1 price (1.5x risk from entry)
  const riskAmount = riskPerShare * TARGET_1_MULTIPLIER;
  const target1Price = direction === 'long' 
    ? entryPrice + riskAmount 
    : entryPrice - riskAmount;

  // Calculate shares for Target 1 exit (75%) and runner (25%)
  const target1Shares = Math.ceil(shares * TARGET_1_EXIT_PERCENTAGE);
  const runnerShares = shares - target1Shares;

  // Calculate potential profit at Target 1
  const potentialProfit = (target1Shares * riskAmount);

  // Calculate risk-reward ratio
  const totalRisk = shares * riskPerShare;
  const riskRewardRatio = potentialProfit / totalRisk;

  return {
    shares,
    maxRiskAmount,
    entryPrice,
    stopLossPrice,
    riskPerShare,
    target1Price,
    target1Shares,
    runnerShares,
    potentialProfit,
    riskRewardRatio,
    isValid: validationErrors.length === 0,
    validationErrors
  };
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format number with 2 decimal places
export function formatPrice(price: number): string {
  return price.toFixed(2);
}

// Calculate PnL for an active position
export function calculatePnL(
  entryPrice: number,
  currentPrice: number,
  shares: number,
  direction: 'long' | 'short'
): number {
  if (direction === 'long') {
    return (currentPrice - entryPrice) * shares;
  } else {
    return (entryPrice - currentPrice) * shares;
  }
}

// Check if Target 1 has been hit
export function isTarget1Hit(
  currentPrice: number,
  target1Price: number,
  direction: 'long' | 'short'
): boolean {
  if (direction === 'long') {
    return currentPrice >= target1Price;
  } else {
    return currentPrice <= target1Price;
  }
}

// Check if stop loss has been hit
export function isStopHit(
  currentPrice: number,
  stopPrice: number,
  direction: 'long' | 'short'
): boolean {
  if (direction === 'long') {
    return currentPrice <= stopPrice;
  } else {
    return currentPrice >= stopPrice;
  }
}

// Get risk level color based on percentage of account at risk
export function getRiskLevelColor(riskPercentage: number): 'green' | 'yellow' | 'red' {
  if (riskPercentage <= 1) return 'green';
  if (riskPercentage <= 2) return 'yellow';
  return 'red';
}

// Validate trade before execution
export function validateTradeExecution(
  accountBalance: number,
  positionSize: PositionSizeResult,
  existingPositions: number = 0
): { canTrade: boolean; reason?: string } {
  // Check if position size is valid
  if (!positionSize.isValid) {
    return { 
      canTrade: false, 
      reason: positionSize.validationErrors.join(', ') 
    };
  }

  // Check if shares are available
  if (positionSize.shares < MIN_SHARES) {
    return { 
      canTrade: false, 
      reason: 'Position size too small - minimum 1 share required' 
    };
  }

  // Check max concurrent positions (optional limit)
  const MAX_CONCURRENT_POSITIONS = 3;
  if (existingPositions >= MAX_CONCURRENT_POSITIONS) {
    return { 
      canTrade: false, 
      reason: `Maximum ${MAX_CONCURRENT_POSITIONS} concurrent positions allowed` 
    };
  }

  return { canTrade: true };
}
