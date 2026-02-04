import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface PropertyFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  county: string;
  onCountyChange: (value: string) => void;
  counties: string[];
}

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "NEW_LEAD", label: "New Lead" },
  { value: "ANALYZED", label: "Analyzed" },
  { value: "SELLER_OUTREACH", label: "Seller Outreach" },
  { value: "SELLER_NEGOTIATING", label: "Negotiating" },
  { value: "UNDER_CONTRACT", label: "Under Contract" },
  { value: "BUYER_MARKETING", label: "Buyer Marketing" },
  { value: "BUYER_FOUND", label: "Buyer Found" },
  { value: "ASSIGNMENT_DRAFTED", label: "Assignment Drafted" },
  { value: "SENT_TO_TITLE", label: "Sent to Title" },
  { value: "CLOSED", label: "Closed" },
  { value: "DEAD", label: "Dead" },
];

export function PropertyFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  county,
  onCountyChange,
  counties,
}: PropertyFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by address, city, or seller..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={county} onValueChange={onCountyChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="County" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Counties</SelectItem>
          {counties.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
