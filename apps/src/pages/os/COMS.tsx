import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChannelList } from '@/components/coms/ChannelList';
import { ChatArea } from '@/components/coms/ChatArea';

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

const COMS = () => {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);
      setupRealtimeSubscription(selectedChannel.id);
    }
  }, [selectedChannel]);

  const fetchChannels = async () => {
    try {
      // Mock channels for demo - replace with real Supabase query
      const mockChannels: Channel[] = [
        {
          id: '1',
          name: '# General',
          type: 'team',
          description: 'Team-wide communications',
          unreadCount: 3,
          lastMessage: 'Good morning team!',
          lastMessageTime: '9:30 AM'
        },
        {
          id: '2',
          name: '# Front Desk',
          type: 'team',
          description: 'Front desk operations',
          unreadCount: 0,
          lastMessage: 'Guest in 205 needs extra towels',
          lastMessageTime: '8:45 AM'
        },
        {
          id: '3',
          name: '# Housekeeping',
          type: 'team',
          description: 'Housekeeping coordination',
          unreadCount: 1,
          lastMessage: 'Room 304 ready for inspection',
          lastMessageTime: '10:15 AM'
        },
        {
          id: '4',
          name: '# Maintenance',
          type: 'team',
          description: 'Maintenance requests and updates',
          unreadCount: 2,
          lastMessage: 'AC unit fixed in 201',
          lastMessageTime: 'Yesterday'
        },
        {
          id: '5',
          name: 'Sarah Johnson',
          type: 'direct',
          unreadCount: 0,
          lastMessage: 'Thanks for the update!',
          lastMessageTime: '2:30 PM',
          isOnline: true
        }
      ];
      setChannels(mockChannels);
      if (mockChannels.length > 0) {
        setSelectedChannel(mockChannels[0]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      // Mock messages for demo - replace with real Supabase query
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Good morning everyone! Ready for another great day!',
          sender_id: '1',
          sender_name: 'Mike Rodriguez',
          sender_initials: 'MR',
          message_type: 'text',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          content: 'Coffee station has been restocked. Fresh brew available!',
          sender_id: '2',
          sender_name: 'Sarah Johnson',
          sender_initials: 'SJ',
          message_type: 'text',
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '3',
          content: 'Voice message about front desk procedures',
          sender_id: '3',
          sender_name: 'Alex Chen',
          sender_initials: 'AC',
          message_type: 'voice',
          voice_duration: 45,
          created_at: new Date(Date.now() - 900000).toISOString()
        },
        {
          id: '4',
          content: 'Team meeting at 2 PM in conference room B. See you there!',
          sender_id: '1',
          sender_name: 'Mike Rodriguez',
          sender_initials: 'MR',
          message_type: 'text',
          created_at: new Date(Date.now() - 300000).toISOString()
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeSubscription = (channelId: string) => {
    // Set up Supabase realtime subscription for messages
    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coms_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          console.log('New message:', payload);
          // Add new message to state
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !selectedChannel) return;

    try {
      // Mock sending message - replace with real Supabase insert
      const mockMessage: Message = {
        id: Date.now().toString(),
        content: content,
        sender_id: profile?.user_id || 'current-user',
        sender_name: profile?.full_name || 'You',
        sender_initials: profile?.initials || 'Y',
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, mockMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartVoiceCall = () => {
    console.log('Starting voice call...');
    // Implement voice call logic
  };

  const handleStartVideoCall = () => {
    console.log('Starting video call...');
    // Implement video call logic
  };

  return (
    <div className="h-full flex bg-background">
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {selectedChannel ? (
        <ChatArea
          channel={selectedChannel}
          messages={messages}
          onSendMessage={handleSendMessage}
          onStartVoiceCall={handleStartVoiceCall}
          onStartVideoCall={handleStartVideoCall}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to SmartLink COMS</h3>
            <p className="text-muted-foreground">
              Select a channel to start communicating with your team
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default COMS;