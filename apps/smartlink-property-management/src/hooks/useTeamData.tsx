import { useState, useEffect } from 'react';
import { supabase } from '../../../packages/supabase-client/src/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  initials: string;
  created_at: string;
  updated_at: string;
  property_id?: string;
  status: string;
}

export interface TeamStatus {
  employee_id: string;
  status: string;
  last_seen: string;
}

export const useTeamData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStatuses, setTeamStatuses] = useState<TeamStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useTeamData effect triggered, user:', user?.id);
    if (user) {
      fetchTeamData();
      
      // Set up real-time subscriptions for live updates
      const channel = supabase
        .channel('team-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'team_members'
        }, () => {
          console.log('Real-time update: team members changed');
          fetchTeamData();
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'team_status'
        }, () => {
          console.log('Real-time update: team status changed');
          fetchTeamData();
        })
        .subscribe();

      return () => {
        console.log('Cleaning up real-time subscriptions');
        supabase.removeChannel(channel);
      };
    } else {
      console.log('No user found, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      console.log('Fetching team data for user:', user?.id);
      
      // First get the user's property
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('property_id')
        .eq('user_id', user?.id)
        .single();

      console.log('User profile:', profile, 'Error:', profileError);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!profile?.property_id) {
        console.log('No property_id found for user');
        toast({
          title: "Error",
          description: "No property associated with your account",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Fetching team members for property:', profile.property_id);

      // Fetch team members for this property
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('property_id', profile.property_id)
        .order('full_name');

      console.log('Team members fetched:', members?.length || 0, 'Error:', membersError);

      if (membersError) {
        console.error('Team members fetch error:', membersError);
        throw membersError;
      }

      // Fetch team statuses
      const { data: statuses, error: statusError } = await supabase
        .from('team_status')
        .select('*')
        .eq('property_id', profile.property_id);

      console.log('Team statuses fetched:', statuses?.length || 0, 'Error:', statusError);

      if (statusError) {
        console.error('Team status fetch error:', statusError);
        // Don't throw here, statuses are optional
      }

      setTeamMembers(members || []);
      setTeamStatuses(statuses || []);
      console.log('Team data successfully loaded:', members?.length || 0, 'members');
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTeamMemberStatus = (memberId: string) => {
    const status = teamStatuses.find(s => s.employee_id === memberId);
    return status?.status || 'off_duty';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_shift': return 'bg-green-500';
      case 'break': return 'bg-yellow-500';
      case 'off_duty': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on_shift': return 'On Shift';
      case 'break': return 'Break';
      case 'off_duty': return 'Off Duty';
      default: return 'Unknown';
    }
  };

  const getRoleColor = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('owner') || lowerRole.includes('regional') || lowerRole.includes('manager')) {
      return 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary';
    }
    if (lowerRole.includes('front') || lowerRole.includes('desk') || lowerRole.includes('clerk')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (lowerRole.includes('house') || lowerRole.includes('keeping') || lowerRole.includes('cleaning')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (lowerRole.includes('maintenance') || lowerRole.includes('repair')) {
      return 'bg-orange-50 text-orange-700 border-orange-200';
    }
    if (lowerRole.includes('food') || lowerRole.includes('beverage')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (lowerRole.includes('support') || lowerRole.includes('team')) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
    return 'bg-muted text-muted-foreground border-muted';
  };

  const formatRole = (role: string) => {
    // Handle roles that are already formatted with spaces
    if (role.includes(' ')) {
      return role;
    }
    // Handle snake_case roles
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return {
    teamMembers,
    teamStatuses,
    loading,
    getTeamMemberStatus,
    getStatusColor,
    getStatusLabel,
    getRoleColor,
    formatRole,
    refetch: fetchTeamData,
    refreshTeamData: () => {
      console.log('Manual refresh triggered');
      fetchTeamData();
    }
  };
};