import { Helmet } from 'react-helmet-async';
import { 
  Hexagon, 
  BookOpen, 
  Code, 
  Shield, 
  Network,
  Fingerprint,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QBCPublicLayout } from '@/components/qbc/QBCPublicLayout';
import { Link } from 'react-router-dom';

const docSections = [
  {
    icon: Hexagon,
    title: "Metatron's Cube Encoding",
    description: "Learn how text is transformed into geometric paths using the 13-vertex lattice structure.",
    topics: ["Lattice geometry", "Character mapping", "Path generation", "Tick marks for repeats"]
  },
  {
    icon: Shield,
    title: "Post-Quantum Security",
    description: "Understanding the cryptographic foundations that make QBC quantum-resistant.",
    topics: ["Lattice-based cryptography", "SHA-256 hashing", "Key derivation", "Attack resistance"]
  },
  {
    icon: Network,
    title: "MESH 34 Transport",
    description: "Distributed routing protocol for secure message delivery across networks.",
    topics: ["Node architecture", "Routing algorithms", "Redundancy", "Privacy preservation"]
  },
  {
    icon: Fingerprint,
    title: "Bio-Acoustic Keys",
    description: "Generate unique encryption keys from natural entropy sources.",
    topics: ["Audio capture", "Spectral analysis", "Lattice mapping", "Key derivation"]
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Complete documentation for integrating QBC into your applications.",
    topics: ["REST endpoints", "SDK usage", "Authentication", "Rate limits"]
  },
  {
    icon: BookOpen,
    title: "Integration Guides",
    description: "Step-by-step tutorials for common integration scenarios.",
    topics: ["Quick start", "React integration", "Node.js backend", "Mobile apps"]
  }
];

export default function QBCPublicDocs() {
  return (
    <QBCPublicLayout>
      <Helmet>
        <title>Documentation | Quantum Bit Code</title>
        <meta name="description" content="Technical documentation for QBC geometric encryption, MESH 34 routing, and API integration." />
      </Helmet>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Technical</span>{' '}
              <span className="text-primary text-glow-cyan">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to understand and integrate Quantum Bit Code 
              into your security infrastructure.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/qbc/generator">
              <Button variant="outline" className="btn-qbc-outline gap-2">
                Try Generator
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="btn-qbc-outline gap-2">
              View on GitHub
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {/* Documentation Sections */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {docSections.map((section, idx) => (
              <div 
                key={idx}
                className="card-qbc rounded-xl p-6 group hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-cyan transition-all duration-300">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {section.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {section.description}
                </p>
                <ul className="space-y-1">
                  {section.topics.map((topic, tidx) => (
                    <li key={tidx} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/50" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* How It Works Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">
              <span className="text-foreground">How QBC</span>{' '}
              <span className="text-primary">Works</span>
            </h2>

            <div className="space-y-8">
              <div className="card-qbc rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  1. Text Normalization
                </h3>
                <p className="text-muted-foreground text-sm">
                  Input text is normalized to uppercase and mapped to the available 
                  character set (A-Z for Metatron's Cube). Unsupported characters 
                  are replaced with their closest phonetic equivalent.
                </p>
                <pre className="mt-4 p-4 bg-muted/20 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
{`"Hello World" → "HELLO WORLD"
"café" → "CAFE"`}
                </pre>
              </div>

              <div className="card-qbc rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  2. Lattice Mapping
                </h3>
                <p className="text-muted-foreground text-sm">
                  Each character is mapped to a vertex position on Metatron's Cube. 
                  The 13-vertex structure provides positions for A-L plus a center 
                  point for spaces.
                </p>
                <pre className="mt-4 p-4 bg-muted/20 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
{`A → (0.5, 0.15)  // top vertex
B → (0.8, 0.325) // top-right
...
' ' → (0.5, 0.5) // center`}
                </pre>
              </div>

              <div className="card-qbc rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  3. Path Generation
                </h3>
                <p className="text-muted-foreground text-sm">
                  The encoder traces a continuous path through the lattice, 
                  connecting character positions. Repeated characters trigger 
                  "tick" marks perpendicular to the path direction.
                </p>
                <pre className="mt-4 p-4 bg-muted/20 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
{`PathEvent: { type: 'move' | 'line' | 'tick', x, y }
"AA" → move(A) → tick → line(A)`}
                </pre>
              </div>

              <div className="card-qbc rounded-xl p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">
                  4. Content Hashing
                </h3>
                <p className="text-muted-foreground text-sm">
                  A SHA-256 hash is generated from the canonical text to create 
                  a verifiable fingerprint. This hash can be anchored to the 
                  XODIAK ledger for immutable proof.
                </p>
                <pre className="mt-4 p-4 bg-muted/20 rounded-lg text-xs font-mono text-foreground overflow-x-auto">
{`sha256("HELLO") → "2cf24dba5fb0a30e..."`}
                </pre>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Ready to integrate QBC into your application?
            </p>
            <Link to="/qbc/pricing">
              <Button className="btn-qbc-primary gap-2">
                Get API Access
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </QBCPublicLayout>
  );
}
