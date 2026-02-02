import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isYesterday } from 'date-fns';
import { User, MessageSquare } from 'lucide-react';
import type { DMConversation } from './types';

interface DMConversationListProps {
  conversations: DMConversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (conversation: DMConversation) => void;
}

export function DMConversationList({
  conversations,
  loading,
  selectedId,
  onSelect,
}: DMConversationListProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMM d');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Connect with people to start messaging
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-accent ${
              selectedId === conv.id ? 'bg-accent' : ''
            }`}
          >
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {conv.other_user?.full_name ? (
                  getInitials(conv.other_user.full_name)
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-medium truncate ${conv.unread_count ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {conv.other_user?.full_name || conv.other_user?.email || 'Unknown User'}
                </span>
                {conv.last_message && (
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {formatTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-0.5">
                <p className={`text-sm truncate ${conv.unread_count ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {conv.last_message?.message_type === 'image' && '📷 Photo'}
                  {conv.last_message?.message_type === 'video' && '🎥 Video'}
                  {conv.last_message?.message_type === 'audio' && '🎵 Audio'}
                  {conv.last_message?.message_type === 'voice_memo' && '🎤 Voice memo'}
                  {conv.last_message?.message_type === 'file' && '📎 File'}
                  {(conv.last_message?.message_type === 'text' || conv.last_message?.message_type === 'link') && 
                    conv.last_message?.message}
                  {!conv.last_message && 'No messages yet'}
                </p>
                
                {(conv.unread_count || 0) > 0 && (
                  <Badge variant="default" className="ml-2 shrink-0 h-5 min-w-[20px] px-1.5">
                    {conv.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
