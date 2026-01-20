import React from 'react';
import { useArchetype, Archetype } from '@/contexts/ArchetypeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, Code, Wrench, Trophy, Rocket, DollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Code,
  Wrench,
  Trophy,
  Rocket,
  DollarSign,
  User,
};

interface ArchetypeSelectorProps {
  onSelect?: (archetype: Archetype) => void;
  compact?: boolean;
  className?: string;
}

export function ArchetypeSelector({ onSelect, compact = false, className }: ArchetypeSelectorProps) {
  const { archetypes, currentArchetype, setArchetype, isLoading } = useArchetype();

  const handleSelect = async (archetype: Archetype) => {
    try {
      await setArchetype(archetype.id);
      toast.success(`Archetype set to ${archetype.display_name}`);
      onSelect?.(archetype);
    } catch (error) {
      toast.error('Failed to update archetype');
    }
  };

  if (isLoading) {
    return (
      <div className={cn("grid gap-4", compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", className)}>
      {archetypes.map((archetype) => {
        const IconComponent = iconMap[archetype.icon_name] || User;
        const isSelected = currentArchetype?.id === archetype.id;

        return (
          <Card
            key={archetype.id}
            className={cn(
              "relative cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary border-primary"
            )}
            onClick={() => handleSelect(archetype)}
          >
            {isSelected && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            )}
            
            <CardHeader className={cn(compact && "p-4")}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "rounded-full p-2 bg-primary/10",
                  compact ? "p-1.5" : "p-2"
                )}>
                  <IconComponent className={cn("text-primary", compact ? "h-5 w-5" : "h-6 w-6")} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn(compact ? "text-sm" : "text-lg")}>
                    {archetype.display_name}
                  </CardTitle>
                  {!compact && archetype.description && (
                    <CardDescription className="mt-1 line-clamp-2">
                      {archetype.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>

            {!compact && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Trust signals preview */}
                  <div className="flex flex-wrap gap-1">
                    {archetype.trust_signals.verification_badges.slice(0, 3).map((badge) => (
                      <Badge key={badge} variant="secondary" className="text-xs">
                        {badge.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>

                  {/* Language preview */}
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Language: </span>
                    {archetype.language_config.tasks} • {archetype.language_config.deals} • {archetype.language_config.dashboard}
                  </div>

                  {/* Rank system indicator */}
                  {archetype.incentive_config.rank_system && (
                    <Badge variant="outline" className="text-xs">
                      Rank Progression Enabled
                    </Badge>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
