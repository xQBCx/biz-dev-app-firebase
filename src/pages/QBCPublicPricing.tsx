import { Helmet } from 'react-helmet-async';
import { Check, ChevronRight, Zap, Building2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QBCPublicLayout } from '@/components/qbc/QBCPublicLayout';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    icon: Zap,
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out QBC encoding',
    features: [
      'Public glyph generator',
      "Metatron's Cube lattice",
      'A-L character set',
      'SVG & PNG export',
      'Content hashing',
      'Community support'
    ],
    cta: 'Start Free',
    href: '/qbc/generator',
    highlighted: false
  },
  {
    name: 'Pro',
    icon: Rocket,
    price: '$49',
    period: '/month',
    description: 'Full access to QBC Studio and custom lattices',
    features: [
      'Everything in Free',
      'QBC Studio dashboard',
      'Custom lattice designer',
      'Full A-Z character set',
      '3D lattice support',
      'Bio-key generation',
      'MESH 34 routing (basic)',
      'API access (1,000 req/day)',
      'Priority support'
    ],
    cta: 'Start Pro Trial',
    href: '/auth',
    highlighted: true
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: 'per org',
    description: 'Full infrastructure for organizations',
    features: [
      'Everything in Pro',
      'Unlimited API requests',
      'MESH 34 full routing',
      'Bio-acoustic key vault',
      'XODIAK ledger anchoring',
      'Custom lattice library',
      'SSO integration',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option'
    ],
    cta: 'Contact Sales',
    href: '/qbc/about',
    highlighted: false
  }
];

export default function QBCPublicPricing() {
  return (
    <QBCPublicLayout>
      <Helmet>
        <title>Pricing | Quantum Bit Code</title>
        <meta name="description" content="QBC pricing plans for individuals, teams, and enterprises. Start free, scale securely." />
      </Helmet>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Simple, Transparent</span>{' '}
              <span className="text-primary text-glow-cyan">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with our free generator. Upgrade when you need custom lattices, 
              API access, or enterprise features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, idx) => (
              <div 
                key={idx}
                className={cn(
                  "card-qbc rounded-xl p-8 relative flex flex-col",
                  tier.highlighted && "border-primary/50 glow-cyan"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <tier.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {tier.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to={tier.href} className="mt-auto">
                  <Button 
                    className={cn(
                      "w-full gap-2",
                      tier.highlighted ? "btn-qbc-primary" : "btn-qbc-outline"
                    )}
                  >
                    {tier.cta}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">
              <span className="text-foreground">Frequently Asked</span>{' '}
              <span className="text-primary">Questions</span>
            </h2>

            <div className="space-y-6">
              <div className="card-qbc rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Can I use QBC for commercial projects?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes! The Free tier is suitable for personal and small commercial use. 
                  For production applications with API access, we recommend Pro or Enterprise.
                </p>
              </div>

              <div className="card-qbc rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  What is MESH 34 routing?
                </h3>
                <p className="text-sm text-muted-foreground">
                  MESH 34 is our distributed transport protocol for secure message delivery. 
                  It routes encrypted glyphs through a network of nodes for privacy and redundancy.
                </p>
              </div>

              <div className="card-qbc rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  How do bio-acoustic keys work?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Bio-keys are generated from natural audio entropy sources (birdsong, seismic activity, etc.). 
                  The audio's spectral features are mapped to lattice coordinates to create unique, 
                  unreproducible encryption keys.
                </p>
              </div>

              <div className="card-qbc rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Is QBC actually quantum-resistant?
                </h3>
                <p className="text-sm text-muted-foreground">
                  QBC uses lattice-based cryptography principles which are considered 
                  quantum-resistant by current research. The geometric encoding adds an 
                  additional layer that requires the specific lattice configuration to decode.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Need a custom solution for your organization?
            </p>
            <Link to="/qbc/about">
              <Button className="btn-qbc-primary gap-2">
                Contact Our Team
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </QBCPublicLayout>
  );
}
