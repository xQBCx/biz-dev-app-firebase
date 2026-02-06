import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamMember } from '@/hooks/useTeamData';

interface TeamMemberProfileProps {
  member: TeamMember;
  status: string;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  getRoleColor: (role: string) => string;
  formatRole: (role: string) => string;
}

export default function TeamMemberProfile({
  member,
  status,
  getStatusColor,
  getStatusLabel,
  getRoleColor,
  formatRole
}: TeamMemberProfileProps) {
  return (
    <SheetContent className="w-full sm:max-w-md bg-background">
      <SheetHeader>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle className="text-xl text-foreground">
              {member.full_name}
            </SheetTitle>
            <SheetDescription className="text-base">
              <Badge className={`${getRoleColor(member.role)} text-sm`}>
                {formatRole(member.role)}
              </Badge>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                <span className="text-sm font-medium">
                  {getStatusLabel(status)}
                </span>
              </div>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <Separator className="my-4" />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="shifts" className="text-xs">Shifts</TabsTrigger>
          <TabsTrigger value="academy" className="text-xs">Academy</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Assign Task
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    Performance
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID:</span>
                  <span>{member.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span>{formatRole(member.role)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{getStatusLabel(status)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Week</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Shift schedule information will be displayed here.</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Today:</span>
                  <span className="text-foreground">8:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Tomorrow:</span>
                  <span className="text-foreground">Off</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academy" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Training Progress</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Academy progress and certifications will be displayed here.</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Completed Courses:</span>
                  <span className="text-foreground">5</span>
                </div>
                <div className="flex justify-between">
                  <span>Total XP:</span>
                  <span className="text-foreground">250</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Team Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Team notes and feedback will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SheetContent>
  );
}