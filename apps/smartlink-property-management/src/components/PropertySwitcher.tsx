import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Building, ChevronDown } from 'lucide-react';

export const PropertySwitcher = () => {
  const { profile } = useAuth();
  const [selectedPropertyId, setSelectedPropertyId] = useState(profile?.property_id);

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', profile?.org_id],
    queryFn: async () => {
      if (!profile?.org_id) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.org_id,
  });

  const selectedProperty = properties?.find(p => p.id === selectedPropertyId);

  if (isLoading || !properties?.length) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
        <Building className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Microtel By Wyndham, Georgetown</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-background hover:bg-muted/50 border border-border shadow-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Select property"
        >
          <Building className="h-4 w-4" />
          <span className="font-medium">
            {selectedProperty?.name || 'Select Property'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-background border border-border shadow-lg z-[9999]"
        sideOffset={5}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.currentTarget.blur();
          }
        }}
      >
        {properties.map((property) => (
          <DropdownMenuItem
            key={property.id}
            onClick={() => setSelectedPropertyId(property.id)}
            className={`
              flex items-center gap-2 px-3 py-2 cursor-pointer
              hover:bg-muted focus:bg-muted focus:outline-none
              ${selectedPropertyId === property.id ? 'bg-primary/10 text-primary' : ''}
            `}
            role="menuitem"
            tabIndex={0}
          >
            <Building className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="font-medium">{property.name}</span>
              <span className="text-xs text-muted-foreground">
                {property.city}, {property.state}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};