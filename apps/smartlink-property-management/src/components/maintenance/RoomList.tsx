import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Camera, Edit, Eye, FileText, CheckCircle, AlertTriangle, XCircle, Wrench, MapPin, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Room {
  id: string;
  room_number: string;
  type: string;
  bed_config: string;
  status: string;
  notes?: string;
  maintenance_requests?: MaintenanceRequest[];
  _count?: {
    maintenance_requests: number;
  };
}

interface MaintenanceRequest {
  id: string;
  status: string;
  urgency: string;
}

const statusConfig = {
  active: { label: 'Ready', color: 'bg-emerald-500', icon: <CheckCircle className="h-5 w-5 text-emerald-600" /> },
  dirty: { label: 'Dirty', color: 'bg-yellow-500', icon: <AlertTriangle className="h-5 w-5 text-yellow-600" /> },
  out_of_inventory: { label: 'Out of Inventory', color: 'bg-red-500', icon: <XCircle className="h-5 w-5 text-red-600" /> },
  under_maintenance: { label: 'Under Maintenance', color: 'bg-orange-500', icon: <Settings className="h-5 w-5 text-orange-600" /> }
};

const typeConfig = {
  standard: { label: 'Standard' },
  suite: { label: 'Suite' },
  handicap: { label: 'ADA' },
  out_of_inventory: { label: 'OOI' }
};

const bedConfig = {
  single_queen: '1 Queen',
  double_queen: '2 Queens',
  suite: 'Suite Config'
};

export const RoomList = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeFloor, setActiveFloor] = useState('1');

  useEffect(() => {
    // Always fetch data for demo purposes since auth is disabled
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('property_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      let roomsData: Room[] = [];

      if (profile?.property_id) {
        // Try to fetch rooms from database
        const { data: dbRooms } = await supabase
          .from('rooms')
          .select(`
            *,
            maintenance_requests!room_id(
              id,
              status,
              urgency
            )
          `)
          .eq('property_id', profile.property_id)
          .order('room_number');

        roomsData = dbRooms || [];
      }

      // If no rooms found, use demo data for Microtel By Wyndham, Georgetown
      if (roomsData.length === 0) {
        console.info('No rooms found in database, using demo data for Georgetown');
        roomsData = generateDemoRooms();
      }

      // Process rooms to add counts
      const processedRooms = roomsData.map(room => ({
        ...room,
        _count: {
          maintenance_requests: room.maintenance_requests?.filter((req: MaintenanceRequest) => 
            req.status !== 'completed' && req.status !== 'cancelled'
          ).length || Math.floor(Math.random() * 3) // Random count for demo
        }
      }));

      setRooms(processedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Fallback to demo data on error
      setRooms(generateDemoRooms().map(room => ({
        ...room,
        _count: {
          maintenance_requests: Math.floor(Math.random() * 3)
        }
      })));
      toast.error('Using demo data - database connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Generate demo rooms for Georgetown property
  const generateDemoRooms = (): Room[] => {
    const rooms: Room[] = [];
    const statuses = ['active', 'dirty', 'under_maintenance', 'out_of_inventory'];
    const types = ['standard', 'suite', 'handicap'];
    const bedConfigs = ['single_queen', 'double_queen', 'suite'];
    const notes = [
      'Recently renovated',
      'HVAC maintenance scheduled',
      'New carpeting installed',
      'Plumbing repair completed',
      'Room inspection pending'
    ];

    // Generate 3 floors with rooms
    for (let floor = 1; floor <= 3; floor++) {
      const roomsPerFloor = floor === 1 ? 18 : 16; // First floor has more rooms
      for (let room = 1; room <= roomsPerFloor; room++) {
        const roomNumber = `${floor}${room.toString().padStart(2, '0')}`;
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const typeIndex = Math.floor(Math.random() * types.length);
        const bedIndex = Math.floor(Math.random() * bedConfigs.length);

        rooms.push({
          id: `room-${roomNumber}`,
          room_number: roomNumber,
          type: types[typeIndex],
          bed_config: bedConfigs[bedIndex],
          status: randomStatus,
          notes: Math.random() > 0.7 ? notes[Math.floor(Math.random() * notes.length)] : undefined,
          maintenance_requests: [] // Will be populated with random count
        });
      }
    }

    return rooms;
  };

  const generateQRCode = (roomId: string, roomNumber: string) => {
    const qrUrl = `${window.location.origin}/os/maintenance/room/${roomId}`;
    const qrData = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`;
    
    // Create a simple QR code display modal
    const newWindow = window.open('', '_blank', 'width=400,height=500');
    newWindow?.document.write(`
      <html>
        <head>
          <title>QR Code - Room ${roomNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { border: 2px solid #1e40af; padding: 20px; border-radius: 8px; display: inline-block; }
            .room-info { background: #1e40af; color: white; padding: 10px; margin-bottom: 20px; border-radius: 4px; }
            .scan-text { margin-top: 15px; color: #666; }
            button { background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin-top: 20px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="room-info">
              <h2>Georgetown Hotel</h2>
              <h3>Room ${roomNumber}</h3>
            </div>
            <img src="${qrData}" alt="QR Code for Room ${roomNumber}" />
            <div class="scan-text">
              <strong>Scan to Report an Issue</strong><br>
              for Room ${roomNumber}
            </div>
            <button onclick="window.print()">Print QR Code</button>
          </div>
        </body>
      </html>
    `);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Group rooms by floor
  const groupedRooms = filteredRooms.reduce((acc, room) => {
    const floor = room.room_number.charAt(0);
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {} as Record<string, Room[]>);

  // Sort rooms within each floor
  Object.keys(groupedRooms).forEach(floor => {
    groupedRooms[floor].sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number));
  });

  const handleLogTicket = (room: Room) => {
    const url = `/os/maintenance?tab=new-request&room=${room.room_number}`;
    window.open(url, '_blank');
  };

  const handleUploadPhoto = (room: Room) => {
    // This would integrate with camera/file upload
    toast.info(`Photo upload for Room ${room.room_number} coming soon`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...Array(18)].map((_, i) => (
          <Card key={i} className="aspect-square animate-pulse">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <div className="h-6 bg-muted rounded w-16"></div>
              <div className="h-4 bg-muted rounded w-12 mx-auto"></div>
              <div className="flex gap-1">
                <div className="h-6 w-6 bg-muted rounded"></div>
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
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Ready</span>
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
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Dirty</span>
                <div className="text-2xl font-bold">
                  {rooms.filter(r => r.status === 'dirty').length}
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
                <span className="text-sm font-medium text-muted-foreground">Out of Inventory</span>
                <div className="text-2xl font-bold">
                  {rooms.filter(r => r.status === 'out_of_inventory').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-orange-600" />
              <div>
                <span className="text-sm font-medium text-muted-foreground">Maintenance</span>
                <div className="text-2xl font-bold">
                  {rooms.filter(r => r.status === 'under_maintenance').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Ready</SelectItem>
            <SelectItem value="dirty">Dirty</SelectItem>
            <SelectItem value="under_maintenance">Maintenance</SelectItem>
            <SelectItem value="out_of_inventory">Out of Inventory</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Floor Tabs */}
      <Tabs value={activeFloor} onValueChange={setActiveFloor} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          {['1', '2', '3'].map(floor => (
            <TabsTrigger key={floor} value={floor} className="text-sm">
              Floor {floor}
            </TabsTrigger>
          ))}
        </TabsList>

        {['1', '2', '3'].map(floor => (
          <TabsContent key={floor} value={floor} className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(groupedRooms[floor] || []).map((room) => {
                const statusInfo = statusConfig[room.status as keyof typeof statusConfig];
                
                return (
                  <Card 
                    key={room.id} 
                    className="aspect-square hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 min-w-[120px] min-h-[120px]"
                    onClick={() => setSelectedRoom(room)}
                  >
                    <CardContent className="p-4 h-full flex flex-col justify-between">
                      {/* Room Number - Top Left */}
                      <div className="flex justify-between items-start">
                        <span className="text-lg font-bold text-primary">
                          {room.room_number}
                        </span>
                        {room._count?.maintenance_requests > 0 && (
                          <Badge variant="destructive" className="text-xs px-1 py-0 h-5">
                            {room._count.maintenance_requests}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Status - Center */}
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">{statusInfo.icon}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 h-auto min-h-[20px] border-2 whitespace-nowrap ${
                            room.status === 'active' ? 'border-emerald-500 text-emerald-700' :
                            room.status === 'dirty' ? 'border-yellow-500 text-yellow-700' :
                            room.status === 'out_of_inventory' ? 'border-red-500 text-red-700' :
                            'border-orange-500 text-orange-700'
                          }`}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      {/* Quick Actions - Bottom */}
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogTicket(room);
                          }}
                          title="Log Ticket"
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadPhoto(room);
                          }}
                          title="Upload Photo"
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoom(room);
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
            
            {(!groupedRooms[floor] || groupedRooms[floor].length === 0) && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No rooms found on Floor {floor}.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

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
                    {typeConfig[selectedRoom.type as keyof typeof typeConfig]?.label}
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tickets">
                      Tickets
                      {selectedRoom._count?.maintenance_requests > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 text-xs">
                          {selectedRoom._count.maintenance_requests}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{statusConfig[selectedRoom.status as keyof typeof statusConfig].icon}</span>
                          <span className="font-medium">{statusConfig[selectedRoom.status as keyof typeof statusConfig].label}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                        <p className="mt-1 font-medium">{typeConfig[selectedRoom.type as keyof typeof typeConfig]?.label}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bed Configuration</label>
                        <p className="mt-1 font-medium">{bedConfig[selectedRoom.bed_config as keyof typeof bedConfig]}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Open Tickets</label>
                        <p className="mt-1 font-medium">{selectedRoom._count?.maintenance_requests || 0}</p>
                      </div>
                    </div>
                    
                    {selectedRoom.notes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                        <p className="mt-1 text-sm">{selectedRoom.notes}</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="tickets" className="mt-4">
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Ticket history will be displayed here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="evidence" className="mt-4">
                    <div className="text-center py-8">
                      <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Photos and documents will be displayed here.</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Action Buttons */}
                <div className="border-t pt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Status change logic would go here
                        toast.info('Status change functionality coming soon');
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Ready
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        toast.info('Status change functionality coming soon');
                      }}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Mark Dirty
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        toast.info('Status change functionality coming soon');
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Out of Inventory
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => handleLogTicket(selectedRoom)}
                    >
                      <FileText className="h-4 w-4" />
                      New Ticket
                    </Button>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => generateQRCode(selectedRoom.id, selectedRoom.room_number)}
                  >
                    Generate QR Code
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};