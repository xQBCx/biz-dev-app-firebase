import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  DollarSign,
  Target,
  ArrowRight,
  Plus,
  Building2,
  Wallet,
  Shield
} from "lucide-react";
import { 
  useRoleTransitions, 
  useCurrentRole, 
  useEngagements, 
  useWorkforceSummary,
  WorkforceRole 
} from "@/hooks/useWorkforce";
import { EngagementManager } from "@/components/workforce/EngagementManager";
import { TimeTracker } from "@/components/workforce/TimeTracker";
import { RoleProgressionCard } from "@/components/workforce/RoleProgressionCard";
import { useArchetypeTranslation } from "@/contexts/ArchetypeContext";

const roleInfo: Record<WorkforceRole, { 
  label: string; 
  description: string; 
  icon: typeof Users;
  color: string;
  nextRole?: WorkforceRole;
  requirements?: string[];
}> = {
  responder: {
    label: 'Responder',
    description: 'Emergency response and mission-based work',
    icon: Shield,
    color: 'text-red-500',
    nextRole: 'worker',
    requirements: ['Complete 5 EROS deployments', 'Maintain 90%+ rating']
  },
  worker: {
    label: 'Worker',
    description: 'Active engagement and time-tracked work',
    icon: Briefcase,
    color: 'text-blue-500',
    nextRole: 'capital_participant',
    requirements: ['Complete 3 engagements', 'Log 100+ hours', 'Earn $5,000+']
  },
  capital_participant: {
    label: 'Capital Participant',
    description: 'Investment and capital allocation',
    icon: Wallet,
    color: 'text-green-500',
    nextRole: 'owner',
    requirements: ['Hold 3+ equity positions', 'Complete Trading Command training']
  },
  owner: {
    label: 'Owner',
    description: 'Company ownership and governance',
    icon: Building2,
    color: 'text-purple-500',
    requirements: ['Own stake in 1+ companies', 'Active governance participation']
  }
};

export default function WorkforceContinuum() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useArchetypeTranslation();
  const currentRole = useCurrentRole();
  const { data: transitions } = useRoleTransitions();
  const { activeEngagements, totalHoursThisMonth, totalEarnings } = useWorkforceSummary();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const roleKeys = Object.keys(roleInfo) as WorkforceRole[];
  const currentRoleIndex = roleKeys.indexOf(currentRole);
  const progressPercentage = ((currentRoleIndex + 1) / roleKeys.length) * 100;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <span>Workforce Continuum</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your journey from Responder to Owner
              </p>
            </div>
            <Badge className={`${roleInfo[currentRole].color} bg-opacity-10`}>
              {roleInfo[currentRole].label}
            </Badge>
          </div>

          {/* Role Progression Bar */}
          <Card>
            <CardContent className="py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Role Progression</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="relative">
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between mt-2">
                    {roleKeys.map((role, index) => {
                      const RoleIcon = roleInfo[role].icon;
                      const isActive = index <= currentRoleIndex;
                      return (
                        <div 
                          key={role} 
                          className={`flex flex-col items-center gap-1 ${isActive ? '' : 'opacity-40'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                          }`}>
                            <RoleIcon className="h-4 w-4" />
                          </div>
                          <span className="text-xs hidden sm:block">{roleInfo[role].label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Active Engagements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEngagements}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Hours This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHoursThisMonth.toFixed(1)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Transitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transitions?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="engagements">Engagements</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="progression">Progression</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Current Role Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {(() => {
                        const RoleIcon = roleInfo[currentRole].icon;
                        return <RoleIcon className={`h-5 w-5 ${roleInfo[currentRole].color}`} />;
                      })()}
                      Current Role: {roleInfo[currentRole].label}
                    </CardTitle>
                    <CardDescription>{roleInfo[currentRole].description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {roleInfo[currentRole].nextRole && (
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Next: {roleInfo[roleInfo[currentRole].nextRole!].label}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">Requirements:</span>
                          <ul className="text-sm space-y-1">
                            {roleInfo[currentRole].requirements?.map((req, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <Target className="h-3 w-3 text-primary" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate('/trading-command')}
                      >
                        Trading Command
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => navigate('/capital-formation')}
                      >
                        Capital Hub
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transitions</CardTitle>
                    <CardDescription>Your role history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      {transitions && transitions.length > 0 ? (
                        <div className="space-y-3">
                          {transitions.slice(0, 5).map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                {t.from_role && (
                                  <>
                                    <Badge variant="outline">{t.from_role}</Badge>
                                    <ArrowRight className="h-3 w-3" />
                                  </>
                                )}
                                <Badge>{t.to_role}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(t.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No role transitions yet</p>
                          <p className="text-sm">Complete activities to progress</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="engagements">
              <EngagementManager />
            </TabsContent>

            <TabsContent value="time">
              <TimeTracker />
            </TabsContent>

            <TabsContent value="progression">
              <div className="grid gap-4 md:grid-cols-2">
                {roleKeys.map((role) => (
                  <RoleProgressionCard 
                    key={role}
                    role={role}
                    roleInfo={roleInfo[role]}
                    isCurrentRole={role === currentRole}
                    isCompleted={roleKeys.indexOf(role) < currentRoleIndex}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
