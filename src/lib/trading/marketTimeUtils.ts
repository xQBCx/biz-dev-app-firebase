// Market Time Utilities - All times hardcoded to EST (New York)

export interface MarketBar {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface ORBLevels {
  pmHigh: number;
  pmLow: number;
  orbHigh: number;
  orbLow: number;
  orbMidline: number;
  calculatedAt: Date;
}

// Convert any time to EST
export function toEST(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

// Get current time in EST
export function getCurrentEST(): Date {
  return toEST(new Date());
}

// Get EST hours and minutes from a date
export function getESTTime(date: Date): { hours: number; minutes: number } {
  const estDate = toEST(date);
  return {
    hours: estDate.getHours(),
    minutes: estDate.getMinutes()
  };
}

// Check if current time is in pre-market (04:00 - 09:30 EST)
export function isPreMarket(date?: Date): boolean {
  const { hours, minutes } = getESTTime(date || new Date());
  const totalMinutes = hours * 60 + minutes;
  const preMarketStart = 4 * 60; // 04:00
  const preMarketEnd = 9 * 60 + 30; // 09:30
  return totalMinutes >= preMarketStart && totalMinutes < preMarketEnd;
}

// Check if current time is in no-trade zone (09:30 - 09:45 EST)
export function isNoTradeZone(date?: Date): boolean {
  const { hours, minutes } = getESTTime(date || new Date());
  const totalMinutes = hours * 60 + minutes;
  const noTradeStart = 9 * 60 + 30; // 09:30
  const noTradeEnd = 9 * 60 + 45; // 09:45
  return totalMinutes >= noTradeStart && totalMinutes < noTradeEnd;
}

// Check if current time is in regular trading session (09:45 - 16:00 EST)
export function isRegularSession(date?: Date): boolean {
  const { hours, minutes } = getESTTime(date || new Date());
  const totalMinutes = hours * 60 + minutes;
  const regularStart = 9 * 60 + 45; // 09:45
  const regularEnd = 16 * 60; // 16:00
  return totalMinutes >= regularStart && totalMinutes < regularEnd;
}

// Check if market is open (including pre-market)
export function isMarketOpen(date?: Date): boolean {
  const { hours, minutes } = getESTTime(date || new Date());
  const totalMinutes = hours * 60 + minutes;
  const marketStart = 4 * 60; // 04:00
  const marketEnd = 16 * 60; // 16:00
  return totalMinutes >= marketStart && totalMinutes < marketEnd;
}

// Get market status label
export function getMarketStatus(date?: Date): 'pre-market' | 'settling' | 'open' | 'closed' {
  if (isPreMarket(date)) return 'pre-market';
  if (isNoTradeZone(date)) return 'settling';
  if (isRegularSession(date)) return 'open';
  return 'closed';
}

// Get formatted market status message
export function getMarketStatusMessage(date?: Date): string {
  const status = getMarketStatus(date);
  switch (status) {
    case 'pre-market':
      return 'Pre-Market Session (04:00-09:30 EST)';
    case 'settling':
      return 'Market settling. Wait for ORB formation.';
    case 'open':
      return 'Regular Session Active (09:45-16:00 EST)';
    case 'closed':
      return 'Market Closed';
  }
}

// Calculate Pre-Market High and Low from bars
export function calculatePMHighLow(bars: MarketBar[]): { pmHigh: number; pmLow: number } | null {
  const pmBars = bars.filter(bar => {
    const { hours, minutes } = getESTTime(bar.timestamp);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 4 * 60 && totalMinutes < 9 * 60 + 30;
  });

  if (pmBars.length === 0) return null;

  const pmHigh = Math.max(...pmBars.map(b => b.high));
  const pmLow = Math.min(...pmBars.map(b => b.low));

  return { pmHigh, pmLow };
}

// Calculate Opening Range Breakout levels from first 15 minutes (09:30-09:45)
export function calculateORB(bars: MarketBar[]): { orbHigh: number; orbLow: number; orbMidline: number } | null {
  const orbBars = bars.filter(bar => {
    const { hours, minutes } = getESTTime(bar.timestamp);
    const totalMinutes = hours * 60 + minutes;
    // First three 5-minute candles: 09:30, 09:35, 09:40
    return totalMinutes >= 9 * 60 + 30 && totalMinutes < 9 * 60 + 45;
  });

  if (orbBars.length < 3) return null;

  const orbHigh = Math.max(...orbBars.map(b => b.high));
  const orbLow = Math.min(...orbBars.map(b => b.low));
  const orbMidline = orbLow + (orbHigh - orbLow) / 2;

  return { orbHigh, orbLow, orbMidline };
}

// Calculate full ORB levels including pre-market
export function calculateFullORBLevels(bars: MarketBar[]): ORBLevels | null {
  const pmLevels = calculatePMHighLow(bars);
  const orbLevels = calculateORB(bars);

  if (!pmLevels || !orbLevels) return null;

  return {
    ...pmLevels,
    ...orbLevels,
    calculatedAt: new Date()
  };
}

// Format time for display in EST
export function formatESTTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

// Get time until next market event
export function getTimeUntilNextEvent(date?: Date): { event: string; minutes: number } {
  const { hours, minutes } = getESTTime(date || new Date());
  const totalMinutes = hours * 60 + minutes;

  // Before pre-market
  if (totalMinutes < 4 * 60) {
    return { event: 'Pre-Market Open', minutes: 4 * 60 - totalMinutes };
  }
  // During pre-market
  if (totalMinutes < 9 * 60 + 30) {
    return { event: 'Market Open', minutes: 9 * 60 + 30 - totalMinutes };
  }
  // During settling
  if (totalMinutes < 9 * 60 + 45) {
    return { event: 'ORB Formation', minutes: 9 * 60 + 45 - totalMinutes };
  }
  // During regular session
  if (totalMinutes < 16 * 60) {
    return { event: 'Market Close', minutes: 16 * 60 - totalMinutes };
  }
  // After hours
  return { event: 'Next Pre-Market', minutes: 24 * 60 - totalMinutes + 4 * 60 };
}
