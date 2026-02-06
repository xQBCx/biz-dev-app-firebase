import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send,
  Paperclip,
  Camera,
  Mic,
  MicOff,
  Video,
  Phone,
  Users,
  Hash,
  Volume2,
  Play,
  Pause
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_initials: string;
  message_type: 'text' | 'voice' | 'file' | 'image' | 'system';
  created_at: string;
  voice_duration?: number;
}

interface Channel {
  id: string;
  name: string;
  type: 'direct' | 'team' | 'custom';
  description?: string;
}

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onStartVoiceCall: () => void;
  onStartVideoCall: () => void;
}

export const ChatArea = ({ 
  channel, 
  messages, 
  onSendMessage, 
  onStartVoiceCall, 
  onStartVideoCall 
}: ChatAreaProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  const startVoiceMessage = () => {
    setIsRecording(true);
    // Implement voice recording logic
  };

  const stopVoiceMessage = () => {
    setIsRecording(false);
    // Implement voice message sending
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleVoicePlayback = (messageId: string) => {
    if (playingVoice === messageId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(messageId);
      // Implement voice playback
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-background flex items-center justify-between">
        <div className="flex items-center gap-3">
          {channel.type === 'direct' ? (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {channel.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Hash className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <h2 className="font-semibold">{channel.name}</h2>
            {channel.description && (
              <p className="text-sm text-muted-foreground">{channel.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onStartVoiceCall}>
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" onClick={onStartVideoCall}>
            <Video className="h-4 w-4 mr-1" />
            Meet
          </Button>
          <Button size="sm" variant="outline">
            <Users className="h-4 w-4 mr-1" />
            Members
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3 animate-fade-in">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {message.sender_initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{message.sender_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                
                {message.message_type === 'voice' ? (
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg max-w-xs hover-scale transition-all">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={() => toggleVoicePlayback(message.id)}
                    >
                      {playingVoice === message.id ? 
                        <Pause className="h-4 w-4 text-primary" /> : 
                        <Play className="h-4 w-4 text-primary" />
                      }
                    </Button>
                    <div className="flex-1">
                      <div className="w-full bg-primary/20 rounded-full h-2 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: playingVoice === message.id ? '100%' : '0%' }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          Voice Message
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.voice_duration}s
                        </span>
                      </div>
                    </div>
                    <Volume2 className="h-4 w-4 text-primary" />
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm m-0 p-3 bg-muted/30 rounded-lg border border-border/50">
                      {message.content}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Textarea
              placeholder={`Message ${channel.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-[40px] max-h-[120px] resize-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={isRecording ? "destructive" : "outline"}
              onMouseDown={startVoiceMessage}
              onMouseUp={stopVoiceMessage}
              onMouseLeave={stopVoiceMessage}
              className={isRecording ? "animate-pulse" : ""}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};