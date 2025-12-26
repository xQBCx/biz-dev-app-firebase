import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  DollarSign, 
  Clock, 
  Vote,
  Calendar
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
  voting_rule: string;
  ai_analysis_enabled: boolean;
  created_by: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  sales: "Sales",
  platform_build: "Platform Build",
  joint_venture: "Joint Venture",
  licensing: "Licensing",
  services: "Services",
  infrastructure: "Infrastructure",
  ip_creation: "IP Creation",
};

const votingRuleLabels: Record<string, string> = {
  unanimous: "Unanimous (all must agree)",
  majority: "Majority vote",
  weighted: "Weighted by contribution",
  founder_override: "Founder has final say",
};

interface DealRoomOverviewProps {
  room: DealRoom;
}

export const DealRoomOverview = ({ room }: DealRoomOverviewProps) => {
  const formatDealSize = (min: number | null, max: number | null) => {
    if (!min && !max) return "To be determined";
    const fmt = (n: number) => {
      if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
      return `$${n.toLocaleString()}`;
    };
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Deal Details</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{categoryLabels[room.category] || room.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Deal Size</p>
              <p className="font-medium">
                {formatDealSize(room.expected_deal_size_min, room.expected_deal_size_max)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Horizon</p>
              <p className="font-medium capitalize">{room.time_horizon.replace("_", " ")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Vote className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Voting Rule</p>
              <p className="font-medium">{votingRuleLabels[room.voting_rule] || room.voting_rule}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{format(new Date(room.created_at), "MMMM d, yyyy")}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">How Deal Rooms Work</h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">1</Badge>
            <p>Each participant privately submits their contribution (time, capital, IP, network, risk).</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">2</Badge>
            <p>Optionally enable AI to analyze contributions, identify gaps, and generate fair deal structures.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">3</Badge>
            <p>Review proposed structures, discuss with comments, and vote on your preferred option.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">4</Badge>
            <p>Once approved, the system generates agreements for signature and tracks performance.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="shrink-0">5</Badge>
            <p>Anyone can exit cleanly at any time with documented IP boundaries and terms.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
