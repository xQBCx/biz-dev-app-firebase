import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Users, 
  DollarSign, 
  Clock,
  Handshake,
  FileCheck,
  AlertCircle,
  Building2,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

interface DealRoom {
  id: string;
  name: string;
  description: string | null;
  category: string;
  expected_deal_size_min: number | null;
  expected_deal_size_max: number | null;
  time_horizon: string;
  status: string;
  ai_analysis_enabled: boolean;
  created_at: string;
  participant_count?: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  active: { label: "Active", color: "bg-primary/20 text-primary" },
  voting: { label: "Voting", color: "bg-amber-500/20 text-amber-600" },
  approved: { label: "Approved", color: "bg-emerald-500/20 text-emerald-600" },
  executed: { label: "Executed", color: "bg-blue-500/20 text-blue-600" },
  cancelled: { label: "Cancelled", color: "bg-destructive/20 text-destructive" },
  archived: { label: "Archived", color: "bg-muted text-muted-foreground" },
};

const categoryLabels: Record<string, string> = {
  sales: "Sales",
  platform_build: "Platform Build",
  joint_venture: "Joint Venture",
  licensing: "Licensing",
  services: "Services",
  infrastructure: "Infrastructure",
  ip_creation: "IP Creation",
};

const DealRooms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasRole } = useUserRole();
  const isAdmin = hasRole("admin");
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchDealRooms();
    }
  }, [user]);

  const fetchDealRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("deal_rooms")
        .select(`
          *,
          deal_room_participants(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const roomsWithCounts = data?.map(room => ({
        ...room,
        participant_count: room.deal_room_participants?.[0]?.count || 0
      })) || [];

      setDealRooms(roomsWithCounts);
    } catch (error) {
      console.error("Error fetching deal rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = dealRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDealSize = (min: number | null, max: number | null) => {
    if (!min && !max) return "TBD";
    const format = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
      return `$${n}`;
    };
    if (min && max) return `${format(min)} - ${format(max)}`;
    if (min) return `${format(min)}+`;
    return `Up to ${format(max!)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Handshake className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Deal Rooms</h1>
              <p className="text-muted-foreground">
                Structured negotiation, transparent contributions, fair outcomes
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => navigate("/deal-rooms/new")} className="gap-2">
              <Plus className="w-4 h-4" />
              New Deal Room
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search deal rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card/50 border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dealRooms.length}</p>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/50 border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <FileCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dealRooms.filter(r => r.status === "active" || r.status === "voting").length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/50 border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dealRooms.filter(r => r.status === "executed").length}
                </p>
                <p className="text-sm text-muted-foreground">Executed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-card/50 border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {dealRooms.reduce((sum, r) => sum + (r.participant_count || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Participants</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Deal Room List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <Card className="p-12 text-center">
            <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Deal Rooms Yet</h3>
            <p className="text-muted-foreground mb-4">
              {isAdmin 
                ? "Create your first deal room to start structured negotiations."
                : "You haven't been invited to any deal rooms yet."}
            </p>
            {isAdmin && (
              <Button onClick={() => navigate("/deal-rooms/new")} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Deal Room
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRooms.map(room => (
              <Card
                key={room.id}
                className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/deal-rooms/${room.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{room.name}</h3>
                      <Badge className={statusConfig[room.status]?.color || ""}>
                        {statusConfig[room.status]?.label || room.status}
                      </Badge>
                      {room.ai_analysis_enabled && (
                        <Badge variant="outline" className="gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Enabled
                        </Badge>
                      )}
                    </div>
                    {room.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {room.description}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {categoryLabels[room.category] || room.category}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {formatDealSize(room.expected_deal_size_min, room.expected_deal_size_max)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {room.time_horizon.replace("_", " ")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {room.participant_count} participant{room.participant_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(room.created_at), "MMM d, yyyy")}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealRooms;
