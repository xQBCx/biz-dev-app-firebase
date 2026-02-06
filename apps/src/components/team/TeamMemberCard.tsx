import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamMember } from '@/hooks/useTeamData';

interface TeamMemberCardProps {
  member: TeamMember;
  status: string;
  viewMode: 'grid' | 'list';
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getRoleColor: (role: string) => string;
  formatRole: (role: string) => string;
  onClick: () => void;
}

export default function TeamMemberCard({
  member,
  status,
  viewMode,
  getStatusColor,
  getStatusLabel,
  getRoleColor,
  formatRole,
  onClick
}: TeamMemberCardProps) {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${
        viewMode === 'grid' ? 'h-full' : ''
      } ${
        member.role === 'manager' || member.role === 'owner' || member.role === 'regional'
          ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent'
          : 'border-border hover:border-primary/20'
      }`}
      onClick={onClick}
    >
      <CardContent className={viewMode === 'grid' ? 'p-6' : 'p-4'}>
        {viewMode === 'grid' ? (
          <div className="text-center space-y-4">
            <Avatar className="h-16 w-16 mx-auto border-2 border-primary/10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-1">
                {member.full_name}
              </h3>
              <Badge className={`${getRoleColor(member.role)} text-sm font-medium`}>
                {formatRole(member.role)}
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
              <span className="text-sm text-muted-foreground font-medium">
                {getStatusLabel(status)}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Assign
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {member.full_name}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={`${getRoleColor(member.role)} text-xs`}>
                  {formatRole(member.role)}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                  <span className="text-xs text-muted-foreground">
                    {getStatusLabel(status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Assign
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}