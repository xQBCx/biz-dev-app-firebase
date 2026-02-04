import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

type AggregationType = "count" | "sum" | "avg" | "min" | "max";
type TimeGranularity = "hour" | "day" | "week" | "month";

interface UseAnalyticsOptions {
  table: string;
  select?: string;
  filters?: Record<string, unknown>;
  dateField?: string;
  dateRange?: { start: Date; end: Date };
  groupBy?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
}

interface AggregateOptions {
  field: string;
  type: AggregationType;
}

interface TimeSeriesOptions {
  valueField: string;
  aggregation?: AggregationType;
  granularity?: TimeGranularity;
}

export function useAnalytics<T = unknown>({
  table,
  select = "*",
  filters,
  dateField,
  dateRange,
  groupBy,
  orderBy,
  limit,
  enabled = true,
}: UseAnalyticsOptions) {
  const queryKey = ["analytics", table, select, filters, dateField, dateRange, groupBy, orderBy, limit];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase.from(table as any).select(select);

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply date range
      if (dateField && dateRange) {
        query = query
          .gte(dateField, dateRange.start.toISOString())
          .lte(dateField, dateRange.end.toISOString());
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T[];
    },
    enabled,
  });

  // Utility functions for data transformation
  const aggregate = useMemo(() => {
    return (options: AggregateOptions): number => {
      if (!data || data.length === 0) return 0;

      const values = data
        .map((item: any) => Number(item[options.field]))
        .filter((v) => !isNaN(v));

      switch (options.type) {
        case "count":
          return values.length;
        case "sum":
          return values.reduce((a, b) => a + b, 0);
        case "avg":
          return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        case "min":
          return Math.min(...values);
        case "max":
          return Math.max(...values);
        default:
          return 0;
      }
    };
  }, [data]);

  const groupByField = useMemo(() => {
    return (field: string): Record<string, T[]> => {
      if (!data) return {};
      return data.reduce((acc: Record<string, T[]>, item: any) => {
        const key = String(item[field] ?? "unknown");
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    };
  }, [data]);

  const toTimeSeries = useMemo(() => {
    return (options: TimeSeriesOptions): { date: string; value: number }[] => {
      if (!data || !dateField) return [];

      const grouped: Record<string, number[]> = {};

      data.forEach((item: any) => {
        const date = new Date(item[dateField]);
        let key: string;

        switch (options.granularity) {
          case "hour":
            key = date.toISOString().slice(0, 13);
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().slice(0, 10);
            break;
          case "month":
            key = date.toISOString().slice(0, 7);
            break;
          case "day":
          default:
            key = date.toISOString().slice(0, 10);
        }

        if (!grouped[key]) grouped[key] = [];
        const value = Number(item[options.valueField]);
        if (!isNaN(value)) grouped[key].push(value);
      });

      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, values]) => {
          let value: number;
          switch (options.aggregation) {
            case "sum":
              value = values.reduce((a, b) => a + b, 0);
              break;
            case "avg":
              value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              break;
            case "min":
              value = Math.min(...values);
              break;
            case "max":
              value = Math.max(...values);
              break;
            case "count":
            default:
              value = values.length;
          }
          return { date, value };
        });
    };
  }, [data, dateField]);

  const toDistribution = useMemo(() => {
    return (field: string): { name: string; value: number }[] => {
      if (!data) return [];

      const counts: Record<string, number> = {};
      data.forEach((item: any) => {
        const key = String(item[field] ?? "unknown");
        counts[key] = (counts[key] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    };
  }, [data]);

  const calculateTrend = useMemo(() => {
    return (currentValue: number, previousValue: number): number => {
      if (previousValue === 0) return currentValue > 0 ? 100 : 0;
      return Math.round(((currentValue - previousValue) / previousValue) * 100);
    };
  }, []);

  return {
    data: data ?? [],
    isLoading,
    error,
    refetch,
    // Utility functions
    aggregate,
    groupByField,
    toTimeSeries,
    toDistribution,
    calculateTrend,
    // Convenience accessors
    count: data?.length ?? 0,
    isEmpty: !data || data.length === 0,
  };
}

// Hook for comparing current vs previous period
export function useAnalyticsComparison(options: UseAnalyticsOptions) {
  const now = new Date();
  const periodDays = options.dateRange
    ? Math.ceil((options.dateRange.end.getTime() - options.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const currentPeriod = useAnalytics({
    ...options,
    dateRange: options.dateRange ?? {
      start: new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000),
      end: now,
    },
  });

  const previousStart = new Date(
    (options.dateRange?.start ?? new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)).getTime() -
      periodDays * 24 * 60 * 60 * 1000
  );
  const previousEnd = new Date(
    (options.dateRange?.start ?? new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)).getTime()
  );

  const previousPeriod = useAnalytics({
    ...options,
    dateRange: { start: previousStart, end: previousEnd },
  });

  return {
    current: currentPeriod,
    previous: previousPeriod,
    isLoading: currentPeriod.isLoading || previousPeriod.isLoading,
  };
}
