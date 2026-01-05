import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  Zap, 
  TrendingUp,
  Users,
  Bot,
  Calendar,
  DollarSign,
  Target,
  Settings,
  Filter,
  MoreVertical,
  ExternalLink,
  Archive,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'insight' | 'alert' | 'recommendation' | 'action_required' | 'achievement';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  source: string;
  sourceType: 'agent' | 'system' | 'workflow' | 'ai';
  actionType?: string;
  actionPayload?: Record<string, unknown>;
  actionLabel?: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  expiresAt?: Date;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'action_required',
    priority: 'critical',
    title: 'Deal Approval Needed',
    message: 'TechCorp Partnership deal requires your approval before EOD. Revenue at stake: $150,000.',
    source: 'Deal Room Agent',
    sourceType: 'agent',
    actionType: 'navigate',
    actionPayload: { route: '/deal-room' },
    actionLabel: 'Review Deal',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    dismissed: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8),
  },
  {
    id: '2',
    type: 'insight',
    priority: 'high',
    title: 'Revenue Opportunity Detected',
    message: 'AI analysis identified 3 dormant leads with high conversion probability. Combined potential: $45,000.',
    source: 'CRM Intelligence Agent',
    sourceType: 'ai',
    actionType: 'navigate',
    actionPayload: { route: '/crm' },
    actionLabel: 'View Leads',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: false,
    dismissed: false,
  },
  {
    id: '3',
    type: 'alert',
    priority: 'high',
    title: 'Workflow Execution Failed',
    message: 'Lead Nurturing Sequence failed after 3 retries. 12 contacts affected.',
    source: 'Workflow Engine',
    sourceType: 'workflow',
    actionType: 'navigate',
    actionPayload: { route: '/workflow-builder' },
    actionLabel: 'Fix Workflow',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    read: true,
    dismissed: false,
  },
  {
    id: '4',
    type: 'recommendation',
    priority: 'medium',
    title: 'Optimize Your Schedule',
    message: 'Based on your energy patterns, moving deep work to 9-11 AM could increase productivity by 23%.',
    source: 'Schedule Intelligence',
    sourceType: 'ai',
    actionType: 'accept',
    actionLabel: 'Apply Suggestion',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: true,
    dismissed: false,
  },
  {
    id: '5',
    type: 'achievement',
    priority: 'low',
    title: 'Milestone Reached!',
    message: 'You\'ve earned 500 Action Credits this week - top 10% of users!',
    source: 'Credit System',
    sourceType: 'system',
    actionType: 'navigate',
    actionPayload: { route: '/credits' },
    actionLabel: 'View Credits',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    read: true,
    dismissed: false,
  },
  {
    id: '6',
    type: 'action_required',
    priority: 'medium',
    title: 'Formulation Review Pending',
    message: '2 partners are waiting for your approval on the Q1 Attribution Formula.',
    source: 'Chemical Blender',
    sourceType: 'system',
    actionType: 'navigate',
    actionPayload: { route: '/deal-room' },
    actionLabel: 'Review Formula',
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    read: false,
    dismissed: false,
  },
  {
    id: '7',
    type: 'insight',
    priority: 'medium',
    title: 'Agent Performance Insight',
    message: 'Sales Outreach Agent has improved success rate by 15% after learning from recent interactions.',
    source: 'Agent Analytics',
    sourceType: 'agent',
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    read: true,
    dismissed: false,
  },
  {
    id: '8',
    type: 'alert',
    priority: 'low',
    title: 'Low Credit Balance',
    message: 'Compute credits running low. Consider upgrading or optimizing agent usage.',
    source: 'Credit System',
    sourceType: 'system',
    actionType: 'navigate',
    actionPayload: { route: '/credit-allocation' },
    actionLabel: 'Manage Credits',
    timestamp: new Date(Date.now() - 1000 * 60 * 360),
    read: true,
    dismissed: false,
  },
];

const priorityConfig = {
  critical: { color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle, label: 'Critical' },
  high: { color: 'bg-orange-500 text-white', icon: Zap, label: 'High' },
  medium: { color: 'bg-primary text-primary-foreground', icon: Bell, label: 'Medium' },
  low: { color: 'bg-muted text-muted-foreground', icon: Clock, label: 'Low' },
};

const typeConfig = {
  insight: { icon: TrendingUp, color: 'text-blue-500' },
  alert: { icon: AlertTriangle, color: 'text-destructive' },
  recommendation: { icon: Target, color: 'text-green-500' },
  action_required: { icon: BellRing, color: 'text-orange-500' },
  achievement: { icon: Zap, color: 'text-yellow-500' },
};

const sourceTypeConfig = {
  agent: { icon: Bot, label: 'Agent' },
  system: { icon: Settings, label: 'System' },
  workflow: { icon: Zap, label: 'Workflow' },
  ai: { icon: TrendingUp, label: 'AI' },
};

const ProactiveNotificationsCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;
  const actionRequiredCount = notifications.filter(n => n.type === 'action_required' && !n.dismissed).length;

  const filteredNotifications = notifications.filter(n => {
    if (n.dismissed) return false;
    if (activeTab === 'unread' && n.read) return false;
    if (activeTab === 'actions' && n.type !== 'action_required') return false;
    if (activeTab === 'insights' && n.type !== 'insight' && n.type !== 'recommendation') return false;
    if (priorityFilter && n.priority !== priorityFilter) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    // In real implementation, handle navigation or action execution
    console.log('Action triggered:', notification.actionType, notification.actionPayload);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getExpiryWarning = (notification: Notification) => {
    if (!notification.expiresAt) return null;
    const now = new Date();
    const diff = notification.expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 0) return 'Expired';
    if (hours < 2) return `Expires in ${hours}h`;
    return null;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                {actionRequiredCount > 0 && ` • ${actionRequiredCount} actions required`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {priorityFilter ? priorityConfig[priorityFilter as keyof typeof priorityConfig].label : 'All Priorities'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPriorityFilter(null)}>
                  All Priorities
                </DropdownMenuItem>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <DropdownMenuItem key={key} onClick={() => setPriorityFilter(key)}>
                    <config.icon className="h-4 w-4 mr-2" />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.priority === 'critical' && !n.dismissed).length}
                </p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BellRing className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{actionRequiredCount}</p>
                <p className="text-xs text-muted-foreground">Actions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'insight' && !n.dismissed).length}
                </p>
                <p className="text-xs text-muted-foreground">Insights</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-xs text-muted-foreground">Unread</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Unread
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <ScrollArea className="h-[600px]">
                <CardContent className="p-4 space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications to show</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const TypeIcon = typeConfig[notification.type].icon;
                      const SourceIcon = sourceTypeConfig[notification.sourceType].icon;
                      const expiryWarning = getExpiryWarning(notification);

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border transition-all ${
                            !notification.read 
                              ? 'bg-accent/50 border-primary/20' 
                              : 'bg-card hover:bg-accent/30'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${
                              notification.priority === 'critical' ? 'bg-destructive/10' :
                              notification.priority === 'high' ? 'bg-orange-500/10' :
                              'bg-muted'
                            }`}>
                              <TypeIcon className={`h-5 w-5 ${typeConfig[notification.type].color}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{notification.title}</h3>
                                {!notification.read && (
                                  <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                )}
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${priorityConfig[notification.priority].color}`}
                                >
                                  {priorityConfig[notification.priority].label}
                                </Badge>
                                {expiryWarning && (
                                  <Badge variant="destructive" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {expiryWarning}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <SourceIcon className="h-3 w-3" />
                                    {notification.source}
                                  </span>
                                  <span>{formatTimestamp(notification.timestamp)}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {notification.actionLabel && (
                                    <Button 
                                      size="sm" 
                                      variant={notification.priority === 'critical' ? 'default' : 'outline'}
                                      onClick={() => handleAction(notification)}
                                    >
                                      {notification.actionLabel}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {!notification.read && (
                                        <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                          <Check className="h-4 w-4 mr-2" />
                                          Mark as Read
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={() => dismissNotification(notification.id)}>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Dismiss
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Link */}
        <div className="flex justify-center">
          <Button variant="link" className="text-muted-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Configure Notification Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProactiveNotificationsCenter;
