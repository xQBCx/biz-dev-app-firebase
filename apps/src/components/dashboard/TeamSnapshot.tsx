import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  full_name: string;
  initials: string;
  role: string;
}

interface DepartmentCoverage {
  department: string;
  count: number;
  color: string;
}

const TeamSnapshot = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [coverage, setCoverage] = useState<DepartmentCoverage[]>([]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, initials, role')
        .limit(6);

      let teamData: TeamMember[] = [];
      
      if (profiles && profiles.length > 0) {
        teamData = profiles;
      } else {
        // Real team members
        teamData = [
          { id: 'team-1', full_name: 'Brandon McGee', initials: 'BM', role: 'Maintenance' },
          { id: 'team-2', full_name: 'Brittany Patel', initials: 'BP', role: 'Owner' },
          { id: 'team-3', full_name: 'Gabriela Valle', initials: 'GV', role: 'House Keeping Manager' },
          { id: 'team-4', full_name: 'Jason Lopez', initials: 'JL', role: 'Operations Director' },
          { id: 'team-5', full_name: 'Tiara Zimmerman', initials: 'TZ', role: 'Operations Manager' },
          { id: 'team-6', full_name: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk Clerk' }
        ];
      }

      setTeamMembers(teamData);
      
      // Georgetown department coverage
      const departmentCoverage = [
        { department: 'Front Desk', count: 3, color: 'bg-blue-500' },
        { department: 'Housekeeping', count: 4, color: 'bg-green-500' },
        { department: 'Maintenance', count: 2, color: 'bg-orange-500' },
        { department: 'Management', count: 2, color: 'bg-purple-500' }
      ];
      
      setCoverage(departmentCoverage);
    } catch (error) {
      console.error('Error fetching team data:', error);
      // Fallback to demo data
      setTeamMembers([
        { id: 'team-1', full_name: 'Sarah Martinez', initials: 'SM', role: 'Front Desk Manager' },
        { id: 'team-2', full_name: 'Mike Johnson', initials: 'MJ', role: 'Maintenance Tech' },
        { id: 'team-3', full_name: 'Jessica Chen', initials: 'JC', role: 'Housekeeping Lead' },
        { id: 'team-4', full_name: 'Carlos Rivera', initials: 'CR', role: 'Front Desk Associate' },
        { id: 'team-5', full_name: 'Amanda Wilson', initials: 'AW', role: 'Housekeeper' },
        { id: 'team-6', full_name: 'David Park', initials: 'DP', role: 'Assistant Manager' }
      ]);
      setCoverage([
        { department: 'Front Desk', count: 3, color: 'bg-blue-500' },
        { department: 'Housekeeping', count: 4, color: 'bg-green-500' },
        { department: 'Maintenance', count: 2, color: 'bg-orange-500' },
        { department: 'Management', count: 2, color: 'bg-purple-500' }
      ]);
    }
  };

  return (
    <Card className="card-elegant">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* On Shift Staff */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Currently On Shift</span>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {teamMembers.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {teamMembers.slice(0, 6).map((member, index) => (
              <div 
                key={member.id} 
                className="flex items-center gap-2 p-2 bg-background border rounded-lg hover:bg-muted/50 transition-all duration-200 hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar className="h-7 w-7 ring-1 ring-primary/20">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate">{member.full_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Coverage */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Department Coverage</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {coverage.map((dept, index) => (
              <div 
                key={dept.department} 
                className="flex items-center justify-between p-2.5 bg-background border rounded-lg hover:bg-muted/30 transition-all duration-200 hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-2.5 h-2.5 rounded-full ${dept.color} animate-pulse flex-shrink-0`} style={{ animationDuration: '2s' }}></div>
                  <span className="text-xs font-medium truncate">{dept.department}</span>
                </div>
                <Badge variant="outline" className="text-xs font-semibold ml-2 flex-shrink-0">
                  {dept.count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSnapshot;