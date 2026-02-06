import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Megaphone, Plus, Search, Calendar, Users, Pin, Edit, Trash2, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  targetAudience: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  readBy: string[];
  category: string;
}

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    targetAudience: [],
    priority: 'medium' as const,
    isPinned: false,
    category: 'general',
    expiresAt: ''
  });

  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'New Housekeeping Procedures Effective Immediately',
      content: 'All housekeeping staff must now follow the updated sanitization checklist for guest rooms. Please review the new SOP document in your training materials.',
      authorId: 'gv',
      authorName: 'Gabriela Valle',
      authorInitials: 'GV',
      targetAudience: ['housekeeping', 'housekeeping-manager'],
      priority: 'high',
      isPinned: true,
      isActive: true,
      createdAt: '2024-01-15T09:00:00Z',
      expiresAt: '2024-02-15T09:00:00Z',
      readBy: ['dc', 'lp', 'ms'],
      category: 'procedures'
    },
    {
      id: '2',
      title: 'Staff Appreciation Event - January 25th',
      content: 'Join us for our monthly staff appreciation lunch in the break room at 1:00 PM. Pizza and refreshments will be provided. Thank you for your hard work!',
      authorId: 'jl',
      authorName: 'Jason Lopez',
      authorInitials: 'JL',
      targetAudience: ['all'],
      priority: 'medium',
      isPinned: false,
      isActive: true,
      createdAt: '2024-01-14T14:30:00Z',
      readBy: ['cl', 'kk', 'dc', 'gv'],
      category: 'events'
    },
    {
      id: '3',
      title: 'Maintenance Window - Sunday 2AM-6AM',
      content: 'System maintenance will occur this Sunday from 2AM to 6AM. The property management system may be unavailable during this time. Please plan accordingly.',
      authorId: 'bm',
      authorName: 'Brandon McGee',
      authorInitials: 'BM',
      targetAudience: ['front-desk', 'management'],
      priority: 'medium',
      isPinned: false,
      isActive: true,
      createdAt: '2024-01-13T16:45:00Z',
      readBy: ['cl', 'kk', 'jl'],
      category: 'maintenance'
    },
    {
      id: '4',
      title: 'New Employee Orientation - January 20th',
      content: 'We have three new team members starting next week. Their orientation is scheduled for January 20th at 9:00 AM in the conference room.',
      authorId: 'tz',
      authorName: 'Tiara Zimmerman',
      authorInitials: 'TZ',
      targetAudience: ['management'],
      priority: 'low',
      isPinned: false,
      isActive: true,
      createdAt: '2024-01-12T11:20:00Z',
      readBy: ['jl', 'gv'],
      category: 'hr'
    },
    {
      id: '5',
      title: 'URGENT: Emergency Contact Information Update',
      content: 'All staff must update their emergency contact information by end of business Friday. Please see HR to complete the required forms.',
      authorId: 'bp',
      authorName: 'Brittany Patel',
      authorInitials: 'BP',
      targetAudience: ['all'],
      priority: 'urgent',
      isPinned: true,
      isActive: true,
      createdAt: '2024-01-11T08:00:00Z',
      expiresAt: '2024-01-19T17:00:00Z',
      readBy: ['cl', 'kk'],
      category: 'hr'
    }
  ];

  const categories = ['general', 'procedures', 'events', 'maintenance', 'hr', 'safety'];
  const audiences = ['all', 'front-desk', 'housekeeping', 'housekeeping-manager', 'maintenance', 'management'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'procedures': return 'bg-purple-100 text-purple-800';
      case 'events': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'safety': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || announcement.category === selectedCategory;
    return matchesSearch && matchesCategory && announcement.isActive;
  });

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(a => !a.isPinned);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateAnnouncement = () => {
    // Here you would typically save to database
    console.log('Creating announcement:', newAnnouncement);
    setShowCreateForm(false);
    setNewAnnouncement({
      title: '',
      content: '',
      targetAudience: [],
      priority: 'medium',
      isPinned: false,
      category: 'general',
      expiresAt: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Announcements</h2>
          <p className="text-muted-foreground">Share important updates and information with your team</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{announcements.filter(a => a.isActive).length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pin className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{announcements.filter(a => a.isPinned).length}</p>
                <p className="text-xs text-muted-foreground">Pinned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{announcements.filter(a => a.priority === 'urgent').length}</p>
                <p className="text-xs text-muted-foreground">Urgent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(announcements.reduce((sum, a) => sum + a.readBy.length, 0) / announcements.length)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Read Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newAnnouncement.category} onValueChange={(value) => setNewAnnouncement({...newAnnouncement, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                placeholder="Announcement content"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={newAnnouncement.priority} onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, priority: value})}>
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
                <label className="text-sm font-medium">Expires At</label>
                <Input
                  type="datetime-local"
                  value={newAnnouncement.expiresAt}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, expiresAt: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newAnnouncement.isPinned}
                  onCheckedChange={(checked) => setNewAnnouncement({...newAnnouncement, isPinned: checked})}
                />
                <label className="text-sm font-medium">Pin announcement</label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement}>
                <Send className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pin className="w-5 h-5 text-red-500" />
            Pinned Announcements
          </h3>
          <div className="space-y-3">
            {pinnedAnnouncements.map((announcement) => (
              <Card key={announcement.id} className={`border-l-4 ${getPriorityColor(announcement.priority)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{announcement.title}</h4>
                        <Badge className={getCategoryColor(announcement.category)}>
                          {announcement.category}
                        </Badge>
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{announcement.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {announcement.authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          {announcement.authorName}
                        </div>
                        <span>{formatDate(announcement.createdAt)}</span>
                        <span>{announcement.readBy.length} read</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Announcements</h3>
        <div className="space-y-3">
          {regularAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <Badge className={getCategoryColor(announcement.category)}>
                        {announcement.category}
                      </Badge>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {announcement.authorInitials}
                          </AvatarFallback>
                        </Avatar>
                        {announcement.authorName}
                      </div>
                      <span>{formatDate(announcement.createdAt)}</span>
                      <span>{announcement.readBy.length} read</span>
                      {announcement.expiresAt && (
                        <span>Expires: {formatDate(announcement.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No announcements found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default Announcements;