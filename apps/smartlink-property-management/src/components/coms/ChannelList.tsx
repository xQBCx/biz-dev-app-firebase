import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Users, 
  Video, 
  Phone,
  Search,
  Plus,
  Hash,
  Volume2,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'team' | 'custom';
  description?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  isOnline?: boolean;
}

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const ChannelList = ({ 
  channels, 
  selectedChannel, 
  onChannelSelect, 
  searchTerm, 
  onSearchChange 
}: ChannelListProps) => {
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-primary text-primary-foreground">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SmartLink COMS
        </h1>
        <p className="text-sm text-primary-foreground/80">Communication Hub</p>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Channels List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={`p-3 rounded-lg cursor-pointer transition-colors hover-scale ${
                selectedChannel?.id === channel.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {channel.type === 'direct' ? (
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {channel.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {channel.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{channel.name}</span>
                    {channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {channel.lastMessage && (
                    <div className="text-xs text-muted-foreground truncate">
                      {channel.lastMessage}
                    </div>
                  )}
                </div>
                {channel.lastMessageTime && (
                  <span className="text-xs text-muted-foreground">
                    {channel.lastMessageTime}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
          <Button size="sm" variant="outline">
            <Video className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};