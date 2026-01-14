import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Hexagon, 
  Shield, 
  Lock, 
  Zap, 
  Globe, 
  ChevronRight,
  Fingerprint,
  Network,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QBCPublicLayout } from '@/components/qbc/QBCPublicLayout';
import { PublicGlyphVisualizer } from '@/components/qbc/PublicGlyphVisualizer';
import { QBCHeading, QBCText } from '@/components/qbc/QBCText';

const features = [
  {
    icon: Hexagon,
    title: "Geometric Encoding",
    description: "Transform text into unique geometric patterns using Metatron's Cube lattice structure."
  },
  {
    icon: Shield,
    title: "Post-Quantum Security",
    description: "Encryption designed to resist quantum computing attacks with lattice-based cryptography."
  },
  {
    icon: Network,
    title: "MESH 34 Routing",
    description: "Distributed transport layer for secure message routing across decentralized networks."
  },
  {
    icon: Fingerprint,
    title: "Bio-Acoustic Keys",
    description: "Generate encryption keys from natural entropy - birdsong, seismic shifts, organic audio."
  },
  {
    icon: Lock,
    title: "Signal Sovereignty",
    description: "Take control of your data with self-sovereign encryption that you own completely."
  },
  {
    icon: Zap,
    title: "Real-Time Encoding",
    description: "Instant text-to-glyph conversion with visual feedback and verification."
  }
];

export default function QBCPublicHome() {
  return (
    <QBCPublicLayout>
      <Helmet>
        <title>Quantum Bit Code | Post-Quantum Geometric Encryption</title>
        <meta name="description" content="Transform text into secure geometric patterns with post-quantum cryptography. Signal sovereignty for the quantum age." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-qbc-radial opacity-50" />
        <div className="absolute inset-0 bg-hex-pattern opacity-30" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <QBCText className="text-sm text-primary font-medium">
                  Post-Quantum Encryption
                </QBCText>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <QBCText className="text-foreground">Signal</QBCText>{' '}
                <QBCText className="text-primary text-glow-cyan">Sovereignty</QBCText>
              </h1>
              
              <QBCText as="p" className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Transform your messages into secure geometric patterns using 
                Metatron's Cube lattice encryption. Built for the quantum age.
              </QBCText>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/qbc/generator">
                  <Button size="lg" className="btn-qbc-primary gap-2 w-full sm:w-auto">
                    <QBCText>Try the Generator</QBCText>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/qbc/docs">
                  <Button size="lg" variant="outline" className="btn-qbc-outline w-full sm:w-auto">
                    <QBCText>Learn How It Works</QBCText>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visualization */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
                <div className="relative bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/30 glow-cyan">
                  <PublicGlyphVisualizer 
                    size={320}
                    showLabels={true}
                    animated={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <QBCText className="text-foreground">Geometric</QBCText>{' '}
              <QBCText className="text-primary">Security</QBCText>
            </h2>
            <QBCText as="p" className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A new paradigm in cryptography that combines sacred geometry with 
              lattice-based encryption for quantum-resistant security.
            </QBCText>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="card-qbc p-6 rounded-xl group hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-cyan transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <QBCHeading level={3} className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </QBCHeading>
                <QBCText as="p" className="text-muted-foreground text-sm">
                  {feature.description}
                </QBCText>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-qbc-radial opacity-30" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Globe className="h-16 w-16 text-primary mx-auto mb-6 logo-glow" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <QBCText>Ready for</QBCText>{' '}
              <QBCText className="text-primary text-glow-cyan">Signal Sovereignty</QBCText>
              <QBCText>?</QBCText>
            </h2>
            <QBCText as="p" className="text-lg text-muted-foreground mb-8">
              Start encrypting your messages with geometric security. 
              Free tier available for personal use.
            </QBCText>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/qbc/generator">
                <Button size="lg" className="btn-qbc-primary gap-2">
                  <QBCText>Start Encoding Free</QBCText>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/qbc/pricing">
                <Button size="lg" variant="outline" className="btn-qbc-outline">
                  <QBCText>View Enterprise Plans</QBCText>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </QBCPublicLayout>
  );
}
