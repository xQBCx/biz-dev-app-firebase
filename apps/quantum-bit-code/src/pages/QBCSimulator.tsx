import Navigation from '@/components/Navigation';
import { GlyphSimulator } from '@/components/qbc/GlyphSimulator';

export default function QBCSimulator() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6 pt-20">
        <GlyphSimulator />
      </main>
    </div>
  );
}