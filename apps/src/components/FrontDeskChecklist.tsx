import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Clock, User, CheckCircle2, Circle, Users, Calendar, MessageSquare, AlertTriangle, Phone, Shield, Flame, Droplets, Zap } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  assignedTo?: string;
  assignedInitials?: string;
  timeCompleted?: string;
  isCustom?: boolean;
}

interface ShiftChecklist {
  shift: string;
  timeRange: string;
  tasks: ChecklistItem[];
}

interface ShiftMessage {
  id: string;
  fromShift: string;
  toShift: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  author: string;
}

interface QuickMessage {
  id: string;
  recipient: 'staff' | 'leadership' | 'all';
  message: string;
  timestamp: string;
  author: string;
}

interface EmergencyProcedure {
  id: string;
  type: 'fire' | 'flood' | 'power_outage' | 'medical' | 'security' | 'other';
  title: string;
  steps: string[];
  contacts: { name: string; number: string }[];
}

const FrontDeskChecklist = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeShift, setActiveShift] = useState('morning');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedShift, setSelectedShift] = useState('morning');
  
  // Communication states
  const [isShiftMessageOpen, setIsShiftMessageOpen] = useState(false);
  const [isQuickMessageOpen, setIsQuickMessageOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [newShiftMessage, setNewShiftMessage] = useState('');
  const [newQuickMessage, setNewQuickMessage] = useState('');
  const [selectedToShift, setSelectedToShift] = useState('evening');
  const [selectedRecipient, setSelectedRecipient] = useState('staff');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [activeTab, setActiveTab] = useState('checklist');

  // Mock team members data
  const teamMembers = [
    { id: 'cl', name: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk' },
    { id: 'kk', name: 'Kira King', initials: 'KK', role: 'Front Desk' },
    { id: 'eh', name: 'Eileen Hatrick', initials: 'EH', role: 'Front Desk' },
    { id: 'mw', name: 'Malakye Wilson', initials: 'MW', role: 'Front Desk' },
  ];

  // Communication data
  const [shiftMessages, setShiftMessages] = useState<ShiftMessage[]>([]);
  const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);
  
  const emergencyProcedures: EmergencyProcedure[] = [
    {
      id: 'fire',
      type: 'fire',
      title: 'Fire Emergency',
      steps: [
        'Call 911 immediately',
        'Activate fire alarm if not already active',
        'Evacuate all guests and staff via nearest exit',
        'Meet at designated assembly point',
        'Take guest registration list',
        'Do NOT use elevators',
        'Account for all guests and staff'
      ],
      contacts: [
        { name: 'Fire Department', number: '911' },
        { name: 'Property Manager', number: '(555) 123-4567' },
        { name: 'Regional Manager', number: '(555) 987-6543' }
      ]
    },
    {
      id: 'flood',
      type: 'flood',
      title: 'Flood/Water Emergency',
      steps: [
        'Turn off main water supply if safe to do so',
        'Move guests from affected areas',
        'Call maintenance immediately',
        'Document damage with photos',
        'Place wet floor signs',
        'Contact insurance if major damage',
        'Relocate affected guests'
      ],
      contacts: [
        { name: 'Emergency Maintenance', number: '(555) 111-2222' },
        { name: 'Property Manager', number: '(555) 123-4567' },
        { name: 'Insurance Hotline', number: '(555) 444-5555' }
      ]
    },
    {
      id: 'power_outage',
      type: 'power_outage',
      title: 'Power Outage',
      steps: [
        'Check if outage is building-wide or area-wide',
        'Activate emergency lighting',
        'Secure all electronic systems',
        'Contact utility company',
        'Use battery-powered radio for updates',
        'Check generator if available',
        'Keep guests informed'
      ],
      contacts: [
        { name: 'Utility Company', number: '(555) 333-4444' },
        { name: 'Maintenance', number: '(555) 111-2222' },
        { name: 'Property Manager', number: '(555) 123-4567' }
      ]
    }
  ];

  const [shifts, setShifts] = useState<ShiftChecklist[]>([
    {
      shift: 'morning',
      timeRange: '7AM-3PM',
      tasks: [
        { id: 'm1', task: 'Count Down Drawers', completed: false },
        { id: 'm2', task: 'Pull Departing Guests\' Registration from Bucket/Confirm Stayovers', completed: false },
        { id: 'm3', task: 'Stock Pantry', completed: false },
        { id: 'm4', task: 'Check the Pool PH levels/Uncover Hot Tub', completed: false },
        { id: 'm5', task: 'Ensure all Doors were Opened/Guests Checked Out in Synxis', completed: false },
        { id: 'm6', task: 'Preauthorizations', completed: false },
        { id: 'm7', task: 'Brew Coffee at 12PM', completed: false },
        { id: 'm8', task: 'Clean Guest Bathrooms', completed: false },
        { id: 'm9', task: 'Wipe Down Lobby Tables', completed: false },
      ]
    },
    {
      shift: 'evening',
      timeRange: '1PM-9PM',
      tasks: [
        { id: 'e1', task: 'Count Down Drawers', completed: false },
        { id: 'e2', task: 'Check Clean Rooms', completed: false },
        { id: 'e3', task: 'Stock Pool Towels', completed: false },
        { id: 'e4', task: 'Clean Pool Windows', completed: false },
        { id: 'e5', task: 'Wipe Down Lobby Tables', completed: false },
        { id: 'e6', task: 'Fold Towels (if needed)', completed: false },
        { id: 'e7', task: 'Brew Coffee at 4PM', completed: false },
        { id: 'e8', task: 'Check Café Cleanliness/Stock', completed: false },
        { id: 'e9', task: 'File All Housekeepers\' Paperwork', completed: false },
        { id: 'e10', task: 'Clean Guest Bathrooms', completed: false },
        { id: 'e11', task: 'Vacuum Lobby', completed: false },
        { id: 'e12', task: 'Vacuum Luggage Carts', completed: false },
        { id: 'e13', task: 'Complete Communication in Notebook for Overnight', completed: false },
      ]
    },
    {
      shift: 'overnight',
      timeRange: '9PM-7AM',
      tasks: [
        { id: 'o1', task: 'Count down drawers', completed: false },
        { id: 'o2', task: 'Read Communications Notebook for Daily Notes', completed: false },
        { id: 'o3', task: 'Cover Hot Tub/Close Pool', completed: false },
        { id: 'o4', task: 'Ensure All Doors are Locked', completed: false },
        { id: 'o5', task: 'Launder Pool Towels', completed: false },
        { id: 'o6', task: 'Fold Towels Left for Overnight', completed: false },
        { id: 'o7', task: 'Check/Clean Guest Bathrooms', completed: false },
        { id: 'o8', task: 'Run Audit', completed: false },
        { id: 'o9', task: 'Clean Kitchen/Breakfast Area', completed: false },
        { id: 'o10', task: 'Set Out Prep for Breakfast', completed: false },
        { id: 'o11', task: 'Brew Coffee at 3AM', completed: false },
        { id: 'o12', task: 'Tidy up Lobby', completed: false },
        { id: 'o13', task: 'Checkins and Checkouts', completed: false },
        { id: 'o14', task: 'Count Down Drawers/Drop in Needed', completed: false },
      ]
    }
  ]);

  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem(`frontdesk-checklist-${currentDate}`);
    if (savedData) {
      setShifts(JSON.parse(savedData));
    }
  }, [currentDate]);

  const saveToLocalStorage = (updatedShifts: ShiftChecklist[]) => {
    localStorage.setItem(`frontdesk-checklist-${currentDate}`, JSON.stringify(updatedShifts));
  };

  const addShiftMessage = () => {
    if (!newShiftMessage.trim()) return;

    const message: ShiftMessage = {
      id: `msg-${Date.now()}`,
      fromShift: activeShift,
      toShift: selectedToShift,
      message: newShiftMessage,
      priority: selectedPriority as 'low' | 'medium' | 'high' | 'urgent',
      timestamp: new Date().toLocaleString(),
      read: false,
      author: 'Current User' // In real app, get from auth
    };

    const updatedMessages = [...shiftMessages, message];
    setShiftMessages(updatedMessages);
    localStorage.setItem(`shift-messages-${currentDate}`, JSON.stringify(updatedMessages));
    
    setNewShiftMessage('');
    setIsShiftMessageOpen(false);
  };

  const addQuickMessage = () => {
    if (!newQuickMessage.trim()) return;

    const message: QuickMessage = {
      id: `quick-${Date.now()}`,
      recipient: selectedRecipient as 'staff' | 'leadership' | 'all',
      message: newQuickMessage,
      timestamp: new Date().toLocaleString(),
      author: 'Current User'
    };

    const updatedMessages = [...quickMessages, message];
    setQuickMessages(updatedMessages);
    localStorage.setItem(`quick-messages-${currentDate}`, JSON.stringify(updatedMessages));
    
    setNewQuickMessage('');
    setIsQuickMessageOpen(false);
  };

  const markMessageAsRead = (messageId: string) => {
    const updatedMessages = shiftMessages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    setShiftMessages(updatedMessages);
    localStorage.setItem(`shift-messages-${currentDate}`, JSON.stringify(updatedMessages));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  useEffect(() => {
    // Load messages from localStorage
    const savedShiftMessages = localStorage.getItem(`shift-messages-${currentDate}`);
    const savedQuickMessages = localStorage.getItem(`quick-messages-${currentDate}`);
    
    if (savedShiftMessages) {
      setShiftMessages(JSON.parse(savedShiftMessages));
    }
    if (savedQuickMessages) {
      setQuickMessages(JSON.parse(savedQuickMessages));
    }
  }, [currentDate]);

  const toggleTaskCompletion = (shiftIndex: number, taskId: string) => {
    const updatedShifts = [...shifts];
    const taskIndex = updatedShifts[shiftIndex].tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      const task = updatedShifts[shiftIndex].tasks[taskIndex];
      task.completed = !task.completed;
      task.timeCompleted = task.completed ? new Date().toLocaleTimeString() : undefined;
      
      setShifts(updatedShifts);
      saveToLocalStorage(updatedShifts);
    }
  };

  const assignTask = (shiftIndex: number, taskId: string, assigneeId: string) => {
    const assignee = teamMembers.find(member => member.id === assigneeId);
    if (!assignee) return;

    const updatedShifts = [...shifts];
    const taskIndex = updatedShifts[shiftIndex].tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      updatedShifts[shiftIndex].tasks[taskIndex].assignedTo = assignee.name;
      updatedShifts[shiftIndex].tasks[taskIndex].assignedInitials = assignee.initials;
      
      setShifts(updatedShifts);
      saveToLocalStorage(updatedShifts);
    }
  };

  const addCustomTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: ChecklistItem = {
      id: `custom-${Date.now()}`,
      task: newTaskTitle,
      completed: false,
      isCustom: true,
    };

    if (selectedAssignee) {
      const assignee = teamMembers.find(member => member.id === selectedAssignee);
      if (assignee) {
        newTask.assignedTo = assignee.name;
        newTask.assignedInitials = assignee.initials;
      }
    }

    const updatedShifts = [...shifts];
    const shiftIndex = shifts.findIndex(shift => shift.shift === selectedShift);
    
    if (shiftIndex !== -1) {
      updatedShifts[shiftIndex].tasks.push(newTask);
      setShifts(updatedShifts);
      saveToLocalStorage(updatedShifts);
    }

    setNewTaskTitle('');
    setSelectedAssignee('');
    setIsAddTaskOpen(false);
  };

  const removeCustomTask = (shiftIndex: number, taskId: string) => {
    const updatedShifts = [...shifts];
    updatedShifts[shiftIndex].tasks = updatedShifts[shiftIndex].tasks.filter(
      task => task.id !== taskId
    );
    setShifts(updatedShifts);
    saveToLocalStorage(updatedShifts);
  };

  const getShiftProgress = (shift: ShiftChecklist) => {
    const completed = shift.tasks.filter(task => task.completed).length;
    const total = shift.tasks.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getCurrentShift = () => {
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 7 && hours < 15) return 'morning';
    if (hours >= 13 && hours < 21) return 'evening';
    return 'overnight';
  };

  useEffect(() => {
    setActiveShift(getCurrentShift());
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Front Desk Operations</h1>
            <p className="text-muted-foreground">Daily tasks, communication & emergency procedures</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-auto"
            />
          </div>
          
          <Button 
            variant="destructive" 
            onClick={() => setIsEmergencyOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency
          </Button>
          
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Task</DialogTitle>
                <DialogDescription>
                  Add a new task to any shift for today
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Description</Label>
                  <Input
                    id="task-title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task description..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="shift-select">Shift</Label>
                  <Select value={selectedShift} onValueChange={setSelectedShift}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (7AM-3PM)</SelectItem>
                      <SelectItem value="evening">Evening (1PM-9PM)</SelectItem>
                      <SelectItem value="overnight">Overnight (9PM-7AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="assignee-select">Assign To (Optional)</Label>
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.initials})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addCustomTask} className="flex-1">
                    Add Task
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist">Daily Tasks</TabsTrigger>
          <TabsTrigger value="shift-communication">Shift Communication</TabsTrigger>
          <TabsTrigger value="quick-messages">Quick Messages</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Procedures</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-6">
          {/* Shift Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {shifts.map((shift, index) => {
              const progress = getShiftProgress(shift);
              const isCurrentShift = shift.shift === getCurrentShift();
              
              // Professional color scheme for shifts
              const shiftColors = {
                morning: 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/50',
                evening: 'border-amber-200 bg-amber-50/30 hover:bg-amber-50/50', 
                overnight: 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50'
              };
              
              const activeColors = {
                morning: 'ring-2 ring-blue-300 border-blue-300 bg-blue-50',
                evening: 'ring-2 ring-amber-300 border-amber-300 bg-amber-50',
                overnight: 'ring-2 ring-indigo-300 border-indigo-300 bg-indigo-50'
              };
              
              return (
                <Card 
                  key={shift.shift} 
                  className={`cursor-pointer transition-all ${
                    activeShift === shift.shift 
                      ? activeColors[shift.shift as keyof typeof activeColors]
                      : shiftColors[shift.shift as keyof typeof shiftColors]
                  }`}
                  onClick={() => setActiveShift(shift.shift)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${
                          shift.shift === 'morning' ? 'text-blue-600' :
                          shift.shift === 'evening' ? 'text-amber-600' : 'text-indigo-600'
                        }`} />
                        <span className="font-medium capitalize">{shift.shift}</span>
                        {isCurrentShift && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                            Current
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={`${
                        progress.percentage === 100 ? 'bg-green-50 text-green-700 border-green-200' :
                        progress.percentage >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {progress.percentage}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{shift.timeRange}</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          shift.shift === 'morning' ? 'bg-blue-500' :
                          shift.shift === 'evening' ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {progress.completed} of {progress.total} tasks completed
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

          {/* Active Shift Tasks */}
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="capitalize">
                {activeShift} Shift Checklist
              </CardTitle>
              <CardDescription>
                {shifts.find(s => s.shift === activeShift)?.timeRange}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {getShiftProgress(shifts.find(s => s.shift === activeShift) || shifts[0]).completed} / {getShiftProgress(shifts.find(s => s.shift === activeShift) || shifts[0]).total} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shifts.find(s => s.shift === activeShift)?.tasks.map((task, taskIndex) => {
              const shiftIndex = shifts.findIndex(s => s.shift === activeShift);
              
              return (
                <div 
                  key={task.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      task.completed 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-background hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(shiftIndex, task.id)}
                    className="flex-shrink-0"
                  />
                  
                  <div className="flex-1">
                    <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.task}
                    </span>
                    {task.timeCompleted && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Completed at {task.timeCompleted}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {task.assignedInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignedTo}</span>
                      </div>
                    ) : (
                      <Select onValueChange={(value) => assignTask(shiftIndex, task.id, value)}>
                        <SelectTrigger className="w-auto h-8 text-xs">
                          <User className="h-3 w-3 mr-1" />
                          <SelectValue placeholder="Assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.initials} - {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {task.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomTask(shiftIndex, task.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="shift-communication" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Message */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Send Shift Message
                </CardTitle>
                <CardDescription>
                  Communicate important information to other shifts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>To Shift</Label>
                  <Select value={selectedToShift} onValueChange={setSelectedToShift}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (7AM-3PM)</SelectItem>
                      <SelectItem value="evening">Evening (1PM-9PM)</SelectItem>
                      <SelectItem value="overnight">Overnight (9PM-7AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={newShiftMessage}
                    onChange={(e) => setNewShiftMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                  />
                </div>
                <Button onClick={addShiftMessage} className="w-full">
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Messages List */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="text-slate-700">Recent Messages</CardTitle>
                <CardDescription>
                  Messages for your shift
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {shiftMessages
                    .filter(msg => msg.toShift === activeShift || msg.fromShift === activeShift)
                    .map((message) => (
                    <div 
                      key={message.id}
                      className={`p-3 rounded-lg border transition-all ${
                        !message.read && message.toShift === activeShift 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'bg-background border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`font-medium ${getPriorityColor(message.priority)} ${
                            message.priority === 'urgent' ? 'bg-red-50 border-red-200' :
                            message.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                            message.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-slate-50 border-slate-200'
                          }`}>
                            {message.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {message.fromShift} → {message.toShift}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      {!message.read && message.toShift === activeShift && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markMessageAsRead(message.id)}
                          className="mt-2"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  ))}
                  {shiftMessages.filter(msg => msg.toShift === activeShift || msg.fromShift === activeShift).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quick-messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Quick Message */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  Quick Message
                </CardTitle>
                <CardDescription>
                  Send quick updates to staff or leadership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Send To</Label>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">All Staff</SelectItem>
                      <SelectItem value="leadership">Leadership Team</SelectItem>
                      <SelectItem value="all">Everyone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={newQuickMessage}
                    onChange={(e) => setNewQuickMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                  />
                </div>
                <Button onClick={addQuickMessage} className="w-full">
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Quick Messages List */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="text-slate-700">Recent Quick Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {quickMessages.map((message) => (
                    <div key={message.id} className="p-3 rounded-lg border bg-background shadow-sm border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className={`${
                          message.recipient === 'leadership' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          message.recipient === 'staff' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          To {message.recipient}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        From: {message.author}
                      </p>
                    </div>
                  ))}
                  {quickMessages.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No quick messages yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {emergencyProcedures.map((procedure) => (
              <Card key={procedure.id} className="border-red-200 shadow-lg bg-gradient-to-b from-red-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    {procedure.type === 'fire' && <Flame className="h-5 w-5" />}
                    {procedure.type === 'flood' && <Droplets className="h-5 w-5" />}
                    {procedure.type === 'power_outage' && <Zap className="h-5 w-5" />}
                    {procedure.type === 'medical' && <Shield className="h-5 w-5" />}
                    {procedure.type === 'security' && <Shield className="h-5 w-5" />}
                    {procedure.type === 'other' && <AlertTriangle className="h-5 w-5" />}
                    {procedure.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Steps to Follow:</h4>
                      <ol className="space-y-1">
                        {procedure.steps.map((step, index) => (
                          <li key={index} className="text-sm flex gap-2">
                            <span className="font-medium text-red-600">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Emergency Contacts:</h4>
                      <div className="space-y-2">
                        {procedure.contacts.map((contact, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{contact.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`tel:${contact.number}`)}
                              className="h-6 px-2"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {contact.number}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Remember:</strong> In any life-threatening emergency, call 911 immediately. 
              These procedures are guidelines to follow after emergency services have been contacted.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Emergency Dialog */}
        <Dialog open={isEmergencyOpen} onOpenChange={setIsEmergencyOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                Emergency Procedures
              </DialogTitle>
              <DialogDescription>
                Quick access to emergency procedures and contacts
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyProcedures.map((procedure) => (
                <Card key={procedure.id} className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                      {procedure.type === 'fire' && <Flame className="h-5 w-5" />}
                      {procedure.type === 'flood' && <Droplets className="h-5 w-5" />}
                      {procedure.type === 'power_outage' && <Zap className="h-5 w-5" />}
                      {procedure.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Steps:</h4>
                      <ol className="space-y-1">
                        {procedure.steps.slice(0, 3).map((step, index) => (
                          <li key={index} className="text-sm flex gap-2">
                            <span className="font-medium text-red-600">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      {procedure.steps.length > 3 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          +{procedure.steps.length - 3} more steps...
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Contacts:</h4>
                      <div className="space-y-2">
                        {procedure.contacts.slice(0, 2).map((contact, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${contact.number}`)}
                            className="w-full justify-between"
                          >
                            <span>{contact.name}</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.number}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Alert className="border-red-200 bg-red-50 mt-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Emergency Priority:</strong> Life safety first, property second. 
                When in doubt, evacuate and call 911.
              </AlertDescription>
            </Alert>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
};

export default FrontDeskChecklist;