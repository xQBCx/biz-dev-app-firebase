import Navigation from '@/components/Navigation';
import { GlyphDecoder } from '@/components/qbc/GlyphDecoder';

export default function QBCDecode() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6 pt-20">
        <GlyphDecoder />
      </main>
    </div>
  );
}