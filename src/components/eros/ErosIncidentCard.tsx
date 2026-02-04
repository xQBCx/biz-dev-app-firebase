import React from 'react';
import { MapPin, Users, Clock, AlertTriangle, Shield, Flame, Wrench, Heart, Building2, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErosIncident, ErosIncidentType, ErosSeverity } from '@/hooks/useEROS';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const incidentTypeConfig: Record<ErosIncidentType, { icon: React.ElementType; label: string; color: string }> = {
  natural_disaster: { icon: Flame, label: 'Natural Disaster', color: 'text-orange-500' },
  medical: { icon: Heart, label: 'Medical', color: 'text-red-500' },
  security: { icon: Shield, label: 'Security', color: 'text-blue-500' },
  infrastructure: { icon: Building2, label: 'Infrastructure', color: 'text-gray-500' },
  community: { icon: Users, label: 'Community', color: 'text-purple-500' },
  industrial: { icon: Wrench, label: 'Industrial', color: 'text-yellow-600' },
  environmental: { icon: Leaf, label: 'Environmental', color: 'text-green-500' },
};

const severityConfig: Record<ErosSeverity, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline' }> = {
  critical: { label: 'Critical', variant: 'destructive' },
  high: { label: 'High', variant: 'default' },
  medium: { label: 'Medium', variant: 'secondary' },
  low: { label: 'Low', variant: 'outline' },
};

interface ErosIncidentCardProps {
  incident: ErosIncident;
  onClick?: () => void;
}

export function ErosIncidentCard({ incident, onClick }: ErosIncidentCardProps) {
  const typeConfig = incidentTypeConfig[incident.incident_type];
  const severity = severityConfig[incident.severity];
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        incident.severity === 'critical' && "border-destructive",
        incident.severity === 'high' && "border-orange-500"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
            <Badge variant={severity.variant}>{severity.label}</Badge>
          </div>
          <Badge variant="outline" className="text-xs">
            {incident.incident_code}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2">{incident.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {incident.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {incident.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {incident.location_address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{incident.location_address}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{incident.min_responders}+ needed</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {incident.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {incident.required_skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {incident.required_skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{incident.required_skills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
