import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Grid3X3, Layers, Puzzle, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useLattices } from '@/hooks/useLattices';
import { encodeComposite, chunkText } from '@/lib/qbc/compositeEncoder';
import { renderCompositeDataUrl, renderCompositePng } from '@/lib/qbc/compositeRenderer';
import { CompositeLayout, ChunkConfig, DEFAULT_CHUNK_CONFIG } from '@/lib/qbc/compositeTypes';
import { DEFAULT_STYLE, normalizeLatticeRules, LatticeAnchors2D } from '@/lib/qbc/types';

const SAMPLE_TEXT = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG NEAR THE RIVERBANK AT DAWN";

const layoutOptions: { value: CompositeLayout; label: string; icon: React.ReactNode }[] = [
  { value: 'grid', label: 'Grid', icon: <Grid3X3 className="h-4 w-4" /> },
  { value: 'hierarchical', label: 'Hierarchical', icon: <Layers className="h-4 w-4" /> },
  { value: 'mosaic', label: 'Mosaic', icon: <Puzzle className="h-4 w-4" /> },
];

export function CompositeGenerator() {
  const { lattices, loading: latticesLoading, getDefaultLattice } = useLattices();
  const [text, setText] = useState(SAMPLE_TEXT);
  const [config, setConfig] = useState<ChunkConfig>(DEFAULT_CHUNK_CONFIG);
  const [showAnchors, setShowAnchors] = useState(false);
  const [showFinderPatterns, setShowFinderPatterns] = useState(true);
  
  const defaultLattice = useMemo(() => getDefaultLattice(), [lattices]);
  
  // Generate composite
  const composite = useMemo(() => {
    if (!defaultLattice || !text.trim()) return null;
    
    const anchors = defaultLattice.anchors_json as LatticeAnchors2D;
    const rules = normalizeLatticeRules(defaultLattice.rules_json);
    const style = { ...DEFAULT_STYLE };
    
    return encodeComposite(
      text,
      anchors,
      rules,
      style,
      defaultLattice.lattice_key,
      config
    );
  }, [text, config, defaultLattice]);
  
  // Generate preview image
  const previewUrl = useMemo(() => {
    if (!composite) return null;
    return renderCompositeDataUrl(composite, 600, {
      showAnchors,
      showFinderPatterns,
      showBorder: true,
    });
  }, [composite, showAnchors, showFinderPatterns]);
  
  // Chunk preview
  const chunks = useMemo(() => {
    if (!text.trim()) return [];
    return chunkText(text, config.chunkSize);
  }, [text, config.chunkSize]);
  
  const handleDownloadSvg = () => {
    if (!composite) return;
    
    const svg = renderCompositeDataUrl(composite, 1200, {
      showAnchors,
      showFinderPatterns,
      showBorder: true,
    });
    
    const link = document.createElement('a');
    link.href = svg;
    link.download = `qbc-composite-${composite.metadata.hash}.svg`;
    link.click();
  };
  
  const handleDownloadPng = async () => {
    if (!composite) return;
    
    const blob = await renderCompositePng(composite, 2048, {
      showAnchors,
      showFinderPatterns,
      showBorder: true,
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qbc-composite-${composite.metadata.hash}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleReset = () => {
    setText(SAMPLE_TEXT);
    setConfig(DEFAULT_CHUNK_CONFIG);
  };

  if (latticesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading lattice...</div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="space-y-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Input Data
              <Badge variant="outline" className="font-mono text-xs">
                {text.length} chars
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter long text, data, or numbers..."
              className="min-h-[120px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Layout Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Layout Style</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {layoutOptions.map(({ value, label, icon }) => (
                <Button
                  key={value}
                  variant={config.layout === value ? 'default' : 'outline'}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setConfig(c => ({ ...c, layout: value }))}
                >
                  {icon}
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chunk Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Chunk Size</Label>
                <span className="text-sm text-muted-foreground font-mono">
                  {config.chunkSize} chars
                </span>
              </div>
              <Slider
                value={[config.chunkSize]}
                onValueChange={([v]) => setConfig(c => ({ ...c, chunkSize: v }))}
                min={3}
                max={20}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Characters per glyph chunk
              </p>
            </div>
            
            {/* Grid Columns (for grid layout) */}
            {config.layout === 'grid' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Grid Columns</Label>
                  <span className="text-sm text-muted-foreground font-mono">
                    {config.gridColumns}
                  </span>
                </div>
                <Slider
                  value={[config.gridColumns || 3]}
                  onValueChange={([v]) => setConfig(c => ({ ...c, gridColumns: v }))}
                  min={2}
                  max={6}
                  step={1}
                />
              </div>
            )}
            
            {/* Primary Scale (for hierarchical) */}
            {config.layout === 'hierarchical' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Primary Glyph Size</Label>
                  <span className="text-sm text-muted-foreground font-mono">
                    {Math.round((config.primaryScale || 0.5) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[(config.primaryScale || 0.5) * 100]}
                  onValueChange={([v]) => setConfig(c => ({ ...c, primaryScale: v / 100 }))}
                  min={30}
                  max={70}
                  step={5}
                />
              </div>
            )}
            
            {/* Display Options */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Show Anchors</Label>
                <Switch checked={showAnchors} onCheckedChange={setShowAnchors} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Finder Patterns</Label>
                <Switch checked={showFinderPatterns} onCheckedChange={setShowFinderPatterns} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Preview */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Composite Preview</span>
              {composite && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {chunks.length} glyphs
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Composite QBC" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Enter text to generate composite
                </div>
              )}
            </div>
            
            {/* Download Buttons */}
            {composite && (
              <div className="flex gap-2 mt-4">
                <Button onClick={handleDownloadSvg} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  SVG
                </Button>
                <Button onClick={handleDownloadPng} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  PNG (2K)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Chunk Preview */}
        {chunks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Chunks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {chunks.map((chunk, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="font-mono text-xs py-1"
                  >
                    {chunk}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Each chunk becomes a separate QBC glyph in the composite
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Stats */}
        {composite && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encoding Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Total Characters</dt>
                  <dd className="font-mono font-medium">{composite.metadata.fullText.length}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Glyph Count</dt>
                  <dd className="font-mono font-medium">{composite.metadata.totalChunks}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Layout</dt>
                  <dd className="font-mono font-medium capitalize">{composite.metadata.layout}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hash</dt>
                  <dd className="font-mono font-medium text-xs">{composite.metadata.hash}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
