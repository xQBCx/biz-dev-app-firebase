import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle } from "lucide-react";

interface NewsletterSignupProps {
  source?: string;
  variant?: 'default' | 'minimal' | 'card';
  className?: string;
}

export const NewsletterSignup = ({ 
  source = 'newsletter', 
  variant = 'default',
  className = '' 
}: NewsletterSignupProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert({
        email,
        source,
        lead_magnet: 'newsletter',
        subscribed_newsletter: true,
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: "You're already subscribed!", description: "Check your inbox for updates." });
          setIsSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({ title: "You're in!", description: "Weekly tips from Coach Bill are on the way." });
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className={`flex items-center gap-2 text-accent ${className}`}>
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">You're subscribed!</span>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Subscribe'}
        </Button>
      </form>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-primary text-primary-foreground rounded-xl p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5" />
          <h3 className="font-display font-bold">Weekly Tips from Coach Bill</h3>
        </div>
        <p className="text-primary-foreground/80 text-sm mb-4">
          No-BS fitness advice delivered to your inbox. No spam, just gains.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? '...' : 'Join'}
          </Button>
        </form>
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      <h3 className="font-display font-bold text-lg mb-2">Get Weekly Tips</h3>
      <p className="text-muted-foreground text-sm mb-3">
        Direct fitness advice from Coach Bill. No fluff.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );
};
