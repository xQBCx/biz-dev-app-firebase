import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar, CheckCircle, Clock, ArrowRight, Plus } from 'lucide-react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface OnboardingCandidate {
  id: string;
  name: string;
  email: string;
  position: string;
  stage: 'invite' | 'docs' | 'training' | 'orientation' | 'ready';
  progress: number;
  startDate: string;
}

const OnboardingManagement = () => {
  const [candidates, setCandidates] = useState<OnboardingCandidate[]>([
    { 
      id: '1', 
      name: 'Sarah Johnson', 
      email: 'sarah.j@email.com',
      position: 'Property Manager',
      stage: 'docs', 
      progress: 25,
      startDate: '2024-01-15'
    },
    { 
      id: '2', 
      name: 'Michael Chen', 
      email: 'michael.c@email.com',
      position: 'Maintenance Tech',
      stage: 'training', 
      progress: 60,
      startDate: '2024-01-10'
    },
    { 
      id: '3', 
      name: 'Emily Rodriguez', 
      email: 'emily.r@email.com',
      position: 'Front Desk Agent',
      stage: 'orientation', 
      progress: 80,
      startDate: '2024-01-12'
    },
    { 
      id: '4', 
      name: 'David Kim', 
      email: 'david.k@email.com',
      position: 'Housekeeping Lead',
      stage: 'ready', 
      progress: 100,
      startDate: '2024-01-08'
    },
    { 
      id: '5', 
      name: 'Jessica Brown', 
      email: 'jessica.b@email.com',
      position: 'Guest Services',
      stage: 'invite', 
      progress: 0,
      startDate: '2024-01-20'
    }
  ]);

  const stages = [
    { id: 'invite', title: 'Send Invite', color: 'bg-blue-100 text-blue-800', icon: Plus },
    { id: 'docs', title: 'Document Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { id: 'training', title: 'Training', color: 'bg-purple-100 text-purple-800', icon: Users },
    { id: 'orientation', title: 'Orientation', color: 'bg-orange-100 text-orange-800', icon: Calendar },
    { id: 'ready', title: 'Ready to Start', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  ];

  const initialNodes: Node[] = stages.map((stage, index) => ({
    id: stage.id,
    type: 'default',
    position: { x: index * 200, y: 100 },
    data: { 
      label: (
        <div className="p-2 text-center">
          <stage.icon className="w-4 h-4 mx-auto mb-1" />
          <div className="text-xs font-medium">{stage.title}</div>
          <div className="text-xs text-muted-foreground">
            {candidates.filter(c => c.stage === stage.id).length} candidates
          </div>
        </div>
      )
    },
    style: { 
      backgroundColor: '#ffffff',
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      width: 150,
      height: 80
    }
  }));

  const initialEdges: Edge[] = stages.slice(0, -1).map((_, index) => ({
    id: `e${index}-${index + 1}`,
    source: stages[index].id,
    target: stages[index + 1].id,
    animated: true,
    style: { stroke: '#6366f1' }
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds));

  const handleDragEnd = (candidate: OnboardingCandidate, newStage: string) => {
    setCandidates(prev => 
      prev.map(c => 
        c.id === candidate.id 
          ? { ...c, stage: newStage as any, progress: getProgressByStage(newStage) }
          : c
      )
    );
  };

  const getProgressByStage = (stage: string): number => {
    switch (stage) {
      case 'invite': return 0;
      case 'docs': return 25;
      case 'training': return 50;
      case 'orientation': return 75;
      case 'ready': return 100;
      default: return 0;
    }
  };

  const getStageStats = () => {
    const activeCandidates = candidates.filter(c => c.stage !== 'ready').length;
    const avgCompletion = Math.round(
      candidates.reduce((sum, c) => sum + c.progress, 0) / candidates.length
    );
    const readyToStart = candidates.filter(c => c.stage === 'ready').length;

    return { activeCandidates, avgCompletion, readyToStart };
  };

  const stats = getStageStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeCandidates}</p>
                <p className="text-xs text-muted-foreground">Active Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                <p className="text-xs text-muted-foreground">Avg Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.readyToStart}</p>
                <p className="text-xs text-muted-foreground">Ready to Start</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Pipeline</CardTitle>
          <CardDescription>
            Visual representation of the onboarding process flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: '200px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>

      {/* Candidates by Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter(c => c.stage === stage.id);
          const StageIcon = stage.icon;
          
          return (
            <Card key={stage.id} className="min-h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <StageIcon className="w-4 h-4" />
                    {stage.title}
                  </span>
                  <Badge className={stage.color}>
                    {stageCandidates.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageCandidates.map((candidate) => (
                  <Card key={candidate.id} className="p-3 cursor-move hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{candidate.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {candidate.progress}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{candidate.position}</p>
                      <Progress value={candidate.progress} className="h-1" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{candidate.email}</span>
                        <span>{candidate.startDate}</span>
                      </div>
                    </div>
                  </Card>
                ))}
                {stageCandidates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No candidates in this stage
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to use the Onboarding Board</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Track Progress:</strong> Monitor each candidate's journey through the onboarding process</p>
            <p>• <strong>Visual Pipeline:</strong> Use the flow diagram to understand the overall process</p>
            <p>• <strong>Stage Management:</strong> View candidates organized by their current onboarding stage</p>
            <p>• <strong>Progress Tracking:</strong> Each candidate card shows completion percentage and key details</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingManagement;