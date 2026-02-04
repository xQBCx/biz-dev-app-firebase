import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Users, Calendar, Building2 } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export default function AdminAnalytics() {
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30days");
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
    avgBookingValue: 0,
    newCustomers: 0,
    partnerCount: 0,
  });
  const [revenueByLocation, setRevenueByLocation] = useState<any[]>([]);
  const [topPartners, setTopPartners] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [locationFilter, dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    if (dateRange === "7days") return subDays(now, 7).toISOString();
    if (dateRange === "30days") return subDays(now, 30).toISOString();
    if (dateRange === "thisMonth") return startOfMonth(now).toISOString();
    return subDays(now, 90).toISOString();
  };

  const fetchAnalytics = async () => {
    const dateFilter = getDateFilter();

    // Fetch bookings with optional location filter
    let bookingsQuery = supabase
      .from("bookings")
      .select("*, businesses!inner(city)")
      .gte("created_at", dateFilter);

    if (locationFilter !== "all") {
      bookingsQuery = bookingsQuery.ilike("businesses.city", `%${locationFilter}%`);
    }

    const { data: bookings } = await bookingsQuery;

    // Fetch transactions
    let transactionsQuery = supabase
      .from("transactions")
      .select("*, businesses!inner(city, business_name)")
      .gte("created_at", dateFilter);

    if (locationFilter !== "all") {
      transactionsQuery = transactionsQuery.ilike("businesses.city", `%${locationFilter}%`);
    }

    const { data: transactions } = await transactionsQuery;

    // Fetch partners
    let partnersQuery = supabase.from("businesses").select("*");
    if (locationFilter !== "all") {
      partnersQuery = partnersQuery.ilike("city", `%${locationFilter}%`);
    }

    const { data: partners } = await partnersQuery;

    // Calculate analytics
    const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const completedBookings = bookings?.filter(b => b.status === "completed").length || 0;
    const avgBookingValue = bookings?.length ? totalRevenue / bookings.length : 0;

    // Get unique customers
    const uniqueCustomers = new Set(bookings?.map(b => b.customer_email)).size;

    setAnalytics({
      totalRevenue,
      totalBookings: bookings?.length || 0,
      completedBookings,
      avgBookingValue,
      newCustomers: uniqueCustomers,
      partnerCount: partners?.length || 0,
    });

    // Revenue by location
    const locationRevenue: Record<string, number> = {};
    transactions?.forEach(t => {
      const city = t.businesses?.city || "Unknown";
      locationRevenue[city] = (locationRevenue[city] || 0) + Number(t.amount);
    });
    setRevenueByLocation(
      Object.entries(locationRevenue).map(([city, revenue]) => ({ city, revenue }))
    );

    // Top partners by revenue
    const partnerRevenue: Record<string, { name: string; revenue: number; bookings: number }> = {};
    transactions?.forEach(t => {
      const name = t.businesses?.business_name || "Unknown";
      const id = t.partner_business_id;
      if (!partnerRevenue[id]) {
        partnerRevenue[id] = { name, revenue: 0, bookings: 0 };
      }
      partnerRevenue[id].revenue += Number(t.amount);
      partnerRevenue[id].bookings += 1;
    });
    setTopPartners(
      Object.values(partnerRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Business performance across locations</p>
        </div>
        <div className="flex gap-3">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Houston">Houston</SelectItem>
              <SelectItem value="California">California</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {locationFilter === "all" ? "All locations" : locationFilter}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.completedBookings} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.avgBookingValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.newCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.partnerCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Location</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByLocation.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {revenueByLocation.map((loc) => (
                  <div key={loc.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">{loc.city}</span>
                    </div>
                    <span className="font-bold">${loc.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Partners by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {topPartners.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {topPartners.map((partner, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.bookings} bookings</p>
                    </div>
                    <span className="font-bold text-green-600">${partner.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
