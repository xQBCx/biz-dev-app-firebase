import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Inbox, Eye, Check } from 'lucide-react';
import { Glyph2DRenderer } from '@/components/qbc/Glyph2DRenderer';
import { useLattices } from '@/hooks/useLattices';
import type { EncodedPath, GlyphStyle, GlyphOrientation, LatticeAnchors2D } from '@/lib/qbc/types';

interface GlyphMessage {
  id: string;
  glyph_id: string;
  from_user_id: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
  glyphs: {
    text: string;
    path_json: unknown;
    style_json: unknown;
    orientation_json: unknown;
  } | null;
}

export default function QBCInbox() {
  const queryClient = useQueryClient();
  const { lattices } = useLattices();
  const defaultLattice = lattices?.find(l => l.is_default);
  const anchors = (defaultLattice?.anchors_json as LatticeAnchors2D) || {};

  const { data: messages, isLoading } = useQuery({
    queryKey: ['glyph-messages'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('glyph_messages')
        .select('*, glyphs(text, path_json, style_json, orientation_json)')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GlyphMessage[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('glyph_messages')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['glyph-messages'] });
    },
  });

  const unreadCount = messages?.filter(m => !m.is_read).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 pt-20">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Inbox className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Received Glyphs</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Glyphs shared with you by other users
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading messages...
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((msg) => {
              const glyph = msg.glyphs;
              if (!glyph) return null;

              const pathData = glyph.path_json as EncodedPath;
              const defaultStyle: GlyphStyle = {
                strokeWidth: 2,
                strokeColor: '#000000',
                nodeSize: 6,
                nodeColor: '#000000',
                nodeFillColor: '#ffffff',
                showNodes: true,
                showGrid: false,
                showLabels: false,
                backgroundColor: '#ffffff',
                gridColor: '#e5e5e5',
              };
              const style = { ...defaultStyle, ...(glyph.style_json as Partial<GlyphStyle> || {}) };
              const orientation = (glyph.orientation_json || { rotation: 0, mirror: false }) as GlyphOrientation;

              return (
                <Card key={msg.id} className={msg.is_read ? 'opacity-75' : ''}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border shrink-0">
                      <Glyph2DRenderer
                        path={pathData}
                        anchors={anchors}
                        style={style}
                        orientation={orientation}
                        size={80}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {glyph.text}
                            {!msg.is_read && (
                              <Badge variant="secondary" className="ml-2">New</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Received {new Date(msg.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!msg.is_read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markReadMutation.mutate(msg.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      {msg.message && (
                        <p className="mt-2 text-muted-foreground">{msg.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No messages yet. When someone shares a glyph with you, it will appear here.
          </div>
        )}
      </main>
    </div>
  );
}