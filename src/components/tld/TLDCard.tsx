import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface TLDCardProps {
  tld: {
    id: string;
    tld_name: string;
    display_name?: string;
    provider: string;
    blockchain_network?: string;
    acquisition_date?: string;
    acquisition_cost_usd?: number;
  };
  stats?: {
    total: number;
    available: number;
    allocated: number;
    sold: number;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function TLDCard({ tld, stats, isSelected, onSelect }: TLDCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {tld.display_name || `.${tld.tld_name}`}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {tld.provider}
          </Badge>
        </div>
        {tld.blockchain_network && (
          <Badge variant="secondary" className="w-fit text-xs">
            {tld.blockchain_network}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Total Domains</p>
            <p className="font-semibold">{stats?.total || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Available</p>
            <p className="font-semibold text-green-600">{stats?.available || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Allocated</p>
            <p className="font-semibold text-blue-600">{stats?.allocated || 0}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Sold</p>
            <p className="font-semibold text-amber-600">{stats?.sold || 0}</p>
          </div>
        </div>

        {tld.acquisition_date && (
          <p className="text-xs text-muted-foreground">
            Acquired {format(new Date(tld.acquisition_date), "MMM d, yyyy")}
            {tld.acquisition_cost_usd && (
              <span> · ${tld.acquisition_cost_usd.toLocaleString()}</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
