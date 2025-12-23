/**
 * Momentum: Priority-Learning Task Engine
 * 
 * Tasks that prioritize themselves. Learns what truly matters to you,
 * auto-schedules based on deadlines and energy, and adapts as priorities shift.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Sparkles, Calendar, Clock, Target, TrendingUp, 
  ChevronRight, MoreVertical, Flame, Zap, Battery, BatteryLow
} from 'lucide-react';
import { GridToolLayout } from '../GridToolLayout';
import { GRID_TOOLS } from '@/types/grid';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  aiPriority: number; // 0-100 AI-calculated priority score
  estimatedMinutes: number;
  dueDate?: Date;
  project?: string;
  energyLevel: 'high' | 'medium' | 'low';
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Review Q4 partnership proposal from Sarah',
    completed: false,
    priority: 'high',
    aiPriority: 95,
    estimatedMinutes: 30,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    project: 'Partnerships',
    energyLevel: 'high',
  },
  {
    id: '2',
    title: 'Prepare investor presentation deck',
    completed: false,
    priority: 'high',
    aiPriority: 88,
    estimatedMinutes: 120,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
    project: 'Funding',
    energyLevel: 'high',
  },
  {
    id: '3',
    title: 'Follow up with Michael Torres',
    completed: false,
    priority: 'medium',
    aiPriority: 72,
    estimatedMinutes: 15,
    project: 'Networking',
    energyLevel: 'low',
  },
  {
    id: '4',
    title: 'Update CRM with new contacts',
    completed: false,
    priority: 'low',
    aiPriority: 45,
    estimatedMinutes: 20,
    energyLevel: 'low',
  },
  {
    id: '5',
    title: 'Weekly team standup notes',
    completed: true,
    priority: 'medium',
    aiPriority: 60,
    estimatedMinutes: 10,
    energyLevel: 'medium',
  },
];

export default function MomentumTool() {
  const tool = GRID_TOOLS.momentum;
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const todayProgress = Math.round((completedTasks.length / tasks.length) * 100);

  const totalEstimatedTime = activeTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const highPriorityCount = activeTasks.filter(t => t.aiPriority >= 80).length;

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
      aiPriority: 50,
      estimatedMinutes: 30,
      energyLevel: 'medium',
    };
    
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  };

  const getEnergyIcon = (level: Task['energyLevel']) => {
    switch (level) {
      case 'high': return <Battery className="h-3.5 w-3.5 text-green-500" />;
      case 'medium': return <Battery className="h-3.5 w-3.5 text-amber-500" />;
      case 'low': return <BatteryLow className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getPriorityGradient = (aiPriority: number) => {
    if (aiPriority >= 80) return 'from-red-500 to-orange-500';
    if (aiPriority >= 50) return 'from-amber-500 to-yellow-500';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <GridToolLayout 
      tool={tool}
      actions={
        <Button variant="default" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      }
      sidebar={
        <div className="space-y-4">
          {/* Today's Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Today's Momentum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{todayProgress}%</span>
              </div>
              <Progress value={todayProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedTasks.length} of {tasks.length} tasks completed
              </p>
            </CardContent>
          </Card>

          {/* Smart Insights */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <p className="font-medium">High-energy window detected</p>
                <p className="mt-0.5 opacity-80">10am-12pm is your peak focus time. Schedule demanding tasks then.</p>
              </div>
              <div className="p-2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300">
                <p className="font-medium">Pattern detected</p>
                <p className="mt-0.5 opacity-80">You complete 40% more tasks when starting with a quick win.</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  High Priority
                </span>
                <Badge variant="secondary">{highPriorityCount}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Est. Time
                </span>
                <Badge variant="secondary">{Math.round(totalEstimatedTime / 60)}h {totalEstimatedTime % 60}m</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Add Task Input */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="What needs to be done? AI will help prioritize..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <Button onClick={addTask} disabled={!newTaskTitle.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Priority Queue
              </CardTitle>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Ranked
              </Badge>
            </div>
            <CardDescription>
              Tasks automatically sorted by urgency, importance, and your work patterns
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {activeTasks
                  .sort((a, b) => b.aiPriority - a.aiPriority)
                  .map((task, index) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-3 p-3 rounded-lg border hover:border-primary/30 transition-colors"
                    >
                      {/* Priority Indicator */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${getPriorityGradient(task.aiPriority)}`} />
                        <span className="text-xs font-medium text-muted-foreground">
                          {task.aiPriority}
                        </span>
                      </div>

                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="h-5 w-5"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {task.project && (
                            <Badge variant="secondary" className="text-xs">
                              {task.project}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedMinutes}m
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {getEnergyIcon(task.energyLevel)}
                            {task.energyLevel} energy
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {index === 0 && (
                        <Badge className="bg-gradient-to-r from-primary to-primary/60 gap-1">
                          <Zap className="h-3 w-3" />
                          Do Now
                        </Badge>
                      )}

                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>

              {/* Completed Section */}
              {completedTasks.length > 0 && (
                <div className="mt-6">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    <ChevronRight className={`h-4 w-4 transition-transform ${showCompleted ? 'rotate-90' : ''}`} />
                    Completed ({completedTasks.length})
                  </Button>
                  
                  {showCompleted && (
                    <div className="mt-2 space-y-2 pl-6">
                      {completedTasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-dashed opacity-60"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                          />
                          <span className="text-sm line-through">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </GridToolLayout>
  );
}
