import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Building2, Users, MapPin } from "lucide-react";

interface Partner {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string | null;
  city: string | null;
  address: string | null;
  created_at: string;
  staff_count: number;
  booking_count: number;
}

export default function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, [locationFilter]);

  const fetchPartners = async () => {
    setLoading(true);

    let query = supabase
      .from("businesses")
      .select(`
        *,
        business_members(count),
        bookings(count)
      `);

    if (locationFilter !== "all") {
      query = query.ilike("city", `%${locationFilter}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching partners:", error);
    } else {
      const formattedPartners = data?.map(p => ({
        ...p,
        staff_count: p.business_members?.[0]?.count || 0,
        booking_count: p.bookings?.[0]?.count || 0,
      })) || [];
      setPartners(formattedPartners);
    }
    setLoading(false);
  };

  const filteredPartners = partners.filter(p =>
    p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.business_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: partners.length,
    houston: partners.filter(p => p.city?.toLowerCase().includes("houston")).length,
    california: partners.filter(p => p.city?.toLowerCase().includes("california")).length,
    totalStaff: partners.reduce((sum, p) => sum + p.staff_count, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Partners</h2>
          <p className="text-muted-foreground">Manage all service partners</p>
        </div>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Total Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Houston
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.houston}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" /> California
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.california}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Partners</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredPartners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No partners found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.business_name}</TableCell>
                    <TableCell>{partner.business_email}</TableCell>
                    <TableCell>{partner.business_phone || "—"}</TableCell>
                    <TableCell>
                      {partner.city ? (
                        <Badge variant="outline">{partner.city}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{partner.staff_count}</TableCell>
                    <TableCell>{partner.booking_count}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(partner.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
