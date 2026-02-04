import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

interface PropertiesTableProps {
  properties: Property[];
  isLoading: boolean;
}

const statusColors: Record<string, string> = {
  NEW_LEAD: "bg-info/10 text-info border-info/20",
  ANALYZED: "bg-primary/10 text-primary border-primary/20",
  SELLER_OUTREACH: "bg-warning/10 text-warning border-warning/20",
  SELLER_NEGOTIATING: "bg-warning/10 text-warning border-warning/20",
  UNDER_CONTRACT: "bg-success/10 text-success border-success/20",
  BUYER_MARKETING: "bg-primary/10 text-primary border-primary/20",
  BUYER_FOUND: "bg-success/10 text-success border-success/20",
  ASSIGNMENT_DRAFTED: "bg-primary/10 text-primary border-primary/20",
  SENT_TO_TITLE: "bg-success/10 text-success border-success/20",
  CLOSED: "bg-success/10 text-success border-success/20",
  DEAD: "bg-destructive/10 text-destructive border-destructive/20",
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatCurrency = (value: number | null) => {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export function PropertiesTable({ properties, isLoading }: PropertiesTableProps) {
  const navigate = useNavigate();

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

  if (properties.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Address</TableHead>
            <TableHead>County</TableHead>
            <TableHead className="text-right">List Price</TableHead>
            <TableHead className="text-right">ARV</TableHead>
            <TableHead className="text-right">Offer</TableHead>
            <TableHead className="text-right">Spread</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow
              key={property.id}
              className="cursor-pointer"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <TableCell>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{property.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {[property.city, property.state, property.zip].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {property.county || "—"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(property.list_price)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(property.arv_estimate)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(property.seller_offer_price)}
              </TableCell>
              <TableCell className="text-right">
                {property.spread ? (
                  <span className={property.spread >= 10000 ? "text-success font-medium" : ""}>
                    {formatCurrency(property.spread)}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[property.status || "NEW_LEAD"]}
                >
                  {formatStatus(property.status || "NEW_LEAD")}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
