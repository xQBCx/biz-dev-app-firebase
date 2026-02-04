import Navigation from '@/components/Navigation';
import { QuickGenerator } from '@/components/qbc/QuickGenerator';

export default function QBCHome() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <QuickGenerator />
      </div>
    </div>
  );
}