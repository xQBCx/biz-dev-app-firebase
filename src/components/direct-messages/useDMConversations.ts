import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { DMConversation, DMMessage, DMUser } from './types';

export function useDMConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get all accepted connections for the current user
      const { data: connectionsData, error: connError } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (connError) throw connError;

      if (!connectionsData || connectionsData.length === 0) {
        setConversations([]);
        return;
      }

      // Get other user IDs
      const otherUserIds = connectionsData.map(c => 
        c.requester_id === user.id ? c.receiver_id : c.requester_id
      );

      // Fetch profiles for all other users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', otherUserIds);

      if (profilesError) throw profilesError;

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );

      // Get last message for each connection
      const connectionIds = connectionsData.map(c => c.id);
      const { data: messagesData } = await supabase
        .from('connection_messages')
        .select('*')
        .in('connection_id', connectionIds)
        .order('created_at', { ascending: false });

      // Group messages by connection and get last message + unread count
      const lastMessages = new Map<string, DMMessage>();
      const unreadCounts = new Map<string, number>();

      (messagesData || []).forEach(msg => {
        if (!lastMessages.has(msg.connection_id)) {
          lastMessages.set(msg.connection_id, msg as DMMessage);
        }
        if (!msg.read && msg.sender_id !== user.id) {
          unreadCounts.set(msg.connection_id, (unreadCounts.get(msg.connection_id) || 0) + 1);
        }
      });

      // Build conversation list
      const conversationsWithDetails: DMConversation[] = connectionsData.map(conn => {
        const otherUserId = conn.requester_id === user.id ? conn.receiver_id : conn.requester_id;
        const profile = profilesMap.get(otherUserId);
        
        return {
          ...conn,
        other_user: profile ? {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: null, // Profile doesn't have avatar_url
            email: profile.email || undefined,
          } : undefined,
          last_message: lastMessages.get(conn.id),
          unread_count: unreadCounts.get(conn.id) || 0,
        };
      });

      // Sort by last message time or connection time
      conversationsWithDetails.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.updated_at;
        const bTime = b.last_message?.created_at || b.updated_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setConversations(conversationsWithDetails);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dm-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connection_messages',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    conversations,
    loading,
    error,
    refresh: loadConversations,
  };
}
