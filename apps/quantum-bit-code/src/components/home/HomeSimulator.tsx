import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Download, Sparkles, Lock, Loader2, Keyboard } from 'lucide-react';
import { VirtualKeyboard } from '@/components/qbc/VirtualKeyboard';
import { supabase } from '@/integrations/supabase/client';
import { useLattices } from '@/hooks/useLattices';
import { encodeText } from '@/lib/qbc/encoder';
import { encodeText3D } from '@/lib/qbc/encoder3d';
import { renderSvg } from '@/lib/qbc/renderer2d';
import { get3DLattice } from '@/lib/qbc/lattices3d';
import { Glyph3DRenderer } from '@/components/qbc/Glyph3DRenderer';
import { useGlyphClaim } from '@/hooks/useGlyphClaim';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  EncodedPath,
  GlyphStyle,
  GlyphOrientation,
  LatticeAnchors2D,
  LatticeRules,
  DEFAULT_STYLE,
  DEFAULT_ORIENTATION
} from '@/lib/qbc/types';
import { EncodedPath3D } from '@/lib/qbc/types3d';

const HomeSimulator = () => {
  const navigate = useNavigate();
  const { lattices, loading: latticesLoading } = useLattices();
  const { claimGlyph, claiming } = useGlyphClaim();
  
  const [text, setText] = useState('');
  const [selectedLatticeId, setSelectedLatticeId] = useState<string>('');
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [lattice3DType, setLattice3DType] = useState<'7x7x7' | 'metatron'>('7x7x7');
  const [scriptFilter, setScriptFilter] = useState<'all' | 'latin' | 'cyrillic' | 'greek' | 'hebrew' | 'cjk' | 'arabic'>('all');
  const [path, setPath] = useState<EncodedPath | null>(null);
  const [path3D, setPath3D] = useState<EncodedPath3D | null>(null);
  const [user, setUser] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showAnchors, setShowAnchors] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);
  
  // Script filter patterns
  const scriptPatterns: Record<string, RegExp> = {
    all: /./,
    latin: /^[A-Za-z0-9\s.,!?'"()\-:;@#$%&*+=\/\\<>]+$/,
    cyrillic: /^[А-Яа-яЁё0-9\s.,!?'"()\-:;]+$/,
    greek: /^[Α-Ωα-ω0-9\s.,!?'"()\-:;]+$/,
    hebrew: /^[\u0590-\u05FF0-9\s.,!?'"()\-:;]+$/,
    cjk: /^[\u4E00-\u9FFF\u3400-\u4DBF0-9\s.,!?'"()\-:;]+$/,
    arabic: /^[\u0600-\u06FF0-9\s.,!?'"()\-:;]+$/,
  };
  
  const scriptLabels: Record<string, string> = {
    all: 'All Scripts',
    latin: 'Latin (A-Z)',
    cyrillic: 'Cyrillic (А-Я)',
    greek: 'Greek (Α-Ω)',
    hebrew: 'Hebrew (א-ת)',
    cjk: 'CJK / Mandarin',
    arabic: 'Arabic (ا-ي)',
  };

  // White background, black lines for default
  const style: GlyphStyle = useMemo(() => ({
    ...DEFAULT_STYLE,
    strokeColor: '#000000',
    nodeColor: '#000000',
    nodeFillColor: '#ffffff',
    backgroundColor: '#ffffff',
    gridColor: '#e5e5e5',
    showNodes: showAnchors,
    showGrid: false,
    showLabels: showLabels,
    strokeWidth: 2,
    nodeSize: 6,
  }), [showLabels, showAnchors]);

  const orientation: GlyphOrientation = DEFAULT_ORIENTATION;

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set default lattice
  useEffect(() => {
    if (lattices.length > 0 && !selectedLatticeId) {
      const defaultLattice = lattices.find(l => l.is_default) || lattices[0];
      setSelectedLatticeId(defaultLattice.id);
    }
  }, [lattices, selectedLatticeId]);

  const selectedLattice = useMemo(() => 
    lattices.find(l => l.id === selectedLatticeId),
    [lattices, selectedLatticeId]
  );

  const handleGenerate = () => {
    if (!text.trim()) return;
    
    setGenerating(true);
    
    try {
      if (mode === '2d') {
        if (!selectedLattice) return;
        const anchors = selectedLattice.anchors_json as LatticeAnchors2D;
        const rules = selectedLattice.rules_json as LatticeRules;
        const encoded = encodeText(text, anchors, rules);
        setPath(encoded);
        setPath3D(null);
      } else {
        // 3D mode uses generated lattices
        const anchors3D = get3DLattice(lattice3DType);
        const encoded3D = encodeText3D(text, anchors3D, { 
          enableTick: true, 
          tickLengthFactor: 0.08, 
          insideBoundaryPreference: true, 
          nodeSpacing: 0.2 
        });
        setPath3D(encoded3D);
        setPath(null);
      }
    } catch (err) {
      console.error('Encoding error:', err);
      toast.error('Failed to generate glyph');
    } finally {
      setGenerating(false);
    }
  };

  const svgContent = useMemo(() => {
    if (!path || !selectedLattice || mode !== '2d') return null;
    const anchors = selectedLattice.anchors_json as LatticeAnchors2D;
    return renderSvg(path, anchors, style, orientation);
  }, [path, selectedLattice, style, orientation, mode]);

  const handleDownloadSvg = () => {
    if (!user) {
      toast.error('Sign in required to download glyphs');
      navigate('/auth');
      return;
    }
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qbc-${text.trim().toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!user) {
      toast.error('Sign in required to download glyphs');
      navigate('/auth');
      return;
    }
    if (!svgContent) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 800;
      ctx?.drawImage(img, 0, 0, 800, 800);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qbc-${text.trim().toLowerCase().replace(/\s+/g, '-')}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const handleClaim = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!path || !selectedLattice || !svgContent) return;

    const result = await claimGlyph(
      text,
      selectedLattice.id,
      selectedLattice.version,
      selectedLattice.rules_json as LatticeRules,
      path,
      orientation,
      style,
      svgContent
    );

    if (result.success && result.claimId) {
      navigate(`/glyph/${result.claimId}`);
    } else if (result.alreadyClaimed) {
      toast.error('This glyph has already been claimed');
      if (result.existingClaimId) {
        navigate(`/glyph/${result.existingClaimId}`);
      }
    } else {
      toast.error(result.error || 'Failed to claim glyph');
    }
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-mono mb-3">
              <Sparkles className="w-4 h-4" />
              QBC Simulator
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
              Generate Your Glyph
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Type a word, name, or phrase to create a unique geometric signature
            </p>
          </div>

          {/* Simulator Card */}
          <Card className="p-4 md:p-6 bg-card border-border">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                {/* Text Input */}
                <div>
                  <Label htmlFor="glyph-text" className="text-sm font-medium mb-2 block">
                    Text to Encode
                  </Label>
                  <Input
                    id="glyph-text"
                    placeholder={scriptFilter === 'all' ? 'Type a word, name, or phrase...' : `Type in ${scriptLabels[scriptFilter]}...`}
                    value={text}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Only validate if not 'all' and there's text
                      if (scriptFilter === 'all' || val === '' || scriptPatterns[scriptFilter].test(val)) {
                        setText(val);
                      }
                    }}
                    className="bg-background text-foreground"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {scriptFilter !== 'all' ? `${scriptLabels[scriptFilter]} characters only` : (mode === '3d' ? 'Latin, Cyrillic, Greek, Hebrew, CJK, Arabic + symbols' : 'A-Z and spaces only')} • {text.length}/50
                  </p>
                </div>

                {/* Lattice Selector - contextual based on mode */}
                {mode === '2d' ? (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Lattice</Label>
                    <Select 
                      value={selectedLatticeId} 
                      onValueChange={setSelectedLatticeId}
                      disabled={latticesLoading}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select lattice..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lattices.map((lattice) => (
                          <SelectItem key={lattice.id} value={lattice.id}>
                            {lattice.name} {lattice.is_default && '(Default)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">3D Lattice Structure</Label>
                    <Select 
                      value={lattice3DType} 
                      onValueChange={(v) => setLattice3DType(v as '7x7x7' | 'metatron')}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7x7x7">7×7×7 Cubic (343 anchors)</SelectItem>
                        <SelectItem value="metatron">Metatron's Cube</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lattice3DType === 'metatron' 
                        ? 'Sacred geometry with Platonic solid vertices' 
                        : 'Full alphanumeric + special characters'}
                    </p>
                  </div>
                )}

                {/* Script/Language Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Script / Language</Label>
                    {scriptFilter !== 'all' && scriptFilter !== 'latin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setShowKeyboard(!showKeyboard)}
                      >
                        <Keyboard className="w-3 h-3 mr-1" />
                        {showKeyboard ? 'Hide' : 'Show'} Keyboard
                      </Button>
                    )}
                  </div>
                  <Select 
                    value={scriptFilter} 
                    onValueChange={(v) => {
                      setScriptFilter(v as typeof scriptFilter);
                      setText(''); // Clear text when changing script
                      // Auto-show keyboard for non-Latin scripts
                      if (v !== 'all' && v !== 'latin') {
                        setShowKeyboard(true);
                      } else {
                        setShowKeyboard(false);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(scriptLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Filter character input to a specific script
                  </p>

                  {/* Virtual Keyboard */}
                  {showKeyboard && scriptFilter !== 'all' && scriptFilter !== 'latin' && (
                    <VirtualKeyboard
                      script={scriptFilter as 'cyrillic' | 'greek' | 'hebrew' | 'cjk' | 'arabic'}
                      onCharacter={(char) => {
                        if (text.length < 50) {
                          setText(prev => prev + char);
                        }
                      }}
                      onBackspace={() => setText(prev => prev.slice(0, -1))}
                      onClose={() => setShowKeyboard(false)}
                    />
                  )}
                </div>

                {/* Toggles Row */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-labels"
                      checked={showLabels}
                      onCheckedChange={setShowLabels}
                    />
                    <Label htmlFor="show-labels" className="text-sm">Show Letters</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-anchors"
                      checked={showAnchors}
                      onCheckedChange={setShowAnchors}
                    />
                    <Label htmlFor="show-anchors" className="text-sm">Show Anchors</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="mode-3d"
                      checked={mode === '3d'}
                      onCheckedChange={(checked) => setMode(checked ? '3d' : '2d')}
                    />
                    <Label htmlFor="mode-3d" className="text-sm">3D Mode</Label>
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerate}
                  disabled={!text.trim() || (mode === '2d' && !selectedLatticeId) || generating}
                  className="w-full"
                  size="lg"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Glyph
                </Button>

                {/* Action Buttons (show when glyph generated) */}
                {path && svgContent && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={handleDownloadSvg}>
                        <Download className="w-4 h-4 mr-1" />
                        SVG
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadPng}>
                        <Download className="w-4 h-4 mr-1" />
                        PNG
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleClaim}
                      disabled={claiming}
                      className="w-full"
                      variant="secondary"
                    >
                      {claiming ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : user ? (
                        <Lock className="w-4 h-4 mr-2" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      {user ? 'Claim This Glyph' : 'Sign in to Claim'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              <div className="flex flex-col">
                <Label className="text-sm font-medium mb-2">Preview</Label>
                <div 
                  className="flex-1 aspect-square max-h-[60vw] md:max-h-[400px] rounded-lg border-2 border-dashed border-border bg-white flex items-center justify-center overflow-hidden"
                >
                  {mode === '2d' && path && svgContent ? (
                    <div 
                      className="w-full h-full p-2 md:p-4 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  ) : mode === '3d' && path3D ? (
                    <div className="w-full h-full">
                      <Glyph3DRenderer
                        path={path3D}
                        anchors={get3DLattice(lattice3DType)}
                        style={style}
                        orientation={orientation}
                        latticeType={lattice3DType}
                        showLabels={showLabels}
                        showAnchors={showAnchors}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        Enter text and click Generate
                      </p>
                    </div>
                  )}
                </div>
                
                {(path || path3D) && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {(path?.visitedChars.length || path3D?.visitedChars.length || 0)} anchors visited • {mode.toUpperCase()} mode
                    {mode === '3d' && ` • ${lattice3DType === 'metatron' ? "Metatron's Cube" : '7×7×7'}`}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HomeSimulator;
