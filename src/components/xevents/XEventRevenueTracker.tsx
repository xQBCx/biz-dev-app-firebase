import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Ticket, 
  Users,
  BarChart3,
  PieChart
} from "lucide-react";
import { XEvent, XEventTicketType, XEventRegistration } from "@/hooks/useXEvents";

interface XEventRevenueTrackerProps {
  event: XEvent;
  ticketTypes: XEventTicketType[];
  registrations: XEventRegistration[];
}

export const XEventRevenueTracker = ({ 
  event, 
  ticketTypes, 
  registrations 
}: XEventRevenueTrackerProps) => {
  const stats = useMemo(() => {
    // Calculate revenue by ticket type
    const ticketStats = ticketTypes.map(ticket => {
      const ticketRegistrations = registrations.filter(r => r.ticket_type_id === ticket.id);
      const revenue = ticketRegistrations.reduce((sum, r) => sum + (r.amount_paid_cents || 0), 0);
      const soldCount = ticketRegistrations.length;
      const capacityUsed = ticket.quantity_total 
        ? (soldCount / ticket.quantity_total) * 100 
        : 0;

      return {
        id: ticket.id,
        name: ticket.name,
        price: ticket.price_cents / 100,
        soldCount,
        revenue: revenue / 100,
        capacityTotal: ticket.quantity_total || 0,
        capacityUsed,
      };
    });

    // Total stats
    const totalRevenue = ticketStats.reduce((sum, t) => sum + t.revenue, 0);
    const totalTicketsSold = ticketStats.reduce((sum, t) => sum + t.soldCount, 0);
    const paidRegistrations = registrations.filter(r => r.payment_status === 'paid').length;
    const pendingRevenue = registrations
      .filter(r => r.payment_status === 'pending')
      .reduce((sum, r) => sum + (r.amount_paid_cents || 0), 0) / 100;

    return {
      ticketStats,
      totalRevenue,
      totalTicketsSold,
      paidRegistrations,
      pendingRevenue,
      averageTicketPrice: totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0,
    };
  }, [ticketTypes, registrations]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold">Revenue Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Ticket sales and financial overview
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            ${stats.totalRevenue.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Tickets Sold</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalTicketsSold}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-muted-foreground">Avg. Ticket</span>
          </div>
          <p className="text-2xl font-bold">${stats.averageTicketPrice.toFixed(0)}</p>
        </Card>

        <Card className="p-4 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            ${stats.pendingRevenue.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Ticket Breakdown */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Ticket Breakdown</h4>
        
        {stats.ticketStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No ticket types configured
          </p>
        ) : (
          <div className="space-y-3">
            {stats.ticketStats.map(ticket => (
              <div key={ticket.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{ticket.name}</span>
                    <Badge variant="outline" className="text-xs">
                      ${ticket.price}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {ticket.soldCount}{ticket.capacityTotal > 0 ? `/${ticket.capacityTotal}` : ''} sold
                    </span>
                    <span className="font-medium text-emerald-600">
                      ${ticket.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                {ticket.capacityTotal > 0 && (
                  <Progress 
                    value={ticket.capacityUsed} 
                    className="h-1.5"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Status */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Payment Status</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
              {stats.paidRegistrations} Paid
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
              {registrations.filter(r => r.payment_status === 'pending').length} Pending
            </Badge>
            <Badge variant="outline" className="bg-muted">
              {registrations.filter(r => r.payment_status === 'free').length} Free
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
