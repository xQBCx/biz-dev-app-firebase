import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertCircle, Clock, Zap, TrendingUp, Search, Eye, MessageSquare, Calendar, MapPin, FileText, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface MaintenanceRequest {
  id: string;
  request_number: string;
  suite_number: string;
  location_type: string;
  specific_location?: string;
  selected_items: any; // Allow any JSON type for selected_items
  urgency: string; // Allow any string for urgency
  status: string; // Allow any string for status
  description: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

const urgencyConfig = {
  low: { label: 'Low', icon: '🔵', color: 'border-blue-500 text-blue-700' },
  medium: { label: 'Medium', icon: '🟡', color: 'border-yellow-500 text-yellow-700' },
  high: { label: 'High', icon: '🟠', color: 'border-orange-500 text-orange-700' },
  emergency: { label: 'Emergency', icon: '🔴', color: 'border-red-500 text-red-700' },
};

const statusConfig = {
  pending: { label: 'Pending', icon: '⏳', color: 'border-gray-500 text-gray-700' },
  assigned: { label: 'Assigned', icon: '👤', color: 'border-blue-500 text-blue-700' },
  in_progress: { label: 'In Progress', icon: '🔧', color: 'border-yellow-500 text-yellow-700' },
  completed: { label: 'Completed', icon: '✅', color: 'border-green-500 text-green-700' },
  cancelled: { label: 'Cancelled', icon: '❌', color: 'border-red-500 text-red-700' },
};

export const MaintenanceRequestsList = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.suite_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    
    // Active filter logic
    const isActive = request.status !== 'completed' && request.status !== 'cancelled';
    const matchesActiveFilter = activeFilter === 'all' || 
                                (activeFilter === 'active' && isActive) ||
                                (activeFilter === 'completed' && !isActive);
    
    return matchesSearch && matchesStatus && matchesUrgency && matchesActiveFilter;
  });

  // Group requests by status for tabs
  const groupedRequests = {
    all: filteredRequests,
    active: filteredRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled'),
    completed: filteredRequests.filter(r => r.status === 'completed' || r.status === 'cancelled')
  };

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
  };

  const handleCommentRequest = (request: MaintenanceRequest) => {
    // Would integrate with comments system
    console.log('Comment on request:', request.request_number);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
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
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔴</span>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Emergency</span>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.urgency === 'emergency' && r.status !== 'completed').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔧</span>
              <div>
                <span className="text-sm font-medium text-muted-foreground">In Progress</span>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'in_progress').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏳</span>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Pending</span>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'pending').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Completed</span>
                <div className="text-2xl font-bold">
                  {requests.filter(r => r.status === 'completed').length}
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
            placeholder="Search by request #, suite, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by priority" />
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

      {/* Request Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all" className="text-sm">
            All ({groupedRequests.all.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-sm">
            Active ({groupedRequests.active.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-sm">
            Completed ({groupedRequests.completed.length})
          </TabsTrigger>
        </TabsList>

        {['all', 'active', 'completed'].map(filter => (
          <TabsContent key={filter} value={filter} className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {(groupedRequests[filter as keyof typeof groupedRequests] || []).map((request) => {
                const urgency = urgencyConfig[request.urgency as keyof typeof urgencyConfig] || urgencyConfig.medium;
                const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending;
                
                return (
                  <Card 
                    key={request.id} 
                    className="aspect-square hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 min-w-[120px] min-h-[120px]"
                    onClick={() => handleViewRequest(request)}
                  >
                    <CardContent className="p-4 h-full flex flex-col justify-between">
                      {/* Request Number - Top */}
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-primary">
                          #{request.request_number}
                        </span>
                        <span className="text-lg">{urgency.icon}</span>
                      </div>
                      
                      {/* Suite & Status - Center */}
                      <div className="flex flex-col items-center text-center">
                        <span className="text-lg font-semibold mb-1">
                          {request.suite_number}
                        </span>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">{status.icon}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0 h-5 border-2 ${status.color}`}
                          >
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Quick Actions - Bottom */}
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewRequest(request);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCommentRequest(request);
                          }}
                          title="Add Comment"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {(!groupedRequests[filter as keyof typeof groupedRequests] || groupedRequests[filter as keyof typeof groupedRequests].length === 0) && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No maintenance requests found.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Request Detail Sheet */}
      <Sheet open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <SheetContent className="w-full sm:w-[540px]">
          {selectedRequest && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <span className="text-2xl">{statusConfig[selectedRequest.status as keyof typeof statusConfig].icon}</span>
                  Request #{selectedRequest.request_number}
                  <Badge 
                    variant="outline" 
                    className={`border-2 ${urgencyConfig[selectedRequest.urgency as keyof typeof urgencyConfig].color}`}
                  >
                    {urgencyConfig[selectedRequest.urgency as keyof typeof urgencyConfig].label} Priority
                  </Badge>
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Suite</label>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedRequest.suite_number}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="mt-1 font-medium">{selectedRequest.location_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{urgencyConfig[selectedRequest.urgency as keyof typeof urgencyConfig].icon}</span>
                          <span className="font-medium">{urgencyConfig[selectedRequest.urgency as keyof typeof urgencyConfig].label}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{statusConfig[selectedRequest.status as keyof typeof statusConfig].icon}</span>
                          <span className="font-medium">{statusConfig[selectedRequest.status as keyof typeof statusConfig].label}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Created</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="mt-1 text-sm bg-muted/50 p-3 rounded-md">{selectedRequest.description}</p>
                    </div>

                    {selectedRequest.specific_location && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Specific Location</label>
                        <p className="mt-1 text-sm">{selectedRequest.specific_location}</p>
                      </div>
                    )}

                    {Array.isArray(selectedRequest.selected_items) && selectedRequest.selected_items.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Selected Items</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedRequest.selected_items.map((itemId: number) => (
                            <Badge key={itemId} variant="outline" className="text-xs">
                              #{itemId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="comments" className="mt-4">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Comments and communication will be displayed here.</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="mt-4">
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Request history and status changes will be displayed here.</p>
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
                        console.log('Assign request');
                      }}
                    >
                      <User className="h-4 w-4" />
                      Assign
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        console.log('Update status');
                      }}
                    >
                      <Clock className="h-4 w-4" />
                      Update Status
                    </Button>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      console.log('Add comment');
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
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