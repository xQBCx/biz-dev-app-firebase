import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RotateCcw, Eye, Grid3X3, Type } from 'lucide-react';
import { Glyph2DRenderer } from './Glyph2DRenderer';
import { Glyph3DRenderer } from './Glyph3DRenderer';
import { useLattices } from '@/hooks/useLattices';
import {
  encodeText,
  renderSvg,
  renderPng,
  DEFAULT_STYLE,
  DEFAULT_ORIENTATION,
  EncodedPath,
  GlyphStyle,
  GlyphOrientation,
  GlyphPackage,
  generateGlyphHash,
  LatticeAnchors3D,
} from '@/lib/qbc';
import { encodeText3D } from '@/lib/qbc/encoder3d';
import { get3DLattice } from '@/lib/qbc/lattices3d';
import { EncodedPath3D } from '@/lib/qbc/types3d';
import { toast } from 'sonner';

export function GlyphSimulator() {
  const { lattices, loading, getDefaultLattice } = useLattices();
  const [text, setText] = useState('');
  const [selectedLatticeId, setSelectedLatticeId] = useState<string>('');
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [lattice3DType, setLattice3DType] = useState<'7x7x7' | 'metatron'>('7x7x7');
  const [style, setStyle] = useState<GlyphStyle>(DEFAULT_STYLE);
  const [orientation, setOrientation] = useState<GlyphOrientation>(DEFAULT_ORIENTATION);
  const [encodedPath, setEncodedPath] = useState<EncodedPath | null>(null);
  const [encodedPath3D, setEncodedPath3D] = useState<EncodedPath3D | null>(null);

  const selectedLattice = lattices.find((l) => l.id === selectedLatticeId) || getDefaultLattice();

  const handleEncode = useCallback(() => {
    if (!text.trim()) {
      toast.error('Please enter text');
      return;
    }

    if (mode === '2d') {
      if (!selectedLattice) {
        toast.error('Please select a lattice');
        return;
      }
      const path = encodeText(text, selectedLattice.anchors_json, selectedLattice.rules_json);
      setEncodedPath(path);
      setEncodedPath3D(null);
    } else {
      // 3D mode uses generated lattices
      const anchors3D = get3DLattice(lattice3DType);
      const path3D = encodeText3D(text, anchors3D, { enableTick: true, tickLengthFactor: 0.08, insideBoundaryPreference: true, nodeSpacing: 0.2 });
      setEncodedPath3D(path3D);
      setEncodedPath(null);
    }
    toast.success(`Encoded "${text.toUpperCase()}" successfully`);
  }, [text, selectedLattice, mode, lattice3DType]);

  const handleDownloadSvg = useCallback(() => {
    if (!encodedPath || !selectedLattice) return;

    const svg = renderSvg(encodedPath, selectedLattice.anchors_json, style, orientation);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qbc-${text.toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded');
  }, [encodedPath, selectedLattice, style, orientation, text]);

  const handleDownloadPng = useCallback(async (size: number) => {
    if (!encodedPath || !selectedLattice) return;

    try {
      const blob = await renderPng(encodedPath, selectedLattice.anchors_json, style, orientation, size);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qbc-${text.toLowerCase().replace(/\s+/g, '-')}-${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`PNG (${size}px) downloaded`);
    } catch {
      toast.error('Failed to generate PNG');
    }
  }, [encodedPath, selectedLattice, style, orientation, text]);

  const handleDownloadJson = useCallback(() => {
    if (!encodedPath || !selectedLattice) return;

    const pkg: GlyphPackage = {
      version: '1.0',
      metadata: {
        text: text.toUpperCase(),
        latticeKey: selectedLattice.lattice_key,
        latticeVersion: selectedLattice.version,
        orientation,
        style,
        timestamp: new Date().toISOString(),
        hash: generateGlyphHash(text, selectedLattice.lattice_key),
      },
      path: encodedPath,
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qbc-${text.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Glyph package downloaded');
  }, [encodedPath, selectedLattice, text, orientation, style]);

  const handleReset = () => {
    setOrientation(DEFAULT_ORIENTATION);
    setStyle(DEFAULT_STYLE);
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading lattices...</div>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Controls Panel */}
      <div className="space-y-6">
        {/* Text Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Text Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text-input">
                {mode === '3d' ? 'Enter text (A-Z, 0-9, special chars)' : 'Enter text (A-Z, spaces)'}
              </Label>
              <Input
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your name or phrase..."
                className="mt-1"
              />
            </div>

            {mode === '2d' ? (
              <div>
                <Label>Lattice</Label>
                <Select
                  value={selectedLatticeId || selectedLattice?.id}
                  onValueChange={setSelectedLatticeId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select lattice" />
                  </SelectTrigger>
                  <SelectContent>
                    {lattices.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} {l.is_default && '(Default)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label>3D Lattice Structure</Label>
                <Select
                  value={lattice3DType}
                  onValueChange={(v) => setLattice3DType(v as '7x7x7' | 'metatron')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7x7x7">7×7×7 Cubic (343 anchors)</SelectItem>
                    <SelectItem value="metatron">Metatron's Cube (Sacred Geometry)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {lattice3DType === 'metatron' 
                    ? 'Sacred geometry with 13 circles and Platonic solid vertices' 
                    : 'Full alphanumeric + special character support'}
                </p>
              </div>
            )}

            <Button onClick={handleEncode} className="w-full" size="lg">
              Generate Glyph
            </Button>
          </CardContent>
        </Card>

        {/* Mode Toggle */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={mode} onValueChange={(v) => setMode(v as '2d' | '3d')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="2d">2D View</TabsTrigger>
                <TabsTrigger value="3d">3D View</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Style Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Style
              </span>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Stroke Width: {style.strokeWidth}px</Label>
              <Slider
                value={[style.strokeWidth]}
                onValueChange={([v]) => setStyle((s) => ({ ...s, strokeWidth: v }))}
                min={1}
                max={6}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Node Size: {style.nodeSize}px</Label>
              <Slider
                value={[style.nodeSize]}
                onValueChange={([v]) => setStyle((s) => ({ ...s, nodeSize: v }))}
                min={2}
                max={12}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Nodes</Label>
              <Switch
                checked={style.showNodes}
                onCheckedChange={(v) => setStyle((s) => ({ ...s, showNodes: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Grid</Label>
              <Switch
                checked={style.showGrid}
                onCheckedChange={(v) => setStyle((s) => ({ ...s, showGrid: v }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Labels</Label>
              <Switch
                checked={style.showLabels}
                onCheckedChange={(v) => setStyle((s) => ({ ...s, showLabels: v }))}
              />
            </div>

            <div>
              <Label>Theme</Label>
              <Select
                value={style.backgroundColor === '#ffffff' ? 'notebook' : 'gallery'}
                onValueChange={(v) => {
                  if (v === 'notebook') {
                    setStyle((s) => ({
                      ...s,
                      backgroundColor: '#ffffff',
                      strokeColor: '#000000',
                      nodeColor: '#000000',
                      nodeFillColor: '#ffffff',
                    }));
                  } else {
                    setStyle((s) => ({
                      ...s,
                      backgroundColor: '#0a0a0a',
                      strokeColor: '#d4a574',
                      nodeColor: '#d4a574',
                      nodeFillColor: '#0a0a0a',
                    }));
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notebook">Notebook (White/Black)</SelectItem>
                  <SelectItem value="gallery">Gallery (Black/Gold)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orientation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Orientation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === '2d' ? (
              <>
                <div>
                  <Label>Rotation: {orientation.rotation}°</Label>
                  <Slider
                    value={[orientation.rotation]}
                    onValueChange={([v]) => setOrientation((o) => ({ ...o, rotation: v }))}
                    min={0}
                    max={270}
                    step={90}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Mirror Horizontal</Label>
                  <Switch
                    checked={orientation.mirror}
                    onCheckedChange={(v) => setOrientation((o) => ({ ...o, mirror: v }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Flip Vertical</Label>
                  <Switch
                    checked={orientation.flipVertical}
                    onCheckedChange={(v) => setOrientation((o) => ({ ...o, flipVertical: v }))}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Yaw: {orientation.yaw || 0}°</Label>
                  <Slider
                    value={[orientation.yaw || 0]}
                    onValueChange={([v]) => setOrientation((o) => ({ ...o, yaw: v }))}
                    min={-180}
                    max={180}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Pitch: {orientation.pitch || 0}°</Label>
                  <Slider
                    value={[orientation.pitch || 0]}
                    onValueChange={([v]) => setOrientation((o) => ({ ...o, pitch: v }))}
                    min={-90}
                    max={90}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Roll: {orientation.roll || 0}°</Label>
                  <Slider
                    value={[orientation.roll || 0]}
                    onValueChange={([v]) => setOrientation((o) => ({ ...o, roll: v }))}
                    min={-180}
                    max={180}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOrientation((o) => ({ ...o, yaw: 0, pitch: 0, roll: 0 }))}
                >
                  Reset to Origin (0,0,0)
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Download Options */}
        {encodedPath && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" onClick={handleDownloadSvg}>
                Download SVG
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownloadPng(1024)}>
                  PNG 1024
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadPng(2048)}>
                  PNG 2048
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadPng(4096)}>
                  PNG 4096
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={handleDownloadJson}>
                Download JSON Package
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              {(encodedPath || encodedPath3D) ? `"${text.toUpperCase()}"` : 'Preview'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[500px]">
            {mode === '2d' && encodedPath && selectedLattice ? (
              <Glyph2DRenderer
                path={encodedPath}
                anchors={selectedLattice.anchors_json}
                style={style}
                orientation={orientation}
                size={400}
                className="max-w-full"
              />
            ) : mode === '3d' && encodedPath3D ? (
              <div className="w-full h-[400px]">
                <Glyph3DRenderer
                  path={encodedPath3D}
                  anchors={get3DLattice(lattice3DType)}
                  style={style}
                  orientation={orientation}
                  latticeType={lattice3DType}
                />
              </div>
            ) : (
              <div className="text-muted-foreground text-center">
                <p className="text-lg">Enter text and click "Generate Glyph"</p>
                <p className="text-sm mt-2">Your glyph will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata Panel */}
        {(encodedPath || encodedPath3D) && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              {mode === '2d' && encodedPath && selectedLattice && (
                <>
                  <p><strong>Lattice:</strong> {selectedLattice.lattice_key} v{selectedLattice.version}</p>
                  <p><strong>Characters:</strong> {encodedPath.visitedChars.length}</p>
                  <p><strong>Path Events:</strong> {encodedPath.events.length}</p>
                </>
              )}
              {mode === '3d' && encodedPath3D && (
                <>
                  <p><strong>Lattice:</strong> {lattice3DType === 'metatron' ? "Metatron's Cube" : '7×7×7 Cubic'}</p>
                  <p><strong>Characters:</strong> {encodedPath3D.visitedChars.length}</p>
                  <p><strong>Path Events:</strong> {encodedPath3D.events.length}</p>
                </>
              )}
              <p><strong>Orientation:</strong> {orientation.rotation}° {orientation.mirror ? '(mirrored)' : ''}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
