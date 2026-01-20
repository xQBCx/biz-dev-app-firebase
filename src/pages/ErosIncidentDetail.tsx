import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, MapPin, Users, Clock, AlertTriangle,
  Send, CheckCircle2, Radio, UserPlus, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  useErosIncident, 
  useUpdateErosIncident,
  useIncidentCommunications,
  useSendCommunication,
  useMatchedResponders,
  useCreateDeployment,
  useUpdateDeploymentStatus,
  ErosSeverity,
  ErosDeploymentStatus
} from '@/hooks/useEROS';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const severityColors: Record<ErosSeverity, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-white',
  low: 'bg-muted text-muted-foreground',
};

const deploymentStatusConfig: Record<ErosDeploymentStatus, { label: string; color: string }> = {
  requested: { label: 'Requested', color: 'bg-blue-500' },
  accepted: { label: 'Accepted', color: 'bg-green-500' },
  en_route: { label: 'En Route', color: 'bg-yellow-500' },
  on_site: { label: 'On Site', color: 'bg-purple-500' },
  completed: { label: 'Completed', color: 'bg-gray-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500' },
  declined: { label: 'Declined', color: 'bg-red-500' },
};

export default function ErosIncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const { data: incident, isLoading, refetch } = useErosIncident(id);
  const { data: communications } = useIncidentCommunications(id);
  const { data: matchedResponders } = useMatchedResponders(id);
  const updateIncident = useUpdateErosIncident();
  const sendCommunication = useSendCommunication();
  const createDeployment = useCreateDeployment();
  const updateDeploymentStatus = useUpdateDeploymentStatus();

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="container py-6 text-center">
        <h2 className="text-xl font-semibold">Incident not found</h2>
        <Button className="mt-4" onClick={() => navigate('/eros')}>
          Back to EROS
        </Button>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !id) return;
    
    await sendCommunication.mutateAsync({
      incident_id: id,
      content: message,
    });
    setMessage('');
  };

  const handleResolve = async () => {
    if (!id) return;
    await updateIncident.mutateAsync({
      id,
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    });
    toast.success('Incident resolved');
  };

  const handleDeployResponder = async (responderId: string) => {
    if (!id) return;
    await createDeployment.mutateAsync({
      incident_id: id,
      responder_id: responderId,
      role: 'support',
    });
  };

  const deployments = incident.eros_deployments || [];

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/eros')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={severityColors[incident.severity as ErosSeverity]}>
                {incident.severity.toUpperCase()}
              </Badge>
              <Badge variant="outline">{incident.incident_code}</Badge>
              <Badge variant={incident.status === 'active' ? 'default' : 'secondary'}>
                {incident.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold">{incident.title}</h1>
            <p className="text-muted-foreground mt-1">
              Created {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {incident.status === 'active' && (
            <Button variant="default" size="sm" onClick={handleResolve}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incident.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-muted-foreground">{incident.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {incident.location_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{incident.location_address}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Responders</p>
                    <p className="text-sm text-muted-foreground">
                      {deployments.length} / {incident.min_responders} minimum
                    </p>
                  </div>
                </div>
              </div>

              {incident.required_skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {incident.required_skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="communications">
            <TabsList>
              <TabsTrigger value="communications">
                <Radio className="h-4 w-4 mr-2" />
                Communications
              </TabsTrigger>
              <TabsTrigger value="responders">
                <Users className="h-4 w-4 mr-2" />
                Deployed ({deployments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="communications" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[300px] pr-4">
                    {(communications || []).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No communications yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {communications?.map((msg: any) => (
                          <div key={msg.id} className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Radio className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(msg.sent_at), 'MMM d, HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Send a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendCommunication.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="responders" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {deployments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No responders deployed yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deployments.map((deployment: any) => (
                        <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">Responder</p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {deployment.role}
                              </p>
                            </div>
                          </div>
                          <Badge className={deploymentStatusConfig[deployment.status as ErosDeploymentStatus].color}>
                            {deploymentStatusConfig[deployment.status as ErosDeploymentStatus].label}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Deploy Responders */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Available Responders
              </CardTitle>
              <CardDescription>
                Matched based on skills and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(matchedResponders || []).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No matching responders available
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedResponders?.slice(0, 5).map((responder: any) => (
                    <div key={responder.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Responder</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {responder.skills?.slice(0, 2).map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleDeployResponder(responder.id)}
                        disabled={createDeployment.isPending}
                      >
                        Deploy
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Escalate Incident
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Radio className="h-4 w-4 mr-2" />
                Request Resources
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
