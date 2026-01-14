import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConsultantBookingWidget } from '@/components/booking/ConsultantBookingWidget';
import { supabase } from '@/integrations/supabase/client';

export default function BookConsultant() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const cancelled = searchParams.get('cancelled');
  
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-consultation-payment', {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      if (data.success) {
        setVerified(true);
        setBookingDetails(data.booking);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    } finally {
      setVerifying(false);
    }
  };

  // Payment verification loading
  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Verifying your payment...</h2>
            <p className="text-muted-foreground">Please wait while we confirm your booking.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment success
  if (verified && bookingDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Booking Confirmed | BDSRVS</title>
        </Helmet>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your consultation with {bookingDetails.consultantName} has been scheduled.
              </p>
              
              <div className="text-left p-4 rounded-lg bg-muted/50 space-y-2">
                <p><strong>Date:</strong> {new Date(bookingDetails.startTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}</p>
                <p><strong>Time:</strong> {new Date(bookingDetails.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}</p>
                {bookingDetails.meetingLink && (
                  <p><strong>Meeting Link:</strong>{' '}
                    <a href={bookingDetails.meetingLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Join Meeting
                    </a>
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                A confirmation email with all details has been sent to your inbox.
              </p>

              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link to="/bdsrvs">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to BDSRVS
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Cancelled payment
  if (cancelled) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Booking Cancelled | BDSRVS</title>
        </Helmet>

        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-6">
              <h1 className="text-2xl font-bold">Booking Cancelled</h1>
              <p className="text-muted-foreground">
                Your booking was cancelled. No payment was processed.
              </p>
              <Button asChild>
                <Link to={`/book/${slug}`}>
                  Try Again
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main booking widget
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Book a Consultation | BDSRVS</title>
        <meta name="description" content="Schedule a consultation with a BDSRVS advisor. Expert business development guidance tailored to your needs." />
      </Helmet>

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/bdsrvs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to BDSRVS
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          {slug ? (
            <ConsultantBookingWidget consultantSlug={slug} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No consultant specified.</p>
                <Button asChild className="mt-4">
                  <Link to="/bdsrvs">Go to BDSRVS</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
