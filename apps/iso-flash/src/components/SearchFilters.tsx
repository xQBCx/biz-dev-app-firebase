import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, DollarSign, Star, MapPin } from "lucide-react";

export interface FilterOptions {
  maxRate: number;
  minRating: number;
  maxDistance: number;
}

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  photographerCount: number;
}

export function SearchFilters({ filters, onFiltersChange, photographerCount }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      maxRate: 200,
      minRating: 0,
      maxDistance: 10,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.maxRate < 200 || 
    filters.minRating > 0 || 
    filters.maxDistance < 10;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filter Photographers</SheetTitle>
          <SheetDescription>
            {photographerCount} photographer{photographerCount !== 1 ? 's' : ''} found
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* Hourly Rate Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                Max Hourly Rate
              </Label>
              <span className="text-sm font-bold">${localFilters.maxRate}/hr</span>
            </div>
            <Slider
              value={[localFilters.maxRate]}
              onValueChange={([value]) => setLocalFilters({ ...localFilters, maxRate: value })}
              min={25}
              max={200}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$25/hr</span>
              <span>$200/hr</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                Minimum Rating
              </Label>
              <span className="text-sm font-bold">{localFilters.minRating.toFixed(1)} ★</span>
            </div>
            <Slider
              value={[localFilters.minRating]}
              onValueChange={([value]) => setLocalFilters({ ...localFilters, minRating: value })}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Any rating</span>
              <span>5.0 ★</span>
            </div>
          </div>

          {/* Distance Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Maximum Distance
              </Label>
              <span className="text-sm font-bold">{localFilters.maxDistance} km</span>
            </div>
            <Slider
              value={[localFilters.maxDistance]}
              onValueChange={([value]) => setLocalFilters({ ...localFilters, maxDistance: value })}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>10 km</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
