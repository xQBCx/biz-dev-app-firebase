/**
 * Glyph Simulator
 * Full-featured encoding tool with 2D/3D support
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Copy, RotateCcw, Hexagon, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { encodeText } from '@/lib/qbc/encoder';
import { renderSvg, renderPng } from '@/lib/qbc/renderer2d';
import { encodeText3D } from '@/lib/qbc/encoder3d';
import { get3DLattice, getAvailable3DLattices } from '@/lib/qbc/lattices3d';
import { LatticeAnchors2D, LatticeRules, GlyphStyle, GlyphOrientation, DEFAULT_STYLE, DEFAULT_ORIENTATION } from '@/lib/qbc/types';
import { PublicGlyphVisualizer } from './PublicGlyphVisualizer';

// Default 2D Metatron's Cube anchors
const DEFAULT_ANCHORS: LatticeAnchors2D = {
  'A': [0.5, 0], 'B': [0.75, 0.125], 'C': [0.875, 0.375],
  'D': [0.875, 0.625], 'E': [0.75, 0.875], 'F': [0.5, 1],
  'G': [0.25, 0.875], 'H': [0.125, 0.625], 'I': [0.125, 0.375],
  'J': [0.25, 0.125], 'K': [0.5, 0.25], 'L': [0.625, 0.5],
  'M': [0.5, 0.75], 'N': [0.375, 0.5], 'O': [0.5, 0.5],
  'P': [0.35, 0.25], 'Q': [0.65, 0.25], 'R': [0.75, 0.5],
  'S': [0.65, 0.75], 'T': [0.35, 0.75], 'U': [0.25, 0.5],
  'V': [0.4, 0.35], 'W': [0.6, 0.35], 'X': [0.6, 0.65],
  'Y': [0.4, 0.65], 'Z': [0.5, 0.4],
  '0': [0.45, 0.45], '1': [0.55, 0.45], '2': [0.55, 0.55],
  '3': [0.45, 0.55], '4': [0.3, 0.35], '5': [0.7, 0.35],
  '6': [0.7, 0.65], '7': [0.3, 0.65], '8': [0.4, 0.5],
  '9': [0.6, 0.5], ' ': [0.5, 0.5],
};

const DEFAULT_RULES: LatticeRules = {
  enableTick: true,
  tickLengthFactor: 0.08,
  insideBoundaryPreference: true,
  nodeSpacing: 0.2,
};

// Extended orientation with scale for simulator
interface SimulatorOrientation extends GlyphOrientation {
  scale: number;
}

const DEFAULT_SIM_ORIENTATION: SimulatorOrientation = {
  ...DEFAULT_ORIENTATION,
  scale: 1,
};

export function GlyphSimulator() {
  const { toast } = useToast();
  const [inputText, setInputText] = useState('HELLO');
  const [dimension, setDimension] = useState<'2D' | '3D'>('2D');
  const [lattice3DType, setLattice3DType] = useState<'7x7x7' | 'metatron3d' | 'bio-acoustic'>('7x7x7');
  
  // Style controls
  const [style, setStyle] = useState<GlyphStyle>(DEFAULT_STYLE);
  const [orientation, setOrientation] = useState<SimulatorOrientation>(DEFAULT_SIM_ORIENTATION);
  
  // 2D encoding
  const encodedPath2D = useMemo(() => {
    if (dimension !== '2D' || !inputText) return null;
    try {
      return encodeText(inputText, DEFAULT_ANCHORS, DEFAULT_RULES);
    } catch (e) {
      return null;
    }
  }, [inputText, dimension]);
  
  // 3D encoding
  const encodedPath3D = useMemo(() => {
    if (dimension !== '3D' || !inputText) return null;
    try {
      const lattice = get3DLattice(lattice3DType);
      return encodeText3D(inputText, lattice.anchors, true);
    } catch (e) {
      return null;
    }
  }, [inputText, dimension, lattice3DType]);
  
  const handleDownloadSVG = useCallback(() => {
    if (!encodedPath2D) return;
    
    const svg = renderSvg(encodedPath2D, DEFAULT_ANCHORS, {
      ...style,
      showNodes: true,
    }, orientation);
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qbc-glyph-${inputText.slice(0, 10)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'SVG Downloaded' });
  }, [encodedPath2D, inputText, style, orientation, toast]);
  
  const handleDownloadPNG = useCallback(async () => {
    if (!encodedPath2D) return;
    
    try {
      const pngBlob = await renderPng(encodedPath2D, DEFAULT_ANCHORS, {
        ...style,
        showNodes: true,
      }, orientation, 1024);
      
      const url = URL.createObjectURL(pngBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qbc-glyph-${inputText.slice(0, 10)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: 'PNG Downloaded' });
    } catch (e) {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  }, [encodedPath2D, inputText, style, orientation, toast]);
  
  const handleCopyJSON = useCallback(() => {
    const data = dimension === '2D' ? encodedPath2D : encodedPath3D;
    if (!data) return;
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast({ title: 'JSON copied to clipboard' });
  }, [dimension, encodedPath2D, encodedPath3D, toast]);
  
  const handleReset = useCallback(() => {
    setInputText('HELLO');
    setStyle(DEFAULT_STYLE);
    setOrientation(DEFAULT_SIM_ORIENTATION);
    setDimension('2D');
  }, []);
  
  const available3DLattices = getAvailable3DLattices();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hexagon className="h-5 w-5" />
            Glyph Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dimension Toggle */}
          <Tabs value={dimension} onValueChange={(v) => setDimension(v as '2D' | '3D')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="2D" className="flex items-center gap-2">
                <Hexagon className="h-4 w-4" />
                2D
              </TabsTrigger>
              <TabsTrigger value="3D" className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                3D
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="3D" className="mt-4">
              <div className="space-y-2">
                <Label>3D Lattice Type</Label>
                <Select value={lattice3DType} onValueChange={(v) => setLattice3DType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {available3DLattices.map(l => (
                      <SelectItem key={l.id} value={l.type}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Input */}
          <div className="space-y-2">
            <Label>Input Text</Label>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value.toUpperCase())}
              placeholder="Enter text to encode"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Characters: {inputText.length}
            </p>
          </div>
          
          {/* Style Controls */}
          <div className="space-y-4">
            <Label>Style Options</Label>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Stroke Width</span>
                <span>{style.strokeWidth}px</span>
              </div>
              <Slider
                value={[style.strokeWidth]}
                onValueChange={([v]) => setStyle(s => ({ ...s, strokeWidth: v }))}
                min={0.5}
                max={5}
                step={0.5}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Node Size</span>
                <span>{style.nodeSize}px</span>
              </div>
              <Slider
                value={[style.nodeSize]}
                onValueChange={([v]) => setStyle(s => ({ ...s, nodeSize: v }))}
                min={2}
                max={10}
                step={1}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-labels">Show Labels</Label>
              <Switch
                id="show-labels"
                checked={style.showLabels}
                onCheckedChange={(v) => setStyle(s => ({ ...s, showLabels: v }))}
              />
            </div>
          </div>
          
          {/* Orientation Controls */}
          <div className="space-y-4">
            <Label>Orientation</Label>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rotation</span>
                <span>{orientation.rotation}°</span>
              </div>
              <Slider
                value={[orientation.rotation]}
                onValueChange={([v]) => setOrientation(o => ({ ...o, rotation: v }))}
                min={0}
                max={360}
                step={15}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scale</span>
                <span>{orientation.scale.toFixed(1)}x</span>
              </div>
              <Slider
                value={[orientation.scale]}
                onValueChange={([v]) => setOrientation(o => ({ ...o, scale: v }))}
                min={0.5}
                max={2}
                step={0.1}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="mirror">Mirror</Label>
              <Switch
                id="mirror"
                checked={orientation.mirror}
                onCheckedChange={(v) => setOrientation(o => ({ ...o, mirror: v }))}
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadSVG} disabled={!encodedPath2D || dimension !== '2D'}>
              <Download className="h-4 w-4 mr-2" />
              SVG
            </Button>
            <Button onClick={handleDownloadPNG} disabled={!encodedPath2D || dimension !== '2D'}>
              <Download className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button variant="outline" onClick={handleCopyJSON} disabled={!encodedPath2D && !encodedPath3D}>
              <Copy className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {dimension === '2D' && encodedPath2D && (
            <div 
              className="aspect-square bg-background border rounded-lg overflow-hidden"
              style={{ 
                transform: `rotate(${orientation.rotation}deg) scale(${orientation.scale}) ${orientation.mirror ? 'scaleX(-1)' : ''}`,
              }}
            >
              <PublicGlyphVisualizer
                path={encodedPath2D}
                size={400}
                showLabels={style.showLabels}
                animated={true}
              />
            </div>
          )}
          
          {dimension === '3D' && encodedPath3D && (
            <div className="aspect-square bg-muted/30 border rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Box className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">
                  3D Preview - {encodedPath3D.events.length} events
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Using: {available3DLattices.find(l => l.type === lattice3DType)?.name}
                </p>
              </div>
            </div>
          )}
          
          {!encodedPath2D && !encodedPath3D && (
            <div className="aspect-square bg-muted/30 border rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Enter text to generate glyph</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
