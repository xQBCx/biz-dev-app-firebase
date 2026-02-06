import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Wrench, Eye, Plus, Clock, AlertTriangle, CheckCircle, MapPin, FileText, Camera, User, Settings, AlertCircle, XCircle, Zap, Circle, Triangle, Square, Octagon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Room {
  id: string;
  room_number: string;
  type: string;
  bed_config: string;
  status: string;
  notes?: string;
  property_id: string;
}

interface MaintenanceRequest {
  id: string;
  request_number: string;
  suite_number: string;
  urgency: string;
  status: string;
  description: string;
  created_at: string;
  room_id?: string;
}

const statusConfig = {
  active: { label: 'Ready', icon: <CheckCircle className="h-5 w-5 text-emerald-600" />, color: 'border-emerald-500 bg-emerald-50' },
  dirty: { label: 'Dirty', icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />, color: 'border-yellow-500 bg-yellow-50' },
  out_of_inventory: { label: 'Out of Inventory', icon: <XCircle className="h-5 w-5 text-red-600" />, color: 'border-red-500 bg-red-50' },
  under_maintenance: { label: 'Under Maintenance', icon: <Settings className="h-5 w-5 text-orange-600" />, color: 'border-orange-500 bg-orange-50' }
};

const urgencyConfig = {
  low: { label: 'Low', icon: <Circle className="h-4 w-4 text-blue-600" />, color: 'text-blue-600' },
  medium: { label: 'Medium', icon: <Triangle className="h-4 w-4 text-yellow-600" />, color: 'text-yellow-600' },
  high: { label: 'High', icon: <Square className="h-4 w-4 text-orange-600" />, color: 'text-orange-600' },
  emergency: { label: 'Emergency', icon: <Octagon className="h-4 w-4 text-red-600" />, color: 'text-red-600' }
};

const MaintenanceFloorPlans = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [activeFloor, setActiveFloor] = useState('1');
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    // Always fetch data for demo purposes since auth is disabled
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('property_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      // Fetch rooms and maintenance requests from database
      let roomsData: Room[] = [];
      let requestsData: MaintenanceRequest[] = [];

      if (profile?.property_id) {
        const { data: dbRooms } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', profile.property_id)
          .order('room_number');

        const { data: dbRequests } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('property_id', profile.property_id)
          .order('created_at', { ascending: false });

        roomsData = dbRooms || [];
        requestsData = dbRequests || [];
      }

      // If no rooms in database, use demo data for Microtel By Wyndham, Georgetown
      if (roomsData.length === 0) {
        console.info('No rooms found, using demo data for Georgetown property');
        roomsData = generateDemoRooms();
        requestsData = generateDemoRequests();
      }

      setRooms(roomsData);
      setMaintenanceRequests(requestsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use demo data on error
      setRooms(generateDemoRooms());
      setMaintenanceRequests(generateDemoRequests());
      toast.error('Using demo data - database connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Generate demo rooms for Georgetown property
  const generateDemoRooms = (): Room[] => {
    const rooms: Room[] = [];
    const statuses = ['active', 'dirty', 'under_maintenance', 'out_of_inventory'];
    const types = ['Standard King', 'Standard Double', 'Accessible King', 'Accessible Double'];
    const bedConfigs = ['1 King', '2 Double', '1 King', '2 Double'];

    // Generate 3 floors with rooms
    for (let floor = 1; floor <= 3; floor++) {
      const roomsPerFloor = floor === 1 ? 18 : 16; // First floor has more rooms
      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const typeIndex = Math.floor(Math.random() * types.length);

        rooms.push({
          id: `room-${roomNumber}`,
          room_number: roomNumber,
          type: types[typeIndex],
          bed_config: bedConfigs[typeIndex],
          status: randomStatus,
          notes: randomStatus === 'under_maintenance' ? 'HVAC repair in progress' : undefined,
          property_id: 'georgetown-property'
        });
      }
    }

    return rooms;
  };

  // Generate demo maintenance requests
  const generateDemoRequests = (): MaintenanceRequest[] => {
    const requests: MaintenanceRequest[] = [];
    const urgencies = ['low', 'medium', 'high', 'emergency'];
    const statuses = ['pending', 'in_progress', 'assigned'];
    const descriptions = [
      'Air conditioning not cooling properly',
      'Bathroom faucet leaking',
      'Light bulb out in lamp',
      'TV remote not working',
      'Toilet running continuously',
      'Shower pressure low',
      'Coffee maker not heating',
      'Wi-Fi connection issues',
      'Thermostat not responding',
      'Door lock mechanism sticky'
    ];

    // Generate 12 random requests
    for (let i = 0; i < 12; i++) {
      const randomRoom = `${Math.floor(Math.random() * 3) + 1}${(Math.floor(Math.random() * 16) + 1).toString().padStart(2, '0')}`;
      const requestNumber = (1000000 + Math.floor(Math.random() * 9000000)).toString();
      
      requests.push({
        id: `req-${i + 1}`,
        request_number: requestNumber,
        suite_number: randomRoom,
        urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        room_id: `room-${randomRoom}`
      });
    }

    return requests;
  };

  // Group rooms by floor
  const groupedRooms = rooms.reduce((acc, room) => {
    const floor = room.room_number.charAt(0);
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  // Sort rooms within each floor
  Object.keys(groupedRooms).forEach(floor => {
    groupedRooms[floor].sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number));
  });

  // Get maintenance requests for a room
  const getRoomRequests = (roomNumber: string) => {
    return maintenanceRequests.filter(req => 
      req.suite_number === roomNumber && 
      req.status !== 'completed' && 
      req.status !== 'cancelled'
    );
  };

  // Filter rooms and requests
  const filteredRooms = (groupedRooms[activeFloor] || []).filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    const matchesFloor = request.suite_number.charAt(0) === activeFloor;
    const isActive = request.status !== 'completed' && request.status !== 'cancelled';
    return matchesUrgency && matchesFloor && isActive;
  });

  const handleCreateRequest = (room: Room) => {
    const url = `/os/maintenance?tab=new-request&room=${room.room_number}`;
    window.open(url, '_blank');
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(16)].map((_, i) => (
          <Card key={i} className="aspect-square animate-pulse">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <div className="h-6 bg-muted rounded w-16"></div>
              <div className="h-4 bg-muted rounded w-12 mx-auto"></div>
              <div className="flex gap-1">
                <div className="h-6 w-6 bg-muted rounded"></div>
                <div className="h-6 w-6 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Active Requests</span>
                <div className="text-2xl font-bold">
                  {maintenanceRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Emergency</span>
                <div className="text-2xl font-bold">
                  {maintenanceRequests.filter(r => r.urgency === 'emergency' && r.status !== 'completed').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Ready Rooms</span>
                <div className="text-2xl font-bold">
                  {rooms.filter(r => r.status === 'active').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Out of Order</span>
                <div className="text-2xl font-bold">
                  {rooms.filter(r => r.status === 'out_of_inventory' || r.status === 'under_maintenance').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Room status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Ready</SelectItem>
            <SelectItem value="dirty">Dirty</SelectItem>
            <SelectItem value="under_maintenance">Maintenance</SelectItem>
            <SelectItem value="out_of_inventory">Out of Inventory</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Request priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Floor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rooms Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Floor {activeFloor} - Room Status
                </CardTitle>
                <Tabs value={activeFloor} onValueChange={setActiveFloor} className="w-auto">
                  <TabsList>
                    {['1', '2', '3'].map(floor => (
                      <TabsTrigger key={floor} value={floor}>
                        Floor {floor}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredRooms.map((room) => {
                  const requests = getRoomRequests(room.room_number);
                  const statusInfo = statusConfig[room.status as keyof typeof statusConfig];
                  const hasEmergency = requests.some(r => r.urgency === 'emergency');
                  
                  return (
                    <Card 
                      key={room.id} 
                      className={`aspect-square hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 min-w-[100px] min-h-[100px] ${statusInfo.color} border-2`}
                      onClick={() => handleViewRoom(room)}
                    >
                      <CardContent className="p-3 h-full flex flex-col justify-between">
                        {/* Room Number */}
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold text-primary">
                            {room.room_number}
                          </span>
                          {hasEmergency && (
                            <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />
                          )}
                        </div>
                        
                        {/* Status Icon */}
                        <div className="flex flex-col items-center">
                          <div className="mb-1">{statusInfo.icon}</div>
                          {requests.length > 0 && (
                            <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                              {requests.length}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateRequest(room);
                            }}
                            title="Create Request"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewRoom(room);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {filteredRooms.length === 0 && (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rooms found on Floor {activeFloor}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Requests Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Active Requests - Floor {activeFloor}
                <Badge variant="outline">{filteredRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredRequests.map((request) => {
                  const urgency = urgencyConfig[request.urgency as keyof typeof urgencyConfig];
                  
                  return (
                    <Card 
                      key={request.id} 
                      className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewRequest(request)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            #{request.request_number}
                          </span>
                          <span className={`text-lg ${urgency.color}`}>
                            {urgency.icon}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Room {request.suite_number}
                          </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {request.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                          <Badge variant="outline" className="text-xs">
                            {request.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                
                {filteredRequests.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No active requests on this floor.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Room Detail Sheet */}
      <Sheet open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
        <SheetContent className="w-full sm:w-[540px]">
          {selectedRoom && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <span className="text-2xl">{statusConfig[selectedRoom.status as keyof typeof statusConfig].icon}</span>
                  Room {selectedRoom.room_number}
                  <Badge variant="outline">
                    {selectedRoom.type}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{statusConfig[selectedRoom.status as keyof typeof statusConfig].icon}</span>
                      <span className="font-medium">{statusConfig[selectedRoom.status as keyof typeof statusConfig].label}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Active Requests</label>
                    <p className="mt-1 font-medium">{getRoomRequests(selectedRoom.room_number).length}</p>
                  </div>
                </div>
                
                {/* Room's Maintenance Requests */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Maintenance Requests</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getRoomRequests(selectedRoom.room_number).map((request) => (
                      <Card key={request.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">#{request.request_number}</span>
                          <Badge variant="outline" className="text-xs">
                            {request.urgency}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{request.description}</p>
                      </Card>
                    ))}
                    
                    {getRoomRequests(selectedRoom.room_number).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No active maintenance requests
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="border-t pt-4 space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => handleCreateRequest(selectedRoom)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Maintenance Request
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Request Detail Sheet */}
      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent className="w-full sm:w-[540px]">
          {selectedRequest && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Wrench className="h-5 w-5" />
                  Request #{selectedRequest.request_number}
                  <Badge variant="outline">
                    {selectedRequest.urgency}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Room</label>
                    <p className="mt-1 font-medium">{selectedRequest.suite_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="mt-1 font-medium">{selectedRequest.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span>{urgencyConfig[selectedRequest.urgency as keyof typeof urgencyConfig].icon}</span>
                      <span className="font-medium">{selectedRequest.urgency}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="mt-1 font-medium">{formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-sm bg-muted/50 p-3 rounded-md">{selectedRequest.description}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MaintenanceFloorPlans;