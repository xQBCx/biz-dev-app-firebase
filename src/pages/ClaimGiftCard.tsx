import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Gift, Loader2, CheckCircle, ExternalLink } from 'lucide-react';

export default function ClaimGiftCard() {
  const { claimUrl } = useParams<{ claimUrl: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [claimedCard, setClaimedCard] = useState<any>(null);

  const handleClaim = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-gift-card', {
        body: { claim_url: claimUrl, email }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setClaimedCard(data.card);
      toast.success('Gift card claimed successfully!');
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.error(error.message || 'Failed to claim gift card');
    } finally {
      setLoading(false);
    }
  };

  if (claimedCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Gift Card Claimed!</CardTitle>
            {claimedCard.occasion_title && (
              <CardDescription className="text-xl">{claimedCard.occasion_title}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {claimedCard.occasion_message && (
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg">
                <p className="text-lg italic text-center">{claimedCard.occasion_message}</p>
                {claimedCard.sender_name && (
                  <p className="text-sm text-center mt-3 text-muted-foreground">
                    From: {claimedCard.sender_name}
                  </p>
                )}
              </div>
            )}

            {claimedCard.brand_logo_url && (
              <div className="flex justify-center">
                <img 
                  src={claimedCard.brand_logo_url} 
                  alt={claimedCard.brand_name || 'Brand'} 
                  className="max-h-20 object-contain"
                />
              </div>
            )}

            <div className="bg-card border-2 border-primary/20 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                {claimedCard.provider_logo && (
                  <img 
                    src={claimedCard.provider_logo} 
                    alt={claimedCard.provider_name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{claimedCard.product_name}</h3>
                  <p className="text-sm text-muted-foreground">{claimedCard.provider_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Card Value</p>
                  <p className="text-2xl font-bold">${claimedCard.face_value}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold">${claimedCard.remaining_value}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Gift Card Code</p>
                <div className="bg-muted p-3 rounded font-mono text-center text-lg">
                  {claimedCard.card_code}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="font-medium">{new Date(claimedCard.expires_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              {claimedCard.redemption_url && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => window.open(claimedCard.redemption_url, '_blank')}
                >
                  Redeem Now <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/ai-gift-cards')}
              >
                Browse More Gift Cards
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>Gift card details have been sent to {email}</p>
              <p className="mt-2">Powered by AI Gift Cards™</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Claim Your Gift Card</CardTitle>
          <CardDescription>
            Enter your email to claim this gift and receive your card details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button 
            onClick={handleClaim} 
            disabled={loading || !email}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim Gift Card'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By claiming, you agree to receive your gift card details via email
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
