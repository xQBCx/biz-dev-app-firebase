import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Buyer = Tables<"buyers">;

interface BuyersTableProps {
  buyers: Buyer[];
  isLoading: boolean;
}

const formatCurrency = (value: number | null) => {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export function BuyersTable({ buyers, isLoading }: BuyersTableProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (buyers.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Target Counties</TableHead>
            <TableHead className="text-right">Price Range</TableHead>
            <TableHead>Property Types</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map((buyer) => (
            <TableRow key={buyer.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{buyer.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {buyer.email && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {buyer.email}
                    </div>
                  )}
                  {buyer.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {buyer.phone}
                    </div>
                  )}
                  {!buyer.email && !buyer.phone && (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {buyer.target_counties ? (
                  <div className="flex flex-wrap gap-1">
                    {buyer.target_counties.split(",").slice(0, 3).map((county) => (
                      <Badge key={county} variant="secondary" className="text-xs">
                        {county.trim()}
                      </Badge>
                    ))}
                    {buyer.target_counties.split(",").length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{buyer.target_counties.split(",").length - 3}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {buyer.min_price || buyer.max_price ? (
                  <span className="text-sm">
                    {formatCurrency(buyer.min_price)} – {formatCurrency(buyer.max_price)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {buyer.property_types ? (
                  <span className="text-sm text-muted-foreground">
                    {buyer.property_types}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    buyer.status === "ACTIVE"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {buyer.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
