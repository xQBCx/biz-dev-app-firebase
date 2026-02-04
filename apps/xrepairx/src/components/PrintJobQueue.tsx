import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Printer,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Truck,
  AlertTriangle,
  Package,
  Layers,
  MapPin
} from "lucide-react";

interface PrintJob {
  id: string;
  partName: string;
  partType: string;
  status: 'pending' | 'queued' | 'approved' | 'printing' | 'completed' | 'failed' | 'cancelled' | 'installed';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  material: string;
  estimatedTime: number;
  progress?: number;
  fabricationUnit?: string;
  workOrderId?: string;
  requestedBy?: string;
  requestedAt: string;
}

interface FabricationUnit {
  id: string;
  name: string;
  status: 'available' | 'in_transit' | 'printing' | 'maintenance' | 'offline';
  currentJob?: string;
  location?: string;
  materialsAvailable: string[];
}

interface PrintJobQueueProps {
  jobs?: PrintJob[];
  fabricationUnits?: FabricationUnit[];
  onApproveJob?: (jobId: string) => void;
  onCancelJob?: (jobId: string) => void;
  onAssignUnit?: (jobId: string, unitId: string) => void;
}

// Mock data for demonstration
const mockJobs: PrintJob[] = [
  {
    id: '1',
    partName: 'HVAC Vent Cover Bracket',
    partType: 'bracket',
    status: 'printing',
    priority: 'high',
    material: 'PETG',
    estimatedTime: 45,
    progress: 67,
    fabricationUnit: 'Van-01',
    requestedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    partName: 'Door Handle Mount',
    partType: 'mount',
    status: 'queued',
    priority: 'normal',
    material: 'PLA',
    estimatedTime: 30,
    requestedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    partName: 'Railcar Latch Cover',
    partType: 'cover',
    status: 'pending',
    priority: 'emergency',
    material: 'ABS',
    estimatedTime: 90,
    requestedAt: new Date(Date.now() - 1800000).toISOString()
  }
];

const mockUnits: FabricationUnit[] = [
  {
    id: '1',
    name: 'Van-01',
    status: 'printing',
    currentJob: 'HVAC Vent Cover Bracket',
    location: 'Downtown Houston',
    materialsAvailable: ['PLA', 'PETG', 'ABS']
  },
  {
    id: '2',
    name: 'Van-02',
    status: 'available',
    location: 'Katy, TX',
    materialsAvailable: ['PLA', 'PETG', 'TPU']
  },
  {
    id: '3',
    name: 'Van-03',
    status: 'in_transit',
    location: 'En route to Sugar Land',
    materialsAvailable: ['PLA', 'PETG']
  }
];

export const PrintJobQueue = ({
  jobs = mockJobs,
  fabricationUnits = mockUnits,
  onApproveJob,
  onCancelJob,
  onAssignUnit
}: PrintJobQueueProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'printing': return <Printer className="h-4 w-4 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'queued': return <Clock className="h-4 w-4" />;
      case 'pending': return <Pause className="h-4 w-4" />;
      case 'installed': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'queued': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'pending': return 'bg-muted text-muted-foreground border-border';
      case 'installed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-muted';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-muted';
    }
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'printing': return 'bg-blue-500';
      case 'in_transit': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-muted';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const activeJobs = jobs.filter(j => ['printing', 'queued', 'approved'].includes(j.status));
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const completedJobs = jobs.filter(j => ['completed', 'installed'].includes(j.status));

  return (
    <div className="space-y-6">
      {/* Fabrication Units Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Mobile Fabrication Units
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fabricationUnits.map((unit) => (
              <div 
                key={unit.id} 
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getUnitStatusColor(unit.status)}`} />
                    <span className="font-medium">{unit.name}</span>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {unit.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {unit.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    {unit.location}
                  </div>
                )}
                
                {unit.currentJob && (
                  <div className="text-sm bg-blue-500/10 text-blue-500 p-2 rounded">
                    <Printer className="h-3 w-3 inline mr-1" />
                    Printing: {unit.currentJob}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {unit.materialsAvailable.map((mat) => (
                    <Badge key={mat} variant="secondary" className="text-xs">
                      {mat}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Active Print Jobs
            </span>
            <Badge variant="secondary">{activeJobs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {activeJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active print jobs</p>
              ) : (
                activeJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{job.partName}</h4>
                          <Badge className={getPriorityColor(job.priority)} variant="secondary">
                            {job.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{job.partType}</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{job.status}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-muted-foreground">Material</span>
                        <p className="font-medium">{job.material}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Time</span>
                        <p className="font-medium">{formatTime(job.estimatedTime)}</p>
                      </div>
                      {job.fabricationUnit && (
                        <div>
                          <span className="text-muted-foreground">Unit</span>
                          <p className="font-medium">{job.fabricationUnit}</p>
                        </div>
                      )}
                    </div>
                    
                    {job.status === 'printing' && job.progress !== undefined && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pending Approval */}
      {pendingJobs.length > 0 && (
        <Card className="border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-yellow-600">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pending Approval
              </span>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                {pendingJobs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{job.partName}</h4>
                        <Badge className={getPriorityColor(job.priority)} variant="secondary">
                          {job.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{job.material} • {formatTime(job.estimatedTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => onApproveJob?.(job.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onCancelJob?.(job.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
