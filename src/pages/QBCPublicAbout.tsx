import { Helmet } from 'react-helmet-async';
import { 
  Hexagon, 
  Users, 
  Target, 
  Globe,
  Mail,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { QBCPublicLayout } from '@/components/qbc/QBCPublicLayout';
import { Link } from 'react-router-dom';

export default function QBCPublicAbout() {
  return (
    <QBCPublicLayout>
      <Helmet>
        <title>About | Quantum Bit Code</title>
        <meta name="description" content="Learn about QBC's mission to provide signal sovereignty through geometric encryption." />
      </Helmet>

      {/* Hero */}
      <section className="py-12 md:py-20 relative">
        <div className="absolute inset-0 bg-qbc-radial opacity-50" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Hexagon className="h-16 w-16 text-primary mx-auto mb-6 logo-glow" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">About</span>{' '}
              <span className="text-primary text-glow-cyan">Quantum Bit Code</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Building the infrastructure for signal sovereignty in the quantum age.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-qbc rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Our Mission</h3>
              <p className="text-sm text-muted-foreground">
                Democratize access to post-quantum encryption through 
                intuitive, visual cryptographic tools.
              </p>
            </div>

            <div className="card-qbc rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Our Vision</h3>
              <p className="text-sm text-muted-foreground">
                A world where individuals and organizations have complete 
                sovereignty over their digital communications.
              </p>
            </div>

            <div className="card-qbc rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Our Approach</h3>
              <p className="text-sm text-muted-foreground">
                Combine ancient sacred geometry with modern cryptography 
                for security that's both powerful and beautiful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              <span className="text-foreground">The</span>{' '}
              <span className="text-primary">Story</span>
            </h2>
            
            <div className="card-qbc rounded-xl p-8 space-y-4">
              <p className="text-muted-foreground">
                Quantum Bit Code was born from a simple question: What if we could 
                encode information in the same geometric patterns that have fascinated 
                humanity for millennia?
              </p>
              <p className="text-muted-foreground">
                Metatron's Cube—a figure from sacred geometry containing all five 
                Platonic solids—became our foundation. By mapping characters to vertices 
                and tracing paths through the lattice, we created a visual encryption 
                system that's both quantum-resistant and intuitively verifiable.
              </p>
              <p className="text-muted-foreground">
                Today, QBC powers secure communications for individuals, enterprises, 
                and organizations who believe that privacy is a fundamental right, 
                not a luxury.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-12 md:py-16 bg-muted/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-foreground">Powered by</span>{' '}
              <span className="text-primary">Biz Dev</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              QBC is developed and managed by Biz Dev Services, a platform for 
              building and scaling innovative technology ventures.
            </p>
            <a 
              href="https://bdsrvs.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="btn-qbc-outline gap-2">
                Learn About Biz Dev
                <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4 logo-glow" />
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-foreground">Get in</span>{' '}
                <span className="text-primary">Touch</span>
              </h2>
              <p className="text-muted-foreground">
                Questions about QBC? Interested in enterprise solutions? 
                We'd love to hear from you.
              </p>
            </div>

            <form className="card-qbc rounded-xl p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    className="input-qbc mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="your@email.com" 
                    className="input-qbc mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject" className="text-foreground">Subject</Label>
                <Input 
                  id="subject" 
                  placeholder="How can we help?" 
                  className="input-qbc mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-foreground">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us more..."
                  rows={5}
                  className="input-qbc mt-1 resize-none"
                />
              </div>

              <Button type="submit" className="w-full btn-qbc-primary gap-2">
                Send Message
                <ChevronRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </QBCPublicLayout>
  );
}
