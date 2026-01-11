import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface PnLEntry {
  id: string;
  entry_date: string;
  entry_type: string;
  category: string;
  description: string;
  amount: number;
  source_entity_type: string;
  source_entity_id: string;
}

export const PersonalPnLStatement = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const getDateRange = () => {
    const now = new Date();
    switch (period) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: subDays(now, 90), end: now };
    }
  };

  const { data: entries, isLoading } = useQuery({
    queryKey: ['personal-pnl-entries', user?.id, period],
    queryFn: async () => {
      if (!user?.id) return [];
      const range = getDateRange();
      const { data, error } = await supabase
        .from('personal_pnl_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', format(range.start, 'yyyy-MM-dd'))
        .lte('entry_date', format(range.end, 'yyyy-MM-dd'))
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      return data as PnLEntry[];
    },
    enabled: !!user?.id
  });

  // Calculate totals
  const valueCreated = entries?.filter(e => e.entry_type === 'value_created' || e.entry_type === 'income').reduce((sum, e) => sum + e.amount, 0) || 0;
  const valueInvested = entries?.filter(e => e.entry_type === 'value_invested' || e.entry_type === 'expense').reduce((sum, e) => sum + e.amount, 0) || 0;
  const netValue = valueCreated - valueInvested;

  // Group by category
  const byCategory = entries?.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, PnLEntry[]>) || {};

  const getCategoryTotal = (category: string, type: 'income' | 'expense') => {
    const types = type === 'income' ? ['value_created', 'income'] : ['value_invested', 'expense'];
    return byCategory[category]?.filter(e => types.includes(e.entry_type)).reduce((sum, e) => sum + e.amount, 0) || 0;
  };

  const incomeCategories = ['contributions', 'deals', 'commissions'];
  const expenseCategories = ['time', 'resources', 'learning'];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Personal P&L Statement</h3>
          <p className="text-sm text-muted-foreground">Track value created vs. value invested</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Value Created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${valueCreated.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-red-500/5 border-red-500/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Value Invested
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${valueInvested.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className={netValue >= 0 ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Net Value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netValue >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {netValue >= 0 ? '+' : '-'}${Math.abs(netValue).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* P&L Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Value Created (Income)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {incomeCategories.map(category => {
                  const total = getCategoryTotal(category, 'income');
                  const categoryEntries = byCategory[category]?.filter(e => ['value_created', 'income'].includes(e.entry_type)) || [];
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{category}</span>
                        <span className="text-green-600 font-medium">${total.toLocaleString()}</span>
                      </div>
                      {categoryEntries.slice(0, 3).map(entry => (
                        <div key={entry.id} className="flex justify-between text-sm text-muted-foreground pl-4">
                          <span>{entry.description || 'Entry'}</span>
                          <span>${entry.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {entries?.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No income entries for this period</p>
                )}
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Value Invested (Expenses)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseCategories.map(category => {
                  const total = getCategoryTotal(category, 'expense');
                  const categoryEntries = byCategory[category]?.filter(e => ['value_invested', 'expense'].includes(e.entry_type)) || [];
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{category}</span>
                        <span className="text-red-600 font-medium">${total.toLocaleString()}</span>
                      </div>
                      {categoryEntries.slice(0, 3).map(entry => (
                        <div key={entry.id} className="flex justify-between text-sm text-muted-foreground pl-4">
                          <span>{entry.description || 'Entry'}</span>
                          <span>${entry.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {entries?.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No expense entries for this period</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ROI Summary */}
          <Card className="bg-muted/30">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Return on Investment (ROI)</p>
                  <p className="text-3xl font-bold">
                    {valueInvested > 0 ? ((netValue / valueInvested) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">Period: {period}</Badge>
                  <Badge variant="outline">{entries?.length || 0} entries</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
