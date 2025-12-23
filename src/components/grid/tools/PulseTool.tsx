/**
 * Pulse: AI-Prioritized Email Communication
 * 
 * The heart of your communication. Learns which messages matter most,
 * auto-drafts responses in your voice, and surfaces action items.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Star, Archive, Trash2, Reply, Forward, MoreVertical,
  Sparkles, AlertCircle, Clock, CheckCircle2, Send, Paperclip,
  Filter, RefreshCw, Mail, Inbox, Send as SendIcon
} from 'lucide-react';
import { GridToolLayout } from '../GridToolLayout';
import { GRID_TOOLS } from '@/types/grid';

interface Email {
  id: string;
  from: { name: string; email: string };
  subject: string;
  preview: string;
  body: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  priority: 'high' | 'medium' | 'low';
  hasAction: boolean;
  actionType?: 'respond' | 'review' | 'decision';
}

// Mock data for demonstration
const MOCK_EMAILS: Email[] = [
  {
    id: '1',
    from: { name: 'Sarah Chen', email: 'sarah@acmecorp.com' },
    subject: 'Q4 Partnership Proposal - Action Required',
    preview: 'Hi Bill, Following up on our call yesterday about the partnership...',
    body: 'Hi Bill,\n\nFollowing up on our call yesterday about the partnership opportunity. I\'ve attached the updated proposal with the terms we discussed.\n\nCould you review and let me know your thoughts by Friday?\n\nBest,\nSarah',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    starred: true,
    priority: 'high',
    hasAction: true,
    actionType: 'respond',
  },
  {
    id: '2',
    from: { name: 'Michael Torres', email: 'mtorres@techventures.io' },
    subject: 'Investment Committee Update',
    preview: 'The committee has reviewed your application and...',
    body: 'The committee has reviewed your application and we\'d like to schedule a follow-up presentation...',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    read: false,
    starred: false,
    priority: 'high',
    hasAction: true,
    actionType: 'decision',
  },
  {
    id: '3',
    from: { name: 'Newsletter', email: 'digest@industryweekly.com' },
    subject: 'This Week in Tech: AI Trends & Market Analysis',
    preview: 'Your weekly roundup of technology news and insights...',
    body: 'Your weekly roundup of technology news and insights...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
    starred: false,
    priority: 'low',
    hasAction: false,
  },
];

export default function PulseTool() {
  const tool = GRID_TOOLS.pulse;
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [composing, setComposing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const getPriorityColor = (priority: Email['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-amber-500 bg-amber-500/10';
      case 'low': return 'text-muted-foreground bg-muted';
    }
  };

  const getActionIcon = (type?: Email['actionType']) => {
    switch (type) {
      case 'respond': return <Reply className="h-3.5 w-3.5" />;
      case 'review': return <Clock className="h-3.5 w-3.5" />;
      case 'decision': return <AlertCircle className="h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const generateAISuggestion = (email: Email) => {
    // Simulated AI response generation
    const suggestions: Record<string, string> = {
      'respond': `Hi Sarah,\n\nThank you for sending over the updated proposal. I've reviewed the terms and they look good overall.\n\nI have a few minor suggestions I'd like to discuss:\n1. The timeline on Phase 2 might need adjustment\n2. Could we clarify the exclusivity clause?\n\nHappy to jump on a quick call to finalize. Does tomorrow at 2pm work?\n\nBest,\nBill`,
      'decision': `Hi Michael,\n\nThank you for the positive update from the Investment Committee.\n\nI'd be delighted to schedule a follow-up presentation. I'm available:\n- Tuesday 3-5pm\n- Wednesday 10am-12pm\n- Thursday afternoon\n\nPlease let me know what works best for the committee.\n\nBest regards,\nBill`,
    };
    
    setAiSuggestion(suggestions[email.actionType || 'respond'] || 'AI suggestion will appear here...');
  };

  const highPriorityCount = emails.filter(e => e.priority === 'high' && !e.read).length;
  const actionRequiredCount = emails.filter(e => e.hasAction && !e.read).length;

  return (
    <GridToolLayout 
      tool={tool}
      actions={
        <>
          <Button variant="default" size="sm" onClick={() => setComposing(true)}>
            <Mail className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </>
      }
      sidebar={
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Priority Inbox</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  High Priority
                </span>
                <Badge variant="secondary">{highPriorityCount}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  Action Required
                </span>
                <Badge variant="secondary">{actionRequiredCount}</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Based on your patterns, Sarah Chen's emails typically require quick responses. 
                Average response time: 2.3 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
        {/* Email List */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0">
            <Tabs defaultValue="priority" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b px-4">
                <TabsTrigger value="priority" className="gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Priority
                </TabsTrigger>
                <TabsTrigger value="inbox">
                  <Inbox className="h-3.5 w-3.5 mr-1.5" />
                  Inbox
                </TabsTrigger>
                <TabsTrigger value="sent">
                  <SendIcon className="h-3.5 w-3.5 mr-1.5" />
                  Sent
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="priority" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {emails
                      .sort((a, b) => {
                        const priorityOrder = { high: 0, medium: 1, low: 2 };
                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                      })
                      .map(email => (
                        <div
                          key={email.id}
                          className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedEmail?.id === email.id ? 'bg-muted' : ''
                          } ${!email.read ? 'bg-primary/5' : ''}`}
                          onClick={() => {
                            setSelectedEmail(email);
                            if (!email.read) {
                              setEmails(prev => prev.map(e => 
                                e.id === email.id ? { ...e, read: true } : e
                              ));
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs">
                                {email.from.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={`font-medium text-sm truncate ${!email.read ? 'font-semibold' : ''}`}>
                                  {email.from.name}
                                </span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {email.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <p className={`text-sm truncate ${!email.read ? 'font-medium' : 'text-muted-foreground'}`}>
                                {email.subject}
                              </p>
                              
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {email.preview}
                              </p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={`text-xs ${getPriorityColor(email.priority)}`}>
                                  {email.priority}
                                </Badge>
                                {email.hasAction && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    {getActionIcon(email.actionType)}
                                    {email.actionType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {email.starred && (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="inbox" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 text-center text-muted-foreground">
                    All inbox emails will appear here
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="sent" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 text-center text-muted-foreground">
                    Sent emails will appear here
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Email Detail / Compose */}
        <Card className="flex flex-col">
          {composing ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">New Message</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setComposing(false)}>
                    Cancel
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-4 gap-4">
                <Input placeholder="To" />
                <Input placeholder="Subject" />
                <Textarea placeholder="Write your message..." className="flex-1 min-h-[200px]" />
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Draft
                    </Button>
                    <Button size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : selectedEmail ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedEmail.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      From: {selectedEmail.from.name} &lt;{selectedEmail.from.email}&gt;
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Star className={`h-4 w-4 ${selectedEmail.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col pt-4 overflow-hidden">
                <ScrollArea className="flex-1">
                  <div className="whitespace-pre-wrap text-sm">
                    {selectedEmail.body}
                  </div>
                </ScrollArea>
                
                {selectedEmail.hasAction && (
                  <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">AI-Suggested Response</span>
                    </div>
                    
                    {aiSuggestion ? (
                      <div className="space-y-3">
                        <Textarea 
                          value={aiSuggestion} 
                          onChange={e => setAiSuggestion(e.target.value)}
                          className="min-h-[150px] text-sm"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setAiSuggestion(null)}>
                            Discard
                          </Button>
                          <Button size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Send Response
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateAISuggestion(selectedEmail)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Response
                      </Button>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select an email to read</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </GridToolLayout>
  );
}
