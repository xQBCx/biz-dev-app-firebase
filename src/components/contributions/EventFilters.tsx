import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';

export interface EventFiltersState {
  search: string;
  eventType: string;
  actorType: string;
  anchorStatus: string;
}

interface EventFiltersProps {
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
}

const eventTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'task_completed', label: 'Task Completed' },
  { value: 'agent_executed', label: 'Agent Executed' },
  { value: 'outreach_sent', label: 'Outreach Sent' },
  { value: 'meeting_held', label: 'Meeting Held' },
  { value: 'deal_advanced', label: 'Deal Advanced' },
  { value: 'content_created', label: 'Content Created' },
];

const actorTypes = [
  { value: 'all', label: 'All Actors' },
  { value: 'human', label: 'Human' },
  { value: 'agent', label: 'Agent' },
];

const anchorStatuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'queued', label: 'Queued' },
  { value: 'anchored', label: 'Anchored' },
  { value: 'failed', label: 'Failed' },
];

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const hasActiveFilters = 
    filters.search || 
    filters.eventType !== 'all' || 
    filters.actorType !== 'all' || 
    filters.anchorStatus !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      eventType: 'all',
      actorType: 'all',
      anchorStatus: 'all',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        
        <Select
          value={filters.eventType}
          onValueChange={(value) => onFiltersChange({ ...filters, eventType: value })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.actorType}
          onValueChange={(value) => onFiltersChange({ ...filters, actorType: value })}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Actor" />
          </SelectTrigger>
          <SelectContent>
            {actorTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.anchorStatus}
          onValueChange={(value) => onFiltersChange({ ...filters, anchorStatus: value })}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Anchor Status" />
          </SelectTrigger>
          <SelectContent>
            {anchorStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters active</span>
        </div>
      )}
    </div>
  );
}
