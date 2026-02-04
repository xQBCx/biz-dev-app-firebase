import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";

interface StaffMember {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  business: {
    business_name: string;
    city: string | null;
  };
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, [locationFilter]);

  const fetchStaff = async () => {
    setLoading(true);

    // Get all staff members with their business and profile info
    let query = supabase
      .from("business_members")
      .select(`
        *,
        businesses!inner(business_name, city)
      `)
      .eq("role", "staff");

    if (locationFilter !== "all") {
      query = query.ilike("businesses.city", `%${locationFilter}%`);
    }

    const { data: members, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching staff:", error);
      setLoading(false);
      return;
    }

    // Fetch profiles for all staff
    const userIds = members?.map(m => m.user_id) || [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]));

    const formattedStaff = members?.map(m => ({
      ...m,
      business: m.businesses,
      profile: profileMap.get(m.user_id) || null,
    })) || [];

    setStaff(formattedStaff);
    setLoading(false);
  };

  const filteredStaff = staff.filter(s => {
    const name = s.profile?.full_name || s.profile?.email || "";
    const business = s.business?.business_name || "";
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || business.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Staff Members</h2>
          <p className="text-muted-foreground">View all staff across partners</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Houston Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.business?.city?.toLowerCase().includes("houston")).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">California Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter(s => s.business?.city?.toLowerCase().includes("california")).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Staff Members</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.profile?.full_name || "—"}
                    </TableCell>
                    <TableCell>{member.profile?.email || "—"}</TableCell>
                    <TableCell>{member.profile?.phone || "—"}</TableCell>
                    <TableCell>{member.business?.business_name}</TableCell>
                    <TableCell>
                      {member.business?.city ? (
                        <Badge variant="outline">{member.business.city}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.created_at).toLocaleDateString()}
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
