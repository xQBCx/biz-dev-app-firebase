import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, CheckCircle, Clock, ArrowRight, Plus } from 'lucide-react';
import TeamDirectory from '@/components/TeamDirectory';
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

const Onboarding = () => {
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
      name: 'Emma Wilson', 
      email: 'emma.w@email.com',
      position: 'Leasing Consultant',
      stage: 'orientation', 
      progress: 85,
      startDate: '2024-01-05'
    },
    { 
      id: '4', 
      name: 'David Rodriguez', 
      email: 'david.r@email.com',
      position: 'Front Desk',
      stage: 'ready', 
      progress: 100,
      startDate: '2024-01-01'
    }
  ]);

  const stages = [
    { id: 'invite', title: 'Invite Sent', color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
    { id: 'docs', title: 'Documentation', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    { id: 'training', title: 'Training', color: 'bg-purple-100 text-purple-800', icon: Users },
    { id: 'orientation', title: 'Orientation', color: 'bg-orange-100 text-orange-800', icon: Clock },
    { id: 'ready', title: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  ];

  const moveCandidateToStage = (candidateId: string, newStage: string) => {
    setCandidates(prev => prev.map(candidate => {
      if (candidate.id === candidateId) {
        const stageIndex = stages.findIndex(s => s.id === newStage);
        const progress = ((stageIndex + 1) / stages.length) * 100;
        return { 
          ...candidate, 
          stage: newStage as OnboardingCandidate['stage'], 
          progress 
        };
      }
      return candidate;
    }));
  };

  const handleDragStart = (event: React.DragEvent, candidateId: string) => {
    event.dataTransfer.setData('application/json', JSON.stringify({ candidateId }));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, newStage: string) => {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    moveCandidateToStage(data.candidateId, newStage);
  };

  const getStageIcon = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.icon : CheckCircle;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>OS</span>
        <span>/</span>
        <span className="text-foreground">Onboarding</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Onboarding & Team</h1>
          <p className="text-muted-foreground">
            Manage new hire onboarding and view your team directory
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <Tabs defaultValue="onboarding" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="onboarding">Onboarding Pipeline</TabsTrigger>
          <TabsTrigger value="team">Team Directory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="onboarding" className="space-y-6 mt-6">

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter(c => c.stage === stage.id);
          const StageIcon = stage.icon;

          return (
            <Card 
              key={stage.id} 
              className="card-elegant min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StageIcon className="h-4 w-4" />
                    {stage.title}
                  </div>
                  <Badge variant="outline">{stageCandidates.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageCandidates.map((candidate) => {
                  const StageIcon = getStageIcon(candidate.stage);
                  return (
                    <div 
                      key={candidate.id} 
                      className="p-3 border rounded-lg bg-background cursor-move hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{candidate.name}</span>
                        <StageIcon className="h-4 w-4" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {candidate.position}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Started: {new Date(candidate.startDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-muted rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${candidate.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{candidate.progress}%</span>
                      </div>
                    </div>
                  );
                })}
                
                {stageCandidates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No candidates in this stage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Active Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
            <p className="text-sm text-muted-foreground">Total in pipeline</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(candidates.reduce((sum, c) => sum + c.progress, 0) / candidates.length)}%
            </div>
            <p className="text-sm text-muted-foreground">Across all stages</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Ready to Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {candidates.filter(c => c.stage === 'ready').length}
            </div>
            <p className="text-sm text-muted-foreground">Completed onboarding</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Avg Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2</div>
            <p className="text-sm text-muted-foreground">Days to completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="card-elegant">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <ArrowRight className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">How to use the Kanban Board</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Drag and drop candidates between columns to move them through the onboarding process. 
            Progress is automatically updated based on their current stage. Use this to track and manage 
            the onboarding pipeline for new hires across all departments.
          </p>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-6 mt-6">
          <TeamDirectory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Onboarding;