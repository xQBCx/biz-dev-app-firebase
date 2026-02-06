import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Bed, Users, Wrench, Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MaintenanceRequestForm } from './MaintenanceRequestForm';

interface Room {
  id: string;
  room_number: string;
  type: string;
  bed_config: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface MaintenanceRequest {
  id: string;
  request_number: string;
  status: string;
  urgency: string;
  description?: string;
  created_at: string;
  user_id: string;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500', icon: CheckCircle2 },
  out_of_inventory: { label: 'Out of Inventory', color: 'bg-red-500', icon: XCircle },
  under_maintenance: { label: 'Under Maintenance', color: 'bg-amber-500', icon: Wrench }
};

const typeConfig = {
  standard: { label: 'Standard Room', icon: Bed },
  suite: { label: 'Suite', icon: Users },
  handicap: { label: 'ADA Accessible', icon: Users },
  out_of_inventory: { label: 'Out of Inventory', icon: Wrench }
};

const bedConfig = {
  single_queen: '1 Queen Bed',
  double_queen: '2 Queen Beds',
  suite: 'Suite Configuration'
};

const urgencyConfig = {
  low: { label: 'Low', variant: 'secondary' as const },
  medium: { label: 'Medium', variant: 'default' as const },
  high: { label: 'High', variant: 'destructive' as const },
  emergency: { label: 'Emergency', variant: 'destructive' as const }
};

const requestStatusConfig = {
  pending: { label: 'Pending', color: 'bg-blue-500' },
  assigned: { label: 'Assigned', color: 'bg-purple-500' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500' },
  completed: { label: 'Completed', color: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500' }
};

export const RoomMaintenancePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);

  useEffect(() => {
    if (roomId && user) {
      fetchRoomData();
    }
  }, [roomId, user]);

  const fetchRoomData = async () => {
    console.log('fetchRoomData called with roomId:', roomId, 'user:', user?.id);
    try {
      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();

      console.log('Room fetch result:', { roomData, roomError });

      if (roomError) {
        console.error('Room fetch error:', roomError);
        throw roomError;
      }
      
      if (!roomData) {
        console.log('No room found with id:', roomId);
        setRoom(null);
        setLoading(false);
        return;
      }
      
      setRoom(roomData);
      setNotes(roomData.notes || '');

      // Fetch maintenance requests for this room
      const { data: requestsData, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });

      console.log('Requests fetch result:', { requestsData, requestsError });

      if (requestsError) {
        console.error('Requests fetch error:', requestsError);
        throw requestsError;
      }
      
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching room data:', error);
      toast.error('Failed to fetch room data');
    } finally {
      setLoading(false);
    }
  };

  const updateRoomStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: newStatus })
        .eq('id', roomId);

      if (error) throw error;

      setRoom(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Room status updated to ${statusConfig[newStatus as keyof typeof statusConfig].label}`);
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Failed to update room status');
    }
  };

  const updateRoomNotes = async () => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ notes })
        .eq('id', roomId);

      if (error) throw error;

      setRoom(prev => prev ? { ...prev, notes } : null);
      toast.success('Room notes updated');
    } catch (error) {
      console.error('Error updating room notes:', error);
      toast.error('Failed to update room notes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Room not found.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/os/maintenance')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Maintenance
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const TypeIcon = typeConfig[room.type as keyof typeof typeConfig]?.icon || Bed;
  const statusInfo = statusConfig[room.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/os/maintenance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TypeIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Room {room.room_number}</h1>
              <p className="text-muted-foreground">
                {typeConfig[room.type as keyof typeof typeConfig]?.label} • {bedConfig[room.bed_config as keyof typeof bedConfig]}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <Button 
              onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </div>

        {/* Room Status Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon className="h-5 w-5" />
                <span className="font-medium">Current Status:</span>
                <Badge className={`${statusInfo.color} text-white`}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex gap-2">
                {room.status !== 'out_of_inventory' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRoomStatus('out_of_inventory')}
                  >
                    Mark Out of Inventory
                  </Button>
                )}
                {room.status === 'out_of_inventory' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRoomStatus('active')}
                  >
                    Mark Back in Service
                  </Button>
                )}
                {room.status !== 'under_maintenance' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRoomStatus('under_maintenance')}
                  >
                    Mark Under Maintenance
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              Tickets
              {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Room Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Room Number</label>
                      <p className="text-lg font-semibold">{room.room_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      <p className="font-medium">{typeConfig[room.type as keyof typeof typeConfig]?.label}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bed Configuration</label>
                      <p className="font-medium">{bedConfig[room.bed_config as keyof typeof bedConfig]}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge className={`${statusInfo.color} text-white`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Add notes about this room..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={updateRoomNotes} size="sm">
                    Update Notes
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tickets Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No maintenance requests for this room yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{request.request_number}</span>
                            <Badge variant={urgencyConfig[request.urgency as keyof typeof urgencyConfig].variant}>
                              {urgencyConfig[request.urgency as keyof typeof urgencyConfig].label}
                            </Badge>
                            <Badge className={`${requestStatusConfig[request.status as keyof typeof requestStatusConfig].color} text-white`}>
                              {requestStatusConfig[request.status as keyof typeof requestStatusConfig].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.description?.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {requests.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {requests.length - 3} more tickets...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Maintenance Requests</h3>
                    <p className="text-muted-foreground mb-4">This room has no maintenance requests yet.</p>
                    <Button onClick={() => setShowNewTicket(true)}>
                      <Wrench className="h-4 w-4 mr-2" />
                      Create First Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">#{request.request_number}</span>
                            <Badge variant={urgencyConfig[request.urgency as keyof typeof urgencyConfig].variant}>
                              {urgencyConfig[request.urgency as keyof typeof urgencyConfig].label}
                            </Badge>
                            <Badge className={`${requestStatusConfig[request.status as keyof typeof requestStatusConfig].color} text-white`}>
                              {requestStatusConfig[request.status as keyof typeof requestStatusConfig].label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{request.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Created on {new Date(request.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">New Maintenance Request - Room {room.room_number}</h2>
                  <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                <MaintenanceRequestForm 
                  prefilledRoomId={room.id}
                  prefilledSuiteNumber={room.room_number}
                  onSuccess={() => {
                    setShowNewTicket(false);
                    fetchRoomData(); // Refresh room data
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};