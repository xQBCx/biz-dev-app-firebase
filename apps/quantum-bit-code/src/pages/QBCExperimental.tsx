import Navigation from '@/components/Navigation';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, QrCode, Sparkles } from 'lucide-react';
import { CompositeGenerator } from '@/components/qbc/CompositeGenerator';

export default function QBCExperimental() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Intro Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FlaskConical className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">QBC Lab</h1>
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  EXPERIMENTAL
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Encode large data sets using multiple overlapping QBC glyphs
              </p>
            </div>
          </div>
          
          {/* Concept Explanation */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Quantum Bit Code (QBC) Composites</strong> work like QR codes but use QBC glyphs instead of black and white squares. 
                  Long text is split into chunks, each encoded as a separate glyph, then arranged in a scannable pattern.
                </p>
                <p className="text-muted-foreground">
                  This experimental feature explores high-density data encoding using the QBC visual language. 
                  Future versions may include machine-readable decoding via camera scanning.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Generator */}
        <CompositeGenerator />
        
        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Composite QBC is an experimental encoding format. 
            Decoding capabilities coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}