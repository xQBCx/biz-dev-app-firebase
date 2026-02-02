import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { 
  User, 
  Play, 
  Pause, 
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { DMMessage, DMUser } from './types';

interface DMChatThreadProps {
  messages: DMMessage[];
  loading: boolean;
  otherUser: DMUser | undefined;
}

export function DMChatThread({ messages, loading, otherUser }: DMChatThreadProps) {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), 'h:mm a');
  };

  const formatDateDivider = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const toggleAudio = (messageId: string, url: string) => {
    let audio = audioRefs.current.get(messageId);
    
    if (!audio) {
      audio = new Audio(url);
      audio.onended = () => setPlayingAudio(null);
      audioRefs.current.set(messageId, audio);
    }

    if (playingAudio === messageId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Pause any currently playing audio
      if (playingAudio) {
        const current = audioRefs.current.get(playingAudio);
        current?.pause();
      }
      audio.play();
      setPlayingAudio(messageId);
    }
  };

  const renderAttachment = (msg: DMMessage) => {
    const attachment = msg.attachments?.[0];
    if (!attachment?.url) return null;

    switch (msg.message_type) {
      case 'image':
        return (
          <div className="mt-2 rounded-lg overflow-hidden max-w-[300px]">
            <img
              src={attachment.url}
              alt={attachment.filename}
              className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(attachment.url, '_blank')}
            />
          </div>
        );

      case 'video':
        return (
          <div className="mt-2 rounded-lg overflow-hidden max-w-[300px]">
            <video
              src={attachment.url}
              controls
              className="w-full h-auto"
            />
          </div>
        );

      case 'voice_memo':
      case 'audio':
        return (
          <div className="mt-2 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              onClick={() => toggleAudio(msg.id, attachment.url!)}
            >
              {playingAudio === msg.id ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            <div className="flex-1">
              <div className="h-2 bg-primary/20 rounded-full">
                <div className="h-full w-0 bg-primary rounded-full" />
              </div>
              {attachment.duration_seconds && (
                <span className="text-xs text-muted-foreground mt-1">
                  {Math.floor(attachment.duration_seconds / 60)}:{(attachment.duration_seconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </div>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </div>
        );

      case 'file':
        return (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
          >
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.filename}</p>
              {attachment.size_bytes && (
                <p className="text-xs text-muted-foreground">
                  {(attachment.size_bytes / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </a>
        );

      default:
        return null;
    }
  };

  const renderLinkPreview = (msg: DMMessage) => {
    if (msg.message_type !== 'link') return null;
    const url = msg.metadata?.url || msg.message;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline"
      >
        <ExternalLink className="h-4 w-4" />
        {url}
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : ''}`}>
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <div className="space-y-2">
              <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} rounded-lg`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <Avatar className="h-16 w-16 mb-4">
          <AvatarFallback className="text-lg bg-primary/10 text-primary">
            {otherUser?.full_name ? getInitials(otherUser.full_name) : <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold">
          {otherUser?.full_name || otherUser?.email || 'Unknown User'}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Send a message to start the conversation
        </p>
      </div>
    );
  }

  // Group messages by date
  let lastDate: Date | null = null;

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="p-4 space-y-4">
        {messages.map((msg, idx) => {
          const msgDate = new Date(msg.created_at);
          const showDateDivider = !lastDate || !isSameDay(lastDate, msgDate);
          lastDate = msgDate;

          const isOwn = msg.sender_id === user?.id;

          return (
            <div key={msg.id}>
              {showDateDivider && (
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {formatDateDivider(msg.created_at)}
                  </span>
                </div>
              )}

              <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {otherUser?.full_name ? getInitials(otherUser.full_name) : <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    {msg.message_type === 'text' || msg.message_type === 'link' ? (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        {msg.message_type === 'image' && <ImageIcon className="h-4 w-4" />}
                        {msg.message_type === 'video' && <Video className="h-4 w-4" />}
                        {(msg.message_type === 'audio' || msg.message_type === 'voice_memo') && <Mic className="h-4 w-4" />}
                        {msg.message_type === 'file' && <FileText className="h-4 w-4" />}
                        <span>{msg.message}</span>
                      </div>
                    )}

                    {renderAttachment(msg)}
                    {renderLinkPreview(msg)}
                  </div>

                  <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(msg.created_at)}
                    </span>
                    {isOwn && (
                      msg.read ? (
                        <CheckCheck className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Check className="h-3 w-3 text-muted-foreground" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
