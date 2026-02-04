/**
 * Sphere: Relationship Intelligence
 * 
 * Not just who you know, but how you know them, when to reach out,
 * and what matters to each connection.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Plus, Users, UserPlus, TrendingUp, TrendingDown, Minus,
  Mail, Phone, Calendar, Sparkles, MessageCircle, Building, Clock,
  Star, MoreVertical, ArrowRight, AlertCircle
} from 'lucide-react';
import { GridToolLayout } from '../GridToolLayout';
import { GRID_TOOLS } from '@/types/grid';

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  avatar?: string;
  relationshipScore: number; // 0-100
  relationshipTrend: 'up' | 'down' | 'stable';
  lastContact: Date;
  nextAction?: string;
  tags: string[];
  touchpoints: number;
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@acmecorp.com',
    company: 'Acme Corp',
    role: 'VP of Partnerships',
    relationshipScore: 85,
    relationshipTrend: 'up',
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    nextAction: 'Review partnership proposal',
    tags: ['Partner', 'High Value', 'Active Deal'],
    touchpoints: 24,
  },
  {
    id: '2',
    name: 'Michael Torres',
    email: 'mtorres@techventures.io',
    company: 'Tech Ventures',
    role: 'Investment Director',
    relationshipScore: 72,
    relationshipTrend: 'up',
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    nextAction: 'Schedule presentation',
    tags: ['Investor', 'Series A'],
    touchpoints: 12,
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'emily@globalsupply.com',
    company: 'Global Supply Co',
    role: 'Procurement Manager',
    relationshipScore: 45,
    relationshipTrend: 'down',
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    nextAction: 'Re-engage with update',
    tags: ['Customer', 'At Risk'],
    touchpoints: 8,
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'dkim@startupinc.co',
    company: 'Startup Inc',
    role: 'CEO',
    relationshipScore: 60,
    relationshipTrend: 'stable',
    lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    tags: ['Prospect', 'Warm Lead'],
    touchpoints: 5,
  },
];

export default function SphereTool() {
  const tool = GRID_TOOLS.sphere;
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const atRiskContacts = contacts.filter(c => c.relationshipTrend === 'down' || c.relationshipScore < 50);
  const strongRelationships = contacts.filter(c => c.relationshipScore >= 80);

  const getTrendIcon = (trend: Contact['relationshipTrend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getDaysSince = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <GridToolLayout 
      tool={tool}
      actions={
        <Button variant="default" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      }
      sidebar={
        <div className="space-y-4">
          {/* Relationship Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                Network Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Strong Relationships</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  {strongRelationships.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                  Needs Attention
                </span>
                <Badge variant="secondary" className="bg-red-500/10 text-red-500">
                  {atRiskContacts.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Outreach Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {atRiskContacts.slice(0, 2).map(contact => (
                <div key={contact.id} className="p-2 rounded bg-muted/50">
                  <p className="text-xs font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Last contact: {getDaysSince(contact.lastContact)}
                  </p>
                  <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-xs">
                    Send Check-in
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts List */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0">
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b px-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="strong">Strong</TabsTrigger>
                <TabsTrigger value="atrisk" className="gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  At Risk
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {filteredContacts.map(contact => (
                      <div
                        key={contact.id}
                        className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedContact?.id === contact.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback>
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{contact.name}</span>
                              <div className="flex items-center gap-1">
                                <span className={`text-sm font-medium ${getScoreColor(contact.relationshipScore)}`}>
                                  {contact.relationshipScore}
                                </span>
                                {getTrendIcon(contact.relationshipTrend)}
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              {contact.role} at {contact.company}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {getDaysSince(contact.lastContact)}
                              </Badge>
                              {contact.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="strong" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {strongRelationships.map(contact => (
                      <div
                        key={contact.id}
                        className="p-4 cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.company}</p>
                          </div>
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="atrisk" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {atRiskContacts.map(contact => (
                      <div
                        key={contact.id}
                        className="p-4 cursor-pointer hover:bg-muted/50 border-l-2 border-red-500"
                        onClick={() => setSelectedContact(contact)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-red-500">{getDaysSince(contact.lastContact)}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Reach Out
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Contact Detail */}
        <Card className="h-[600px] flex flex-col">
          {selectedContact ? (
            <>
              <CardHeader className="pb-4 border-b">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">
                      {selectedContact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <CardTitle className="text-xl">{selectedContact.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building className="h-3.5 w-3.5" />
                      {selectedContact.role} at {selectedContact.company}
                    </CardDescription>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pt-4 overflow-auto">
                <div className="space-y-6">
                  {/* Relationship Score */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Relationship Strength</span>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold ${getScoreColor(selectedContact.relationshipScore)}`}>
                          {selectedContact.relationshipScore}%
                        </span>
                        {getTrendIcon(selectedContact.relationshipTrend)}
                      </div>
                    </div>
                    <Progress value={selectedContact.relationshipScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {selectedContact.touchpoints} interactions over time
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedContact.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Next Action */}
                  {selectedContact.nextAction && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">Suggested Next Action</span>
                      </div>
                      <p className="text-sm">{selectedContact.nextAction}</p>
                      <Button size="sm" className="mt-3">
                        Take Action
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <div className="p-1.5 rounded bg-blue-500/10">
                          <Mail className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <div>
                          <p>Email sent: "Q4 Partnership Proposal"</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <div className="p-1.5 rounded bg-green-500/10">
                          <Phone className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <div>
                          <p>Call completed: 32 minutes</p>
                          <p className="text-xs text-muted-foreground">5 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <div className="p-1.5 rounded bg-purple-500/10">
                          <Calendar className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <div>
                          <p>Meeting: Partnership Discussion</p>
                          <p className="text-xs text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a contact to view details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </GridToolLayout>
  );
}
