import { ClipboardList, Bed, CheckCircle2, Clock, Users, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import HousekeepingStatus from '@/components/dashboard/HousekeepingStatus';
import TaskList from '@/components/TaskList';
import InteractiveFloorPlans from '@/components/housekeeping/InteractiveFloorPlans';

const Housekeeping = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Housekeeping Dashboard</h1>
            <p className="text-muted-foreground">Manage room status and housekeeping tasks</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Live Status
        </Badge>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Status Overview */}
        <div className="lg:col-span-1">
          <HousekeepingStatus />
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">Rooms cleaned</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-accent" />
                Staff On Duty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Housekeepers active</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Avg Clean Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28m</div>
              <p className="text-xs text-muted-foreground">Per room</p>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bed className="h-4 w-4 text-accent" />
                Priority Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Checkout by 11am</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="floorplans" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Floor Plans
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Tasks & SOPs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bed className="h-4 w-4 text-accent" />
                  Rooms Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">42</div>
                <p className="text-xs text-muted-foreground">Ready for guests</p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-accent" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">15</div>
                <p className="text-xs text-muted-foreground">Being cleaned</p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ClipboardList className="h-4 w-4 text-accent" />
                  Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-accent" />
                  Team Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">94%</div>
                <p className="text-xs text-muted-foreground">Above target</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="floorplans" className="space-y-4">
          <InteractiveFloorPlans />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskList module="housekeeping" title="Housekeeping Tasks & SOPs" icon={ClipboardList} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Housekeeping;