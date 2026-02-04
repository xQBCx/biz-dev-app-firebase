import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, Building2, Briefcase, Factory, Pin, Loader2
} from "lucide-react";
import type { MentionEntity } from "@/hooks/useMentionSystem";

interface MentionSuggestionsProps {
  suggestions: MentionEntity[];
  selectedIndex: number;
  isSearching: boolean;
  onSelect: (entity: MentionEntity) => void;
  position?: { top: number; left: number };
  className?: string;
}

const entityTypeIcons: Record<MentionEntity['entity_type'], React.ReactNode> = {
  contact: <User className="h-3 w-3" />,
  company: <Building2 className="h-3 w-3" />,
  user: <User className="h-3 w-3" />,
  deal_room: <Briefcase className="h-3 w-3" />,
  business: <Factory className="h-3 w-3" />
};

const entityTypeLabels: Record<MentionEntity['entity_type'], string> = {
  contact: 'Contact',
  company: 'Company',
  user: 'User',
  deal_room: 'Deal Room',
  business: 'Business'
};

export function MentionSuggestions({
  suggestions,
  selectedIndex,
  isSearching,
  onSelect,
  position,
  className
}: MentionSuggestionsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedItem = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (suggestions.length === 0 && !isSearching) {
    return (
      <div
        className={cn(
          "absolute z-50 w-72 bg-popover border rounded-lg shadow-lg p-3",
          className
        )}
        style={position}
      >
        <p className="text-sm text-muted-foreground text-center">
          No matches found. Keep typing to search...
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute z-50 w-72 bg-popover border rounded-lg shadow-lg overflow-hidden",
        className
      )}
      style={position}
    >
      {isSearching && (
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs text-muted-foreground">Searching...</span>
        </div>
      )}
      
      <div ref={listRef} className="max-h-64 overflow-y-auto">
        {suggestions.map((entity, index) => (
          <button
            key={entity.id}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
              "hover:bg-accent",
              index === selectedIndex && "bg-accent"
            )}
            onClick={() => onSelect(entity)}
          >
            <Avatar className="h-8 w-8 shrink-0">
              {entity.avatar_url ? (
                <AvatarImage src={entity.avatar_url} alt={entity.display_name} />
              ) : null}
              <AvatarFallback className="text-xs">
                {entity.display_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm truncate">
                  {entity.display_name}
                </span>
                {entity.pinned && (
                  <Pin className="h-3 w-3 text-primary shrink-0" />
                )}
              </div>
              {entity.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {entity.email}
                </p>
              )}
            </div>
            
            <Badge variant="outline" className="shrink-0 text-xs gap-1">
              {entityTypeIcons[entity.entity_type]}
              <span className="hidden sm:inline">{entityTypeLabels[entity.entity_type]}</span>
            </Badge>
          </button>
        ))}
      </div>
      
      <div className="px-3 py-2 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground">
          <kbd className="px-1 py-0.5 bg-background border rounded text-[10px]">↑↓</kbd>
          {" "}to navigate{" "}
          <kbd className="px-1 py-0.5 bg-background border rounded text-[10px]">Enter</kbd>
          {" "}to select{" "}
          <kbd className="px-1 py-0.5 bg-background border rounded text-[10px]">Esc</kbd>
          {" "}to close
        </p>
      </div>
    </div>
  );
}
