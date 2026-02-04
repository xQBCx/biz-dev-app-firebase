import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Share2, Tag, Clock, User, Hash, Hexagon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface GlyphClaim {
  id: string;
  canonical_text: string;
  display_text: string;
  lattice_id: string;
  lattice_version: number;
  orientation_json: any;
  style_json: any;
  path_json: any;
  image_svg_url: string | null;
  image_png_url: string | null;
  owner_user_id: string | null;
  status: string;
  content_hash: string;
  created_at: string;
  lattices?: {
    name: string;
  };
}

const GlyphDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<GlyphClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchClaim = async () => {
      const { data, error } = await supabase
        .from('glyph_claims')
        .select(`
          *,
          lattices (name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching claim:', error);
        toast.error('Failed to load glyph');
      } else if (!data) {
        toast.error('Glyph not found');
        navigate('/qbc/library');
      } else {
        setClaim(data);
      }
      setLoading(false);
    };

    fetchClaim();
  }, [id, navigate]);

  const handleDownloadSvg = () => {
    if (!claim?.image_svg_url) return;
    
    // Decode base64 SVG
    const svgData = claim.image_svg_url.replace('data:image/svg+xml;base64,', '');
    const svgContent = atob(svgData);
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qbc-${claim.canonical_text.toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!claim) return;
    
    const glyphPackage = {
      version: '1.0',
      metadata: {
        text: claim.canonical_text,
        displayText: claim.display_text,
        latticeId: claim.lattice_id,
        latticeVersion: claim.lattice_version,
        orientation: claim.orientation_json,
        style: claim.style_json,
        contentHash: claim.content_hash,
        createdAt: claim.created_at,
      },
      path: claim.path_json,
    };
    
    const blob = new Blob([JSON.stringify(glyphPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qbc-${claim.canonical_text.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const isOwner = currentUser && claim?.owner_user_id === currentUser.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container px-6 py-8 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <Hexagon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Glyph Not Found</h2>
          <p className="text-muted-foreground mb-4">This glyph doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/qbc/library')}>
            Browse Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container px-6 py-8 max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview */}
          <Card className="aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center p-8">
            {claim.image_svg_url ? (
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ 
                  __html: atob(claim.image_svg_url.replace('data:image/svg+xml;base64,', '')) 
                }}
              />
            ) : (
              <Hexagon className="w-24 h-24 text-muted-foreground" />
            )}
          </Card>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={claim.status === 'claimed' ? 'default' : 'secondary'}>
                  {claim.status}
                </Badge>
                {isOwner && (
                  <Badge variant="outline">You own this</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {claim.display_text}
              </h1>
              {claim.canonical_text !== claim.display_text && (
                <p className="text-muted-foreground text-sm mt-1">
                  Canonical: {claim.canonical_text}
                </p>
              )}
            </div>

            {/* Metadata */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Lattice:</span>
                <span className="font-medium">{claim.lattices?.name || 'Unknown'}</span>
                <Badge variant="outline" className="ml-auto">v{claim.lattice_version}</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {format(new Date(claim.created_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              
              <div className="flex items-start gap-2 text-sm">
                <Hash className="w-4 h-4 text-primary mt-0.5" />
                <span className="text-muted-foreground">Hash:</span>
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                  {claim.content_hash.substring(0, 16)}...{claim.content_hash.substring(claim.content_hash.length - 8)}
                </code>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={handleDownloadSvg} disabled={!claim.image_svg_url}>
                  <Download className="w-4 h-4 mr-1" />
                  SVG
                </Button>
                <Button variant="outline" onClick={handleDownloadJson}>
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>

              {isOwner && (
                <div className="pt-4 border-t border-border space-y-2">
                  <Button className="w-full" variant="secondary" disabled>
                    <Tag className="w-4 h-4 mr-2" />
                    List for Sale (Coming Soon)
                  </Button>
                  <Button className="w-full" variant="outline" disabled>
                    Mint NFT (Phase 2)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlyphDetail;
