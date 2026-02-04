import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Glyph2DRenderer } from '@/components/qbc/Glyph2DRenderer';
import { Sparkles, Gem, Shirt, Frame, Coffee, Send, Loader2, TrendingUp, ShoppingBag } from 'lucide-react';
import type { EncodedPath, GlyphStyle, GlyphOrientation, LatticeAnchors2D } from '@/lib/qbc/types';

interface GlyphClaim {
  id: string;
  display_text: string;
  path_json: EncodedPath;
  style_json: GlyphStyle;
  orientation_json: GlyphOrientation;
  lattice_id: string;
  lattices?: {
    anchors_json: LatticeAnchors2D;
  };
}

interface ProductCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  variants: { id: string; name: string }[];
}

const productCategories: ProductCategory[] = [
  {
    id: 'jewelry',
    name: 'Jewelry',
    icon: <Gem className="w-6 h-6" />,
    description: 'Pendants, rings, bracelets & earrings',
    variants: [
      { id: 'pendant', name: 'Pendant Necklace' },
      { id: 'ring', name: 'Engraved Ring' },
      { id: 'bracelet', name: 'Cuff Bracelet' },
      { id: 'earrings', name: 'Drop Earrings' },
    ]
  },
  {
    id: 'apparel',
    name: 'Apparel',
    icon: <Shirt className="w-6 h-6" />,
    description: 'T-shirts, embroidery, hoodies & caps',
    variants: [
      { id: 'tshirt', name: 'T-Shirt' },
      { id: 'embroidery', name: 'Embroidered Patch' },
      { id: 'hoodie', name: 'Hoodie' },
      { id: 'cap', name: 'Cap' },
    ]
  },
  {
    id: 'art_print',
    name: 'Art Prints',
    icon: <Frame className="w-6 h-6" />,
    description: 'Posters, canvas prints & framed art',
    variants: [
      { id: 'poster', name: 'Gallery Poster' },
      { id: 'canvas', name: 'Canvas Print' },
      { id: 'framed', name: 'Framed Print' },
    ]
  },
  {
    id: 'accessory',
    name: 'Accessories',
    icon: <Coffee className="w-6 h-6" />,
    description: 'Mugs, phone cases & tote bags',
    variants: [
      { id: 'mug', name: 'Ceramic Mug' },
      { id: 'phone_case', name: 'Phone Case' },
      { id: 'tote_bag', name: 'Tote Bag' },
    ]
  },
];

export default function QBCProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<GlyphClaim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<GlyphClaim | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Custom request form
  const [customIdea, setCustomIdea] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [submittingCustom, setSubmittingCustom] = useState(false);

  // Share info
  const [shareInfo, setShareInfo] = useState<{
    total_shares: number;
    available_percentage: number;
    shares_sold: number;
  } | null>(null);

  useEffect(() => {
    checkAuth();
    fetchShareInfo();
  }, []);

  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUser(session.user);
    setLoading(false);
  };

  const fetchClaims = async () => {
    const { data, error } = await supabase
      .from('glyph_claims')
      .select(`
        id,
        display_text,
        path_json,
        style_json,
        orientation_json,
        lattice_id,
        lattices (
          anchors_json
        )
      `)
      .eq('owner_user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
      return;
    }

    setClaims((data || []) as unknown as GlyphClaim[]);
  };

  const fetchShareInfo = async () => {
    const { data, error } = await supabase
      .from('share_info')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setShareInfo(data);
    }
  };

  const handleGenerateMockup = async () => {
    if (!selectedClaim || !selectedCategory || !selectedVariant) return;

    setGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-product-mockup', {
        body: {
          glyphSvgData: '', // We'll use the text description for now
          productType: selectedCategory.id,
          productVariant: selectedVariant,
          glyphText: selectedClaim.display_text
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Mockup Generated!",
          description: `Your ${selectedCategory.name.toLowerCase()} mockup is ready.`,
        });
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      console.error('Error generating mockup:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitCustomRequest = async () => {
    if (!customIdea.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your product idea.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingCustom(true);

    try {
      const { error } = await supabase.from('custom_product_requests').insert({
        user_id: user.id,
        glyph_claim_id: selectedClaim?.id || null,
        product_idea: customIdea.trim(),
        description: customDescription.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: "We'll review your custom product idea and get back to you.",
      });

      setCustomIdea('');
      setCustomDescription('');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmittingCustom(false);
    }
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(0)} trillion`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(0)} billion`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)} million`;
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Create Products</h1>
          </div>
          <p className="text-muted-foreground">Turn your glyphs into physical products</p>
        </div>
        {/* Share Information Banner */}
        {shareInfo && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Support the QBC Initiative</h3>
                  <p className="text-muted-foreground mb-4">
                    Every product purchase contributes to the development of quantum-inspired communication technology
                    and earns you a stake in the company.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="font-mono text-lg font-bold text-primary">
                        {formatLargeNumber(shareInfo.total_shares)}
                      </div>
                      <div className="text-muted-foreground">Total Shares</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="font-mono text-lg font-bold text-primary">
                        {shareInfo.available_percentage}%
                      </div>
                      <div className="text-muted-foreground">Available for Sale</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-3">
                      <div className="font-mono text-lg font-bold text-green-500">
                        {formatLargeNumber(shareInfo.total_shares * (shareInfo.available_percentage / 100) - shareInfo.shares_sold)}
                      </div>
                      <div className="text-muted-foreground">Shares Remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">Create Product</TabsTrigger>
            <TabsTrigger value="custom">Custom Request</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {/* Step 1: Select Glyph */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  Select Your Glyph
                </CardTitle>
                <CardDescription>Choose from your claimed glyphs</CardDescription>
              </CardHeader>
              <CardContent>
                {claims.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't claimed any glyphs yet.</p>
                    <Button onClick={() => navigate('/qbc')}>Create & Claim a Glyph</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {claims.map((claim) => (
                      <button
                        key={claim.id}
                        onClick={() => setSelectedClaim(claim)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedClaim?.id === claim.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="aspect-square mb-2">
                          <Glyph2DRenderer
                            path={claim.path_json}
                            anchors={claim.lattices?.anchors_json || { A: [0.5, 0.1] }}
                            style={claim.style_json}
                            orientation={claim.orientation_json}
                            size={120}
                          />
                        </div>
                        <p className="text-xs text-center font-medium truncate">
                          {claim.display_text}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Select Product Category */}
            {selectedClaim && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                    Choose Product Type
                  </CardTitle>
                  <CardDescription>Select a category for your product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {productCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSelectedVariant(null);
                          setGeneratedImage(null);
                        }}
                        className={`p-6 rounded-lg border-2 transition-all text-left ${
                          selectedCategory?.id === category.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="mb-3 text-primary">{category.icon}</div>
                        <h4 className="font-semibold mb-1">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Select Variant & Generate */}
            {selectedClaim && selectedCategory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                    Select Style & Generate
                  </CardTitle>
                  <CardDescription>Choose a specific product style</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant={selectedVariant === variant.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedVariant(variant.id);
                          setGeneratedImage(null);
                        }}
                      >
                        {variant.name}
                      </Button>
                    ))}
                  </div>

                  {selectedVariant && (
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <Button
                          onClick={handleGenerateMockup}
                          disabled={generating}
                          className="w-full"
                          size="lg"
                        >
                          {generating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Mockup...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate AI Mockup
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          AI will create a photorealistic visualization of your glyph on this product
                        </p>
                      </div>

                      {generatedImage && (
                        <div className="flex-1">
                          <div className="rounded-lg overflow-hidden border border-border">
                            <img
                              src={generatedImage}
                              alt="Generated product mockup"
                              className="w-full h-auto"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Generated mockup preview
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Custom Product Idea</CardTitle>
                <CardDescription>
                  Have a unique idea? Tell us what you'd like to see — wallpaper, car wraps, tattoo designs, and more!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {claims.length > 0 && (
                  <div className="space-y-2">
                    <Label>Link to a Glyph (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={!selectedClaim ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedClaim(null)}
                      >
                        No specific glyph
                      </Button>
                      {claims.slice(0, 5).map((claim) => (
                        <Button
                          key={claim.id}
                          variant={selectedClaim?.id === claim.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedClaim(claim)}
                        >
                          {claim.display_text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="customIdea">Product Idea *</Label>
                  <Input
                    id="customIdea"
                    placeholder="e.g., Wallpaper, Car wrap, Tattoo design, Coffee mug..."
                    value={customIdea}
                    onChange={(e) => setCustomIdea(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDescription">Description (Optional)</Label>
                  <Textarea
                    id="customDescription"
                    placeholder="Tell us more about your vision — colors, style, size, etc."
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSubmitCustomRequest}
                  disabled={submittingCustom || !customIdea.trim()}
                  className="w-full"
                >
                  {submittingCustom ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Example Ideas */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Custom Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { idea: 'Wallpaper', desc: 'Home or phone wallpaper' },
                    { idea: 'Car Wrap', desc: 'Vehicle graphics' },
                    { idea: 'Tattoo Design', desc: 'Body art template' },
                    { idea: 'Watch Face', desc: 'Smart watch display' },
                    { idea: 'Skateboard Deck', desc: 'Board graphics' },
                    { idea: 'Sneaker Design', desc: 'Custom footwear' },
                    { idea: 'Book Cover', desc: 'Publication design' },
                    { idea: 'Neon Sign', desc: 'Light installation' },
                  ].map((item) => (
                    <button
                      key={item.idea}
                      onClick={() => setCustomIdea(item.idea)}
                      className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all text-left"
                    >
                      <p className="font-medium">{item.idea}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
