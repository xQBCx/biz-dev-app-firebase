import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, Plus, List, BarChart3, Settings, MapPin, Map, Users, AlertTriangle, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MaintenanceRequestForm } from '@/components/maintenance/MaintenanceRequestForm';
import { MaintenanceRequestsList } from '@/components/maintenance/MaintenanceRequestsList';
import { RoomList } from '@/components/maintenance/RoomList';
import TaskList from '@/components/TaskList';
import MaintenanceFloorPlans from '@/components/maintenance/MaintenanceFloorPlans';
import { toast } from 'sonner';

interface MaintenanceStats {
  emergency: number;
  inProgress: number;
  pending: number;
  completed: number;
  totalRooms: number;
  activeRequests: number;
}

interface MaintenanceTechnician {
  id: string;
  name: string;
  specialties: string[];
  current_location: string;
  phone: string;
  active: boolean;
}

const Maintenance = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<MaintenanceStats>({
    emergency: 0,
    inProgress: 0,
    pending: 0,
    completed: 0,
    totalRooms: 0,
    activeRequests: 0
  });
  const [technicians, setTechnicians] = useState<MaintenanceTechnician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always fetch data for demo purposes since auth is disabled
    fetchMaintenanceData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchMaintenanceData = async () => {
    try {
      // Use Georgetown property directly for demo
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .ilike('name', '%georgetown%')
        .limit(1);

      const propertyId = properties?.[0]?.id;
      
      let requests = [];
      let rooms = [];
      
      if (propertyId) {
        // Fetch maintenance requests for Georgetown
        const { data: requestsData } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('property_id', propertyId);
        requests = requestsData || [];

        // Fetch rooms for Georgetown
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', propertyId);
        rooms = roomsData || [];
      } else {
        console.log('Georgetown property not found, using mock data');
        // Use mock data for demo
        requests = [
          {
            id: '1',
            request_number: 'MR-001',
            suite_number: '201',
            status: 'pending',
            urgency: 'medium',
            description: 'Air conditioning not working properly',
            created_at: new Date().toISOString(),
          },
          {
            id: '2', 
            request_number: 'MR-002',
            suite_number: '105',
            status: 'in_progress',
            urgency: 'high',
            description: 'Bathroom faucet leaking',
            created_at: new Date().toISOString(),
          }
        ];
        
        rooms = [
          { id: '1', room_number: '101', status: 'ready' },
          { id: '2', room_number: '102', status: 'maintenance' },
          { id: '3', room_number: '201', status: 'ready' },
          { id: '4', room_number: '202', status: 'ready' }
        ];
      }

      // For now, use mock Georgetown technician data since table creation failed
      const mockTechnicians: MaintenanceTechnician[] = [
        {
          id: '1',
          name: 'Mike Rodriguez',
          specialties: ['HVAC', 'Electrical', 'Plumbing'],
          current_location: 'Floor 2',
          phone: '(970) 555-0123',
          active: true
        },
        {
          id: '2',
          name: 'Sarah Chen',
          specialties: ['Electrical', 'Security', 'WiFi'],
          current_location: 'Floor 1',
          phone: '(970) 555-0124',
          active: true
        }
      ];

      // Calculate stats
      const activeRequests = requests?.filter(r => r.status !== 'completed' && r.status !== 'cancelled') || [];
      const newStats: MaintenanceStats = {
        emergency: requests?.filter(r => r.urgency === 'emergency' && r.status !== 'completed').length || 0,
        inProgress: requests?.filter(r => r.status === 'in_progress').length || 0,
        pending: requests?.filter(r => r.status === 'pending').length || 0,
        completed: requests?.filter(r => r.status === 'completed').length || 0,
        totalRooms: rooms?.length || 0,
        activeRequests: activeRequests.length
      };

      setStats(newStats);
      setTechnicians(mockTechnicians);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast.error('Failed to fetch maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Listen for maintenance request changes
    const requestsChannel = supabase
      .channel('maintenance-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        () => {
          // Refresh data when requests change
          fetchMaintenanceData();
        }
      )
      .subscribe();

    // Listen for room status changes
    const roomsChannel = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        () => {
          // Refresh data when room status changes
          fetchMaintenanceData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(roomsChannel);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Georgetown Hotel Maintenance</h1>
              <p className="text-muted-foreground">Real-time maintenance management for Georgetown, Colorado</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {technicians.length} Technicians
            </Badge>
            <Button 
              onClick={() => setActiveTab('new-request')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="floorplans" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Floor Plans
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Rooms
            </TabsTrigger>
            <TabsTrigger value="new-request" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              All Requests
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real Georgetown Colorado Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">Emergency</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{stats.emergency}</div>
                      <p className="text-xs text-muted-foreground">Urgent requests</p>
                    </div>
                    {stats.emergency > 0 && (
                      <div className="animate-pulse">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">In Progress</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">Active tasks</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <List className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting assignment</p>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Georgetown Technician Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Georgetown Maintenance Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {technicians.map((tech) => (
                    <Card key={tech.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Brandon McGee</h4>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>📱 {tech.phone}</p>
                        <p>📍 {tech.current_location || 'Available'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tech.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <TaskList 
              module="maintenance" 
              title="Georgetown Maintenance SOPs" 
              icon={Wrench}
            />
          </TabsContent>

          <TabsContent value="floorplans" className="space-y-4">
            <MaintenanceFloorPlans />
          </TabsContent>

          <TabsContent value="rooms">
            <RoomList />
          </TabsContent>

          <TabsContent value="new-request">
            <MaintenanceRequestForm />
          </TabsContent>

          <TabsContent value="requests">
            <MaintenanceRequestsList />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Georgetown Maintenance Team Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Team Statistics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Active Technicians:</span>
                          <span className="font-medium">{technicians.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Rooms:</span>
                          <span className="font-medium">{stats.totalRooms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Requests:</span>
                          <span className="font-medium">{stats.activeRequests}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Property Info</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Location:</strong> Georgetown, Colorado</p>
                        <p><strong>Property Type:</strong> Microtel by Wyndham</p>
                        <p><strong>Real-time Updates:</strong> ✅ Enabled</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Technician Directory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {technicians.map((tech) => (
                        <Card key={tech.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold">{tech.name}</h5>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              On Duty
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>📱 {tech.phone}</p>
                            <p>📍 {tech.current_location || 'Available for assignment'}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tech.specialties.map((specialty) => (
                                <Badge key={specialty} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Maintenance;