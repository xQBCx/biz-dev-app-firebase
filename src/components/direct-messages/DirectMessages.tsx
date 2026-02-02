import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Search, User, MessageSquare, Users } from 'lucide-react';
import { DMConversationList } from './DMConversationList';
import { DMChatThread } from './DMChatThread';
import { DMMessageInput } from './DMMessageInput';
import { useDMConversations } from './useDMConversations';
import { useDMMessages } from './useDMMessages';
import type { DMConversation } from './types';

export function DirectMessages() {
  const { conversations, loading: loadingConversations } = useDMConversations();
  const [selectedConversation, setSelectedConversation] = useState<DMConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    messages, 
    loading: loadingMessages, 
    sending, 
    sendMessage 
  } = useDMMessages(selectedConversation?.id || null);

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.other_user?.full_name?.toLowerCase() || '';
    const email = conv.other_user?.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Mobile view: show either list or chat
  const showChat = !!selectedConversation;

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <Card className="h-full">
        <div className="flex h-full">
          {/* Conversation List - hidden on mobile when chat is open */}
          <div className={`w-full md:w-80 border-r flex flex-col ${showChat ? 'hidden md:flex' : 'flex'}`}>
            <CardHeader className="border-b py-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                {conversations.some(c => (c.unread_count || 0) > 0) && (
                  <span className="text-sm text-muted-foreground">
                    {conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)} unread
                  </span>
                )}
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            
            <DMConversationList
              conversations={filteredConversations}
              loading={loadingConversations}
              selectedId={selectedConversation?.id || null}
              onSelect={setSelectedConversation}
            />
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!showChat ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b p-4 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedConversation.other_user?.full_name ? (
                        getInitials(selectedConversation.other_user.full_name)
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {selectedConversation.other_user?.full_name || 
                       selectedConversation.other_user?.email || 
                       'Unknown User'}
                    </h3>
                    {selectedConversation.other_user?.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedConversation.other_user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <DMChatThread
                  messages={messages}
                  loading={loadingMessages}
                  otherUser={selectedConversation.other_user}
                />

                {/* Message Input */}
                <DMMessageInput
                  onSend={sendMessage}
                  sending={sending}
                  disabled={loadingMessages}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">Your Messages</h3>
                <p className="text-muted-foreground mt-1 max-w-sm">
                  Select a conversation from the list to start messaging, or connect with new people to chat.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
