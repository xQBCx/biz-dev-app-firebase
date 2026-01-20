import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Area
} from 'recharts';
import { MarketBar, ORBLevels } from '@/lib/trading/marketTimeUtils';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface LiveCandlestickChartProps {
  candles: MarketBar[];
  orbLevels: ORBLevels | null;
  currentPrice: number;
  symbol?: string;
  isLoading?: boolean;
}

interface CandleData {
  time: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  candleBody: [number, number];
  wick: [number, number];
  isGreen: boolean;
}

export function LiveCandlestickChart({
  candles,
  orbLevels,
  currentPrice,
  symbol = 'SPY',
  isLoading = false,
}: LiveCandlestickChartProps) {
  // Transform candles for recharts
  const chartData: CandleData[] = useMemo(() => {
    return candles.slice(-50).map((candle) => {
      const isGreen = candle.close >= candle.open;
      return {
        time: candle.timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timestamp: candle.timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        candleBody: [candle.open, candle.close] as [number, number],
        wick: [candle.low, candle.high] as [number, number],
        isGreen,
      };
    });
  }, [candles]);

  // Calculate price range for Y axis
  const priceRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100 };
    
    let min = Math.min(...chartData.map(d => d.low));
    let max = Math.max(...chartData.map(d => d.high));
    
    // Include ORB levels in range
    if (orbLevels) {
      min = Math.min(min, orbLevels.orbLow, orbLevels.pmLow);
      max = Math.max(max, orbLevels.orbHigh, orbLevels.pmHigh);
    }
    
    // Add 0.5% padding
    const padding = (max - min) * 0.005;
    return { min: min - padding, max: max + padding };
  }, [chartData, orbLevels]);

  // Price change from first candle
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { value: 0, percent: 0 };
    const first = chartData[0].open;
    const change = currentPrice - first;
    const percent = (change / first) * 100;
    return { value: change, percent };
  }, [chartData, currentPrice]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload as CandleData;
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium">{data.time}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-muted-foreground">
          <span>Open:</span>
          <span className="font-mono">${data.open.toFixed(2)}</span>
          <span>High:</span>
          <span className="font-mono">${data.high.toFixed(2)}</span>
          <span>Low:</span>
          <span className="font-mono">${data.low.toFixed(2)}</span>
          <span>Close:</span>
          <span className={`font-mono ${data.isGreen ? 'text-green-500' : 'text-red-500'}`}>
            ${data.close.toFixed(2)}
          </span>
          <span>Volume:</span>
          <span className="font-mono">{(data.volume / 1000).toFixed(0)}K</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p>Loading market data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{symbol} · 5m</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">
                ${currentPrice.toFixed(2)}
              </span>
              <Badge 
                variant="outline" 
                className={priceChange.value >= 0 ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}
              >
                {priceChange.value >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {priceChange.value >= 0 ? '+' : ''}{priceChange.value.toFixed(2)} ({priceChange.percent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-blue-500"></span>PM Levels
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-green-500"></span>ORB Levels
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-yellow-500"></span>Midline
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[priceRange.min, priceRange.max]} 
                tick={{ fontSize: 10 }} 
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* ORB Reference Lines */}
              {orbLevels && (
                <>
                  {/* PM High - Blue dashed */}
                  <ReferenceLine 
                    y={orbLevels.pmHigh} 
                    stroke="#3b82f6" 
                    strokeDasharray="5 5" 
                    strokeWidth={1}
                    label={{ value: 'PM High', position: 'left', fontSize: 10, fill: '#3b82f6' }}
                  />
                  {/* PM Low - Blue dashed */}
                  <ReferenceLine 
                    y={orbLevels.pmLow} 
                    stroke="#3b82f6" 
                    strokeDasharray="5 5" 
                    strokeWidth={1}
                    label={{ value: 'PM Low', position: 'left', fontSize: 10, fill: '#3b82f6' }}
                  />
                  {/* ORB High - Green solid */}
                  <ReferenceLine 
                    y={orbLevels.orbHigh} 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    label={{ value: 'ORB High', position: 'left', fontSize: 10, fill: '#22c55e' }}
                  />
                  {/* ORB Low - Green solid */}
                  <ReferenceLine 
                    y={orbLevels.orbLow} 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    label={{ value: 'ORB Low', position: 'left', fontSize: 10, fill: '#22c55e' }}
                  />
                  {/* Midline - Yellow */}
                  <ReferenceLine 
                    y={orbLevels.orbMidline} 
                    stroke="#eab308" 
                    strokeDasharray="3 3" 
                    strokeWidth={1}
                    label={{ value: 'Midline', position: 'left', fontSize: 10, fill: '#eab308' }}
                  />
                </>
              )}
              
              {/* Candlestick bodies using stacked bars */}
              <Bar 
                dataKey="candleBody" 
                barSize={8}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const isGreen = payload.isGreen;
                  const fill = isGreen ? '#22c55e' : '#ef4444';
                  const actualHeight = Math.max(Math.abs(height), 1);
                  const actualY = height >= 0 ? y : y + height;
                  
                  return (
                    <g>
                      {/* Wick */}
                      <line
                        x1={x + width / 2}
                        y1={props.background?.y || y}
                        x2={x + width / 2}
                        y2={(props.background?.y || y) + (props.background?.height || height)}
                        stroke={fill}
                        strokeWidth={1}
                      />
                      {/* Body */}
                      <rect
                        x={x}
                        y={actualY}
                        width={width}
                        height={actualHeight}
                        fill={fill}
                        rx={1}
                      />
                    </g>
                  );
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
