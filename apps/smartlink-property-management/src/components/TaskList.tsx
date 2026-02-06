import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SOP {
  id: string;
  title: string;
  sop_url: string;
}

interface TaskListProps {
  module: 'frontdesk' | 'housekeeping' | 'maintenance';
  title: string;
  icon: React.ComponentType<any>;
}

const TaskList = ({ module, title, icon: Icon }: TaskListProps) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sops, setSops] = useState<SOP[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);

  useEffect(() => {
    fetchSOPs();
    loadNotes();
  }, [module]);

  const fetchSOPs = async () => {
    try {
      const { data, error } = await supabase
        .from('sops')
        .select('id, title, sop_url')
        .eq('department', module)
        .order('title');

      if (error) throw error;
      setSops(data || []);
    } catch (error) {
      console.error('Error fetching SOPs:', error);
    }
  };

  const loadNotes = () => {
    const savedNotes = localStorage.getItem(`${module}-notes`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  };

  const saveNotes = () => {
    localStorage.setItem(`${module}-notes`, notes);
  };

  // Mock task data for wireframe
  const mockTasks = [
    { id: 1, title: 'Morning checklist completion', status: 'pending', assignee: 'John D.', priority: 'high' },
    { id: 2, title: 'Unit inspection - 4B', status: 'in-progress', assignee: 'Sarah M.', priority: 'medium' },
    { id: 3, title: 'Equipment maintenance', status: 'assigned', assignee: 'Mike R.', priority: 'low' },
    { id: 4, title: 'Tenant request follow-up', status: 'due-soon', assignee: 'Lisa K.', priority: 'high' },
    { id: 5, title: 'Daily report submission', status: 'pending', assignee: 'Alex T.', priority: 'medium' }
  ];

  const filteredTasks = mockTasks.filter(task => {
    if (filter === 'assigned') return task.status === 'assigned' || task.status === 'in-progress';
    if (filter === 'due-soon') return task.status === 'due-soon';
    return true;
  }).filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-green-100 text-green-800';
      case 'due-soon': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>OS</span>
        <span>/</span>
        <span className="text-foreground">{title}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">
              Manage {module} tasks and operations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Bar */}
          <Card className="card-elegant">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="due-soon">Due Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task List */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
              <CardDescription>
                Current {module} tasks and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks match your current filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Assigned to: {task.assignee}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Notes */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                {title} department notes and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add notes for the team..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
              <Button onClick={saveNotes} className="w-full">
                Save Notes
              </Button>
            </CardContent>
          </Card>

          {/* SOPs */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Department SOPs</CardTitle>
              <CardDescription>
                Standard operating procedures for {title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sops.length === 0 ? (
                <p className="text-sm text-muted-foreground">No SOPs available for this department</p>
              ) : (
                <div className="space-y-2">
                  {sops.map((sop) => (
                    <Sheet key={sop.id}>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedSOP(sop)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          <div className="truncate">
                            {sop.title}
                          </div>
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[600px] sm:max-w-[600px]">
                        <SheetHeader>
                          <SheetTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {sop.title}
                          </SheetTitle>
                          <SheetDescription>
                            Standard Operating Procedure for {title}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Document Details</h3>
                            <div className="space-y-2 text-sm">
                              <div><strong>Department:</strong> {title}</div>
                              <div><strong>Document:</strong> {sop.title}</div>
                              <div><strong>Status:</strong> <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge></div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h3 className="font-semibold">Quick Reference</h3>
                            <div className="bg-background border rounded-lg p-4 space-y-2">
                              {sop.title.includes('Emergency') && (
                                <div className="space-y-2">
                                  <p className="font-medium text-red-600">Emergency Response Protocol</p>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Assess situation immediately</li>
                                    <li>Contact emergency services if needed</li>
                                    <li>Notify management and maintenance team</li>
                                    <li>Document incident thoroughly</li>
                                    <li>Follow up with safety report</li>
                                  </ul>
                                </div>
                              )}
                              
                              {sop.title.includes('Work Order') && (
                                <div className="space-y-2">
                                  <p className="font-medium text-blue-600">Work Order Processing</p>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Receive and log maintenance request</li>
                                    <li>Assess urgency and priority level</li>
                                    <li>Assign to appropriate technician</li>
                                    <li>Track progress and completion</li>
                                    <li>Update tenant and close request</li>
                                  </ul>
                                </div>
                              )}
                              
                              {sop.title.includes('Preventive') && (
                                <div className="space-y-2">
                                  <p className="font-medium text-green-600">Preventive Maintenance</p>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Schedule regular inspections</li>
                                    <li>Check HVAC systems monthly</li>
                                    <li>Test safety equipment quarterly</li>
                                    <li>Update maintenance logs</li>
                                    <li>Report equipment status</li>
                                  </ul>
                                </div>
                              )}
                              
                              {!sop.title.includes('Emergency') && !sop.title.includes('Work Order') && !sop.title.includes('Preventive') && (
                                <div className="space-y-2">
                                  <p className="font-medium">{sop.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    This document contains detailed procedures and guidelines for {title.toLowerCase()} operations.
                                    Follow all safety protocols and report any issues to management.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => window.open(sop.sop_url, '_blank')}
                              className="flex-1"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Full Document
                            </Button>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Tasks</span>
                <Badge variant="outline">{mockTasks.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">In Progress</span>
                <Badge variant="outline">
                  {mockTasks.filter(t => t.status === 'in-progress').length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Due Soon</span>
                <Badge variant="outline">
                  {mockTasks.filter(t => t.status === 'due-soon').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskList;