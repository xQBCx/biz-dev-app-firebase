import { Users, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { TeamMember } from '@/hooks/useTeamData';
import TeamMemberCard from './TeamMemberCard';
import TeamMemberProfile from './TeamMemberProfile';

interface TeamListProps {
  filteredMembers: TeamMember[];
  searchTerm: string;
  roleFilter: string;
  getTeamMemberStatus: (id: string) => string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getRoleColor: (role: string) => string;
  formatRole: (role: string) => string;
}

export default function TeamList({
  filteredMembers,
  searchTerm,
  roleFilter,
  getTeamMemberStatus,
  getStatusColor,
  getStatusLabel,
  getRoleColor,
  formatRole
}: TeamListProps) {
  if (filteredMembers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || roleFilter !== 'all' 
              ? "No team members found matching your search criteria."
              : "Get started by adding your first team member."}
          </p>
          {(!searchTerm && roleFilter === 'all') && (
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add your first team member
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMembers.map((member) => {
        const status = getTeamMemberStatus(member.id);
        
        return (
          <Sheet key={member.id}>
            <SheetTrigger asChild>
              <div>
                <TeamMemberCard
                  member={member}
                  status={status}
                  viewMode="list"
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getRoleColor={getRoleColor}
                  formatRole={formatRole}
                  onClick={() => {}}
                />
              </div>
            </SheetTrigger>
            
            <TeamMemberProfile
              member={member}
              status={status}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getRoleColor={getRoleColor}
              formatRole={formatRole}
            />
          </Sheet>
        );
      })}
    </div>
  );
}