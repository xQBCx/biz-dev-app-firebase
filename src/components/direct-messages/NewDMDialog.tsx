import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Search, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { DMConversation } from './types';

interface SearchResult {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface NewDMDialogProps {
  onConversationCreated: (conversation: DMConversation) => void;
}

export function NewDMDialog({ onConversationCreated }: NewDMDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || !user) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleSelectUser = async (selectedUser: SearchResult) => {
    if (!user || creating) return;

    setCreating(true);
    try {
      // Check if connection already exists
      const { data: existingConn } = await supabase
        .from('connections')
        .select('*')
        .or(
          `and(requester_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(requester_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
        )
        .maybeSingle();

      let connectionId: string;

      if (existingConn) {
        // If connection exists but not accepted, update it
        if (existingConn.status !== 'accepted') {
          await supabase
            .from('connections')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', existingConn.id);
        }
        connectionId = existingConn.id;
      } else {
        // Create new connection with accepted status
        const { data: newConn, error: connError } = await supabase
          .from('connections')
          .insert({
            requester_id: user.id,
            receiver_id: selectedUser.id,
            status: 'accepted',
          })
          .select()
          .single();

        if (connError) throw connError;
        connectionId = newConn.id;
      }

      // Create the conversation object
      const conversation: DMConversation = {
        id: connectionId,
        requester_id: user.id,
        receiver_id: selectedUser.id,
        status: 'accepted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        other_user: {
          id: selectedUser.id,
          full_name: selectedUser.full_name,
          avatar_url: null,
          email: selectedUser.email || undefined,
        },
        unread_count: 0,
      };

      onConversationCreated(conversation);
      setOpen(false);
      setSearchQuery('');
      setResults([]);
    } catch (err) {
      console.error('Error creating conversation:', err);
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" title="New Message">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectUser(result)}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {result.full_name ? getInitials(result.full_name) : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">
                      {result.full_name || 'Unknown User'}
                    </p>
                    {result.email && (
                      <p className="text-sm text-muted-foreground truncate">
                        {result.email}
                      </p>
                    )}
                  </div>
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                </button>
              ))
            ) : searchQuery.trim() ? (
              <p className="text-center text-muted-foreground py-8">
                No users found
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Start typing to search for users
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
