import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Glyph2DRenderer } from './Glyph2DRenderer';
import { useLattices } from '@/hooks/useLattices';
import { encodeText, DEFAULT_STYLE, DEFAULT_ORIENTATION } from '@/lib/qbc';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, FlaskConical } from 'lucide-react';

const EXAMPLE_WORDS = ['LOVE', 'NOAH', 'PEACE', 'QUANTUM', 'SIGNAL'];

export function QuickGenerator() {
  const navigate = useNavigate();
  const { lattices, loading, getDefaultLattice } = useLattices();
  const [text, setText] = useState('');

  const defaultLattice = getDefaultLattice();

  const handleGenerate = useCallback(() => {
    if (text.trim()) {
      navigate(`/qbc/simulator?text=${encodeURIComponent(text.trim())}`);
    }
  }, [text, navigate]);

  const handleExampleClick = (word: string) => {
    setText(word);
  };

  if (loading || !defaultLattice) {
    return null;
  }

  const previewPath = text.trim()
    ? encodeText(text, defaultLattice.anchors_json, defaultLattice.rules_json)
    : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">QBC Simulator</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Transform words into unique geometric glyphs
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your name..."
                className="text-lg h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <Button size="lg" onClick={handleGenerate} disabled={!text.trim()}>
                Generate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Try:</span>
              {EXAMPLE_WORDS.map((word) => (
                <Button
                  key={word}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(word)}
                >
                  {word}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {previewPath ? (
                <Glyph2DRenderer
                  path={previewPath}
                  anchors={defaultLattice.anchors_json}
                  style={DEFAULT_STYLE}
                  orientation={DEFAULT_ORIENTATION}
                  size={300}
                />
              ) : (
                <div className="w-[300px] h-[300px] border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Your glyph will appear here</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Enter text</p>
                  <p className="text-muted-foreground">Type any word or phrase using A-Z and spaces</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Geometric encoding</p>
                  <p className="text-muted-foreground">Each letter maps to a point on the lattice grid</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Unique glyph</p>
                  <p className="text-muted-foreground">The path creates a one-of-a-kind symbol</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="link" className="px-0" onClick={() => navigate('/qbc/simulator')}>
                  Open full simulator →
                </Button>
                <Button variant="link" className="px-0" onClick={() => navigate('/qbc/products')}>
                  <ShoppingBag className="w-4 h-4 mr-1" />
                  Create products →
                </Button>
                <Button variant="link" className="px-0" onClick={() => navigate('/qbc/experimental')}>
                  <FlaskConical className="w-4 h-4 mr-1" />
                  QBC Lab →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
