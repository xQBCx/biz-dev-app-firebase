import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Circle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ErosResponderProfile, ErosResponderStatus as ResponderStatusType, useUpdateResponderProfile } from '@/hooks/useEROS';
import { cn } from '@/lib/utils';

const statusConfig: Record<ResponderStatusType, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-green-500', bgColor: 'bg-green-500' },
  on_call: { label: 'On Call', color: 'text-blue-500', bgColor: 'bg-blue-500' },
  deployed: { label: 'Deployed', color: 'text-orange-500', bgColor: 'bg-orange-500' },
  unavailable: { label: 'Unavailable', color: 'text-gray-500', bgColor: 'bg-gray-500' },
  standby: { label: 'Standby', color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
};

interface ErosResponderStatusProps {
  profile: ErosResponderProfile | null | undefined;
}

export function ErosResponderStatus({ profile }: ErosResponderStatusProps) {
  const navigate = useNavigate();
  const updateProfile = useUpdateResponderProfile();

  if (!profile) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate('/eros/profile')}>
        <User className="h-4 w-4 mr-2" />
        Setup Profile
      </Button>
    );
  }

  const currentStatus = statusConfig[profile.availability_status];

  const handleStatusChange = (status: ResponderStatusType) => {
    updateProfile.mutate({
      id: profile.id,
      availability_status: status,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Circle className={cn("h-3 w-3 fill-current", currentStatus.color)} />
          {currentStatus.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Set Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.entries(statusConfig) as [ResponderStatusType, typeof currentStatus][]).map(([status, config]) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
            className="gap-2"
          >
            <Circle className={cn("h-3 w-3 fill-current", config.color)} />
            {config.label}
            {status === profile.availability_status && (
              <Badge variant="secondary" className="ml-auto text-xs">Current</Badge>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/eros/profile')}>
          <User className="h-4 w-4 mr-2" />
          Edit Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
