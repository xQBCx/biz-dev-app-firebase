import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageCircle, UserPlus, Search, Calendar, Award, Clock, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  initials: string;
  created_at: string;
  team_status?: {
    status: string;
    last_seen: string;
  };
}

interface TeamStats {
  total: number;
  onShift: number;
  onBreak: number;
  offDuty: number;
}

const statusConfig = {
  on_shift: { label: 'On Shift', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  break: { label: 'Break', color: 'bg-amber-500', textColor: 'text-amber-700' },
  off_duty: { label: 'Off Duty', color: 'bg-gray-500', textColor: 'text-gray-700' },
  inactive: { label: 'Inactive', color: 'bg-red-500', textColor: 'text-red-700' }
};

const roleConfig = {
  owner: { label: 'Owner', color: 'bg-gradient-to-r from-accent to-accent-light', priority: 1 },
  manager: { label: 'Manager', color: 'bg-primary', priority: 2 },
  regional: { label: 'Regional', color: 'bg-primary-light', priority: 3 },
  front_desk: { label: 'Front Desk', color: 'bg-blue-500', priority: 4 },
  housekeeping: { label: 'Housekeeping', color: 'bg-purple-500', priority: 5 },
  maintenance: { label: 'Maintenance', color: 'bg-orange-500', priority: 6 },
  staff: { label: 'Staff', color: 'bg-slate', priority: 7 }
};

export const TeamDirectory = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<TeamStats>({ total: 0, onShift: 0, onBreak: 0, offDuty: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamMembers = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('property_id')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.property_id) {
        toast.error('No property associated with your account');
        return;
      }

      // Fetch team members with their status
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select(`
          *,
          team_status!inner(
            status,
            last_seen
          )
        `)
        .eq('property_id', profile.property_id)
        .order('role')
        .order('full_name');

      if (membersError) throw membersError;

      const members = membersData?.map(member => ({
        ...member,
        team_status: member.team_status?.[0] // Take the first (and should be only) status record
      })) || [];
      setTeamMembers(members);

      // Calculate stats
      const newStats = {
        total: members.length,
        onShift: members.filter(m => m.team_status?.status === 'on_shift').length,
        onBreak: members.filter(m => m.team_status?.status === 'break').length,
        offDuty: members.filter(m => m.team_status?.status === 'off_duty').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const updateMemberStatus = async (memberId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('team_status')
        .update({ status: newStatus, last_seen: new Date().toISOString() })
        .eq('employee_id', memberId);

      if (error) throw error;

      toast.success('Status updated successfully');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.team_status?.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background min-h-full">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Team</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium">On Shift</span>
            </div>
            <div className="text-2xl font-bold">{stats.onShift}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium">On Break</span>
            </div>
            <div className="text-2xl font-bold">{stats.onBreak}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-medium">Off Duty</span>
            </div>
            <div className="text-2xl font-bold">{stats.offDuty}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(roleConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member) => {
          const roleInfo = roleConfig[member.role as keyof typeof roleConfig] || roleConfig.staff;
          const statusInfo = statusConfig[member.team_status?.status as keyof typeof statusConfig] || statusConfig.off_duty;
          
          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={member.full_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{member.full_name}</h3>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedMember(member)}
                          >
                            View
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px]">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {member.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-lg">{member.full_name}</div>
                                <Badge className={`${roleInfo.color} text-white`}>
                                  {roleInfo.label}
                                </Badge>
                              </div>
                            </SheetTitle>
                          </SheetHeader>
                          
                          <Tabs defaultValue="profile" className="mt-6">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="profile">Profile</TabsTrigger>
                              <TabsTrigger value="shifts">Shifts</TabsTrigger>
                              <TabsTrigger value="academy">Academy</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="profile" className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Current Status</span>
                                  <Badge className={`${statusInfo.color} text-white`}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Last Seen</span>
                                  <span className="text-sm text-muted-foreground">
                                    {member.team_status?.last_seen 
                                      ? formatDistanceToNow(new Date(member.team_status.last_seen), { addSuffix: true })
                                      : 'Never'
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Role</span>
                                  <span className="text-sm">{roleInfo.label}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">Hire Date</span>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(member.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-2 pt-4">
                                <h4 className="font-medium">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button variant="outline" size="sm">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Message
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="shifts" className="space-y-4">
                              <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-8 w-8 mx-auto mb-2" />
                                <p>Shift scheduling coming soon</p>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="academy" className="space-y-4">
                              <div className="text-center py-8 text-muted-foreground">
                                <Award className="h-8 w-8 mx-auto mb-2" />
                                <p>Academy progress coming soon</p>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </SheetContent>
                      </Sheet>
                    </div>
                    
                    <Badge variant="outline" className="text-xs mt-1">
                      {roleInfo.label}
                    </Badge>
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge className={`${statusInfo.color} text-white text-xs`}>
                        {statusInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {member.team_status?.last_seen 
                          ? formatDistanceToNow(new Date(member.team_status.last_seen), { addSuffix: true })
                          : 'Never'
                        }
                      </span>
                    </div>
                    
                    <div className="flex gap-1 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {/* Open COMS DM */}}
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {/* Assign task */}}
                      >
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No team members found matching your filters.</p>
        </div>
      )}
    </div>
  );
};