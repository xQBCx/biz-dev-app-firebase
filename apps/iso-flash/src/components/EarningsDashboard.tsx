import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEarnings } from "@/hooks/useEarnings";
import { Skeleton } from "@/components/ui/skeleton";

interface EarningsDashboardProps {
  photographerId: string;
}

export function EarningsDashboard({ photographerId }: EarningsDashboardProps) {
  const { data: earnings, isLoading } = useEarnings(photographerId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!earnings) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-success" />
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </div>
          <p className="text-2xl font-bold text-success">${earnings.totalEarnings.toFixed(2)}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
          <p className="text-2xl font-bold">${earnings.monthlyEarnings.toFixed(2)}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-secondary" />
            <p className="text-sm text-muted-foreground">This Week</p>
          </div>
          <p className="text-2xl font-bold">${earnings.weeklyEarnings.toFixed(2)}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-warning" />
            <p className="text-sm text-muted-foreground">Avg/Session</p>
          </div>
          <p className="text-2xl font-bold">${earnings.averageEarnings.toFixed(2)}</p>
        </Card>
      </div>

      {/* Transaction History */}
      {earnings.transactions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {earnings.transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {transaction.clientName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success">+${transaction.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{transaction.duration} min</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {earnings.completedSessions === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No completed sessions yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your earnings will appear here once you complete sessions</p>
        </Card>
      )}
    </div>
  );
}
