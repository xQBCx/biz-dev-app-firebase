import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Hexagon, Plus, User, Globe, Award } from 'lucide-react';

interface GlyphClaim {
  id: string;
  canonical_text: string;
  display_text: string;
  image_svg_url: string | null;
  status: string;
  created_at: string;
  owner_user_id: string | null;
}

const ClaimsLibrary = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myClaims, setMyClaims] = useState<GlyphClaim[]>([]);
  const [publicClaims, setPublicClaims] = useState<GlyphClaim[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-claims');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (!user) {
        setActiveTab('public');
      }
    });
  }, []);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      
      // Fetch user's claims
      if (currentUser) {
        const { data: myData } = await supabase
          .from('glyph_claims')
          .select('id, canonical_text, display_text, image_svg_url, status, created_at, owner_user_id')
          .eq('owner_user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        setMyClaims(myData || []);
      }

      // Fetch public claims (all claims for now - can filter later)
      const { data: publicData } = await supabase
        .from('glyph_claims')
        .select('id, canonical_text, display_text, image_svg_url, status, created_at, owner_user_id')
        .order('created_at', { ascending: false })
        .limit(50);
      
      setPublicClaims(publicData || []);
      setLoading(false);
    };

    fetchClaims();
  }, [currentUser]);

  const filterClaims = (claims: GlyphClaim[]) => {
    if (!searchQuery.trim()) return claims;
    const query = searchQuery.toLowerCase();
    return claims.filter(c => 
      c.canonical_text.toLowerCase().includes(query) ||
      c.display_text.toLowerCase().includes(query)
    );
  };

  const GlyphCard = ({ claim }: { claim: GlyphClaim }) => (
    <Link to={`/glyph/${claim.id}`}>
      <Card className="group overflow-hidden hover:border-primary/50 transition-all cursor-pointer">
        <div className="aspect-square bg-white flex items-center justify-center p-4">
          {claim.image_svg_url ? (
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ 
                __html: atob(claim.image_svg_url.replace('data:image/svg+xml;base64,', '')) 
              }}
            />
          ) : (
            <Hexagon className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        <div className="p-3 border-t border-border">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {claim.display_text}
          </p>
          <div className="flex items-center justify-between mt-1">
            <Badge variant="outline" className="text-xs">
              {claim.status}
            </Badge>
            {claim.owner_user_id === currentUser?.id && (
              <User className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );

  const EmptyState = ({ message, showCreate }: { message: string; showCreate?: boolean }) => (
    <div className="text-center py-12">
      <Hexagon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">{message}</p>
      {showCreate && (
        <Button onClick={() => navigate('/')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Glyph
        </Button>
      )}
    </div>
  );

  const LoadingGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container px-6 py-8 pt-20 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-display font-bold">My Claims</h1>
          </div>
          <Button onClick={() => navigate('/qbc')}>
            <Plus className="w-4 h-4 mr-2" />
            New Glyph
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search glyphs by text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {currentUser && (
              <TabsTrigger value="my-claims" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                My Claims
              </TabsTrigger>
            )}
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Public Library
            </TabsTrigger>
          </TabsList>

          {currentUser && (
            <TabsContent value="my-claims">
              {loading ? (
                <LoadingGrid />
              ) : filterClaims(myClaims).length === 0 ? (
                <EmptyState 
                  message={searchQuery ? "No glyphs match your search" : "You haven't claimed any glyphs yet"}
                  showCreate={!searchQuery}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filterClaims(myClaims).map((claim) => (
                    <GlyphCard key={claim.id} claim={claim} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="public">
            {loading ? (
              <LoadingGrid />
            ) : filterClaims(publicClaims).length === 0 ? (
              <EmptyState message={searchQuery ? "No glyphs match your search" : "No public glyphs yet"} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filterClaims(publicClaims).map((claim) => (
                  <GlyphCard key={claim.id} claim={claim} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClaimsLibrary;
