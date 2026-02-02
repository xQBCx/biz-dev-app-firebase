import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { DMMessage, DMAttachment } from './types';

export function useDMMessages(connectionId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!connectionId || !user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: msgError } = await supabase
        .from('connection_messages')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      // Load attachments for messages that have them
      const messagesWithAttachments = await Promise.all(
        (data || []).map(async (msg) => {
          if (msg.message_type !== 'text' && msg.message_type !== 'link') {
            const { data: attachments } = await supabase
              .from('dm_attachments')
              .select('*')
              .eq('message_id', msg.id);

            // Get signed URLs for attachments
            const attachmentsWithUrls = await Promise.all(
              (attachments || []).map(async (att) => {
                const { data: urlData } = await supabase.storage
                  .from('dm-attachments')
                  .createSignedUrl(att.storage_path, 3600);

                return {
                  ...att,
                  url: urlData?.signedUrl,
                } as DMAttachment;
              })
            );

            return { ...msg, attachments: attachmentsWithUrls } as DMMessage;
          }
          return msg as DMMessage;
        })
      );

      setMessages(messagesWithAttachments);

      // Mark messages as read
      const unreadIds = (data || [])
        .filter(m => !m.read && m.sender_id !== user.id)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('connection_messages')
          .update({ read: true })
          .in('id', unreadIds);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [connectionId, user?.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Subscribe to realtime updates for this conversation
  useEffect(() => {
    if (!connectionId || !user) return;

    const channel = supabase
      .channel(`dm-messages-${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connection_messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        async (payload) => {
          const newMsg = payload.new as DMMessage;
          
          // Mark as read if we're viewing the conversation
          if (newMsg.sender_id !== user.id) {
            await supabase
              .from('connection_messages')
              .update({ read: true })
              .eq('id', newMsg.id);
          }

          setMessages(prev => [...prev, { ...newMsg, read: true }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId, user?.id]);

  const sendMessage = async (
    content: string,
    messageType: DMMessage['message_type'] = 'text',
    metadata: Record<string, any> = {},
    attachmentFile?: File
  ) => {
    if (!connectionId || !user || (!content.trim() && !attachmentFile)) return;

    try {
      setSending(true);
      setError(null);

      // Insert the message
      const { data: msgData, error: msgError } = await supabase
        .from('connection_messages')
        .insert({
          connection_id: connectionId,
          sender_id: user.id,
          message: content || attachmentFile?.name || '',
          message_type: messageType,
          metadata,
          read: false,
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Upload attachment if provided
      if (attachmentFile && msgData) {
        const fileExt = attachmentFile.name.split('.').pop();
        const filePath = `${user.id}/${msgData.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('dm-attachments')
          .upload(filePath, attachmentFile);

        if (uploadError) throw uploadError;

        // Create attachment record
        await supabase
          .from('dm_attachments')
          .insert({
            message_id: msgData.id,
            filename: attachmentFile.name,
            mime_type: attachmentFile.type,
            size_bytes: attachmentFile.size,
            storage_path: filePath,
          });
      }

      // Refresh to get the complete message with attachments
      await loadMessages();
    } catch (err: any) {
      setError(err.message);
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    refresh: loadMessages,
  };
}
