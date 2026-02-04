import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Heart, Download, Eye, BookOpen } from 'lucide-react';
import { Glyph2DRenderer } from '@/components/qbc/Glyph2DRenderer';
import { useLattices } from '@/hooks/useLattices';
import type { EncodedPath, GlyphStyle, GlyphOrientation, LatticeAnchors2D } from '@/lib/qbc/types';

interface GlyphRecord {
  id: string;
  text: string;
  lattice_id: string;
  path_json: unknown;
  style_json: unknown;
  orientation_json: unknown;
  visibility: string;
  tags: string[] | null;
  likes_count: number;
  created_at: string;
  owner_user_id: string | null;
}

export default function QBCLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const { lattices } = useLattices();
  
  const defaultLattice = lattices?.find(l => l.is_default);
  const anchors = (defaultLattice?.anchors_json as LatticeAnchors2D) || {};

  const { data: publicGlyphs, isLoading: loadingPublic } = useQuery({
    queryKey: ['public-glyphs', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('glyphs')
        .select('*')
        .eq('visibility', 'public')
        .order('likes_count', { ascending: false })
        .limit(50);
      
      if (searchQuery) {
        query = query.ilike('text', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GlyphRecord[];
    },
  });

  const { data: myGlyphs, isLoading: loadingMine } = useQuery({
    queryKey: ['my-glyphs', searchQuery],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      let query = supabase
        .from('glyphs')
        .select('*')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (searchQuery) {
        query = query.ilike('text', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as GlyphRecord[];
    },
  });

  const renderGlyphCard = (glyph: GlyphRecord) => {
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
      <Card key={glyph.id} className="group hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden border">
            <Glyph2DRenderer
              path={pathData}
              anchors={anchors}
              style={style}
              orientation={orientation}
              size={200}
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg truncate">{glyph.text}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{glyph.likes_count}</span>
            </div>
            {glyph.tags && glyph.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {glyph.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 pt-20">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Rosetta Library</h1>
          </div>
          <p className="text-muted-foreground">
            Explore the universal dictionary of QBC glyphs
          </p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search glyphs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="public">Public Library</TabsTrigger>
            <TabsTrigger value="mine">My Library</TabsTrigger>
          </TabsList>

          <TabsContent value="public">
            {loadingPublic ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading glyphs...
              </div>
            ) : publicGlyphs && publicGlyphs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {publicGlyphs.map(renderGlyphCard)}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No public glyphs found. Be the first to share one!
              </div>
            )}
          </TabsContent>

          <TabsContent value="mine">
            {loadingMine ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading your glyphs...
              </div>
            ) : myGlyphs && myGlyphs.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {myGlyphs.map(renderGlyphCard)}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                You haven't saved any glyphs yet. Create one in the simulator!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}