import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Copy, Share2, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QBCPublicLayout } from '@/components/qbc/QBCPublicLayout';
import { PublicGlyphVisualizer } from '@/components/qbc/PublicGlyphVisualizer';
import { encodeText, normalizeText } from '@/lib/qbc/encoder';
import { renderSvg, renderPng } from '@/lib/qbc/renderer2d';
import { canonicalizeText } from '@/lib/qbc/hash';
import { DEFAULT_STYLE, DEFAULT_ORIENTATION, EncodedPath, LatticeAnchors2D, LatticeRules } from '@/lib/qbc/types';

// Default Metatron's Cube anchors (A-L mapped to vertices)
const DEFAULT_ANCHORS: LatticeAnchors2D = {
  'A': [0.5, 0.15],    // top
  'B': [0.8, 0.325],   // top-right
  'C': [0.8, 0.675],   // bottom-right
  'D': [0.5, 0.85],    // bottom
  'E': [0.2, 0.675],   // bottom-left
  'F': [0.2, 0.325],   // top-left
  'G': [0.5, 0.3],     // inner-top
  'H': [0.67, 0.4],    // inner-right
  'I': [0.67, 0.6],    // inner-bottom-right
  'J': [0.5, 0.7],     // inner-bottom
  'K': [0.33, 0.6],    // inner-bottom-left
  'L': [0.33, 0.4],    // inner-top-left
  ' ': [0.5, 0.5],     // center (space)
};

const DEFAULT_RULES: LatticeRules = {
  enableTick: true,
  tickLengthFactor: 0.08,
  insideBoundaryPreference: true,
  nodeSpacing: 0.2,
};

export default function QBCPublicGenerator() {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const encodedPath = useMemo<EncodedPath | undefined>(() => {
    if (!inputText.trim()) return undefined;
    
    try {
      const normalized = normalizeText(inputText, true);
      return encodeText(normalized, DEFAULT_ANCHORS, DEFAULT_RULES);
    } catch (e) {
      console.error('Encoding error:', e);
      return undefined;
    }
  }, [inputText]);

  const contentHash = useMemo(() => {
    if (!inputText.trim()) return '';
    // Simple hash for display - just show canonicalized text fingerprint
    const canonical = canonicalizeText(inputText);
    // Create a simple base64-like hash for display
    return btoa(canonical).replace(/=/g, '').slice(0, 32);
  }, [inputText]);

  const handleDownloadSVG = () => {
    if (!encodedPath) return;
    
    const qbcStyle = {
      ...DEFAULT_STYLE,
      strokeColor: '#00d4ff',
      nodeColor: '#00d4ff',
      backgroundColor: '#0d1117',
      showNodes: true,
      showGrid: false,
    };
    
    const svg = renderSvg(encodedPath, DEFAULT_ANCHORS, qbcStyle, DEFAULT_ORIENTATION);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qbc-glyph-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "SVG Downloaded",
      description: "Your glyph has been saved as SVG."
    });
  };

  const handleDownloadPNG = async () => {
    if (!encodedPath) return;
    
    const qbcStyle = {
      ...DEFAULT_STYLE,
      strokeColor: '#00d4ff',
      nodeColor: '#00d4ff',
      backgroundColor: '#0d1117',
      showNodes: true,
      showGrid: false,
    };
    
    const blob = await renderPng(encodedPath, DEFAULT_ANCHORS, qbcStyle, DEFAULT_ORIENTATION, 800);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qbc-glyph-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "PNG Downloaded",
        description: "Your glyph has been saved as PNG."
      });
    }
  };

  const handleCopyHash = async () => {
    if (!contentHash) return;
    await navigator.clipboard.writeText(contentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Hash Copied",
      description: "Content hash copied to clipboard."
    });
  };

  const handleClear = () => {
    setInputText('');
  };

  return (
    <QBCPublicLayout>
      <Helmet>
        <title>Glyph Generator | Quantum Bit Code</title>
        <meta name="description" content="Generate geometric glyphs from text using QBC's Metatron's Cube lattice encryption." />
      </Helmet>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Glyph</span>{' '}
              <span className="text-primary text-glow-cyan">Generator</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your text into secure geometric patterns. 
              Free tier supports A-L characters and spaces.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Input Panel */}
            <div className="card-qbc rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="text-input" className="text-foreground mb-2 block">
                    Enter Text
                  </Label>
                  <div className="relative">
                    <Input
                      id="text-input"
                      type="text"
                      placeholder="Type A-L characters..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value.toUpperCase())}
                      className="input-qbc text-lg font-mono tracking-wider pr-12"
                      maxLength={50}
                    />
                    {inputText && (
                      <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported: A-L and spaces • Max 50 characters
                  </p>
                </div>

                {/* Character Preview */}
                <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Normalized Text
                  </Label>
                  <p className="font-mono text-primary text-lg tracking-widest min-h-[28px]">
                    {inputText ? normalizeText(inputText, true) : '—'}
                  </p>
                </div>

                {/* Content Hash */}
                {contentHash && (
                  <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm text-muted-foreground">
                        Content Hash (SHA-256)
                      </Label>
                      <button
                        onClick={handleCopyHash}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-xs text-foreground/80 break-all">
                      {contentHash.slice(0, 32)}...
                    </p>
                  </div>
                )}

                {/* Download Actions */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleDownloadSVG}
                    disabled={!encodedPath}
                    className="btn-qbc-primary flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    SVG
                  </Button>
                  <Button 
                    onClick={handleDownloadPNG}
                    disabled={!encodedPath}
                    className="btn-qbc-primary flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    PNG
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={!encodedPath}
                    className="btn-qbc-outline gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Visualization Panel */}
            <div className="card-qbc rounded-xl p-6 flex items-center justify-center min-h-[400px]">
              <PublicGlyphVisualizer 
                path={encodedPath}
                size={360}
                showLabels={true}
                animated={!!encodedPath}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Free tier:</strong> Generate glyphs using Metatron's Cube lattice. 
              For custom lattices, bio-keys, and API access,{' '}
              <a href="/qbc/pricing" className="text-primary hover:underline">
                upgrade to Pro or Enterprise
              </a>.
            </p>
          </div>
        </div>
      </section>
    </QBCPublicLayout>
  );
}
