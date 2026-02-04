import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { PromptFilters as FilterType, PROMPT_CATEGORIES } from "@/hooks/usePromptLibrary";

interface PromptFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export const PromptFilters = ({ filters, onFiltersChange }: PromptFiltersProps) => {
  const updateFilter = (key: keyof FilterType, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: "",
      status: "",
      priority: "",
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.status || filters.priority;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          placeholder="Search prompts..."
          className="pl-9 bg-background"
        />
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Select value={filters.category || "all"} onValueChange={(v) => updateFilter("category", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PROMPT_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status || "all"} onValueChange={(v) => updateFilter("status", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="used">Used</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority || "all"} onValueChange={(v) => updateFilter("priority", v === "all" ? "" : v)}>
          <SelectTrigger className="w-[120px] bg-background">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
