import React, { useState, useEffect } from 'react';
import { format, addDays, startOfDay, parseISO } from 'date-fns';
import { Calendar, Clock, User, Building, Mail, Phone, FileText, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface ConsultantInfo {
  id: string;
  displayName: string;
  title: string;
  bio: string;
  avatarUrl: string;
  timezone: string;
  defaultRate30min: number;
  defaultRateHourly: number;
  firstCallRate: number;
  minBookingDuration: number;
  maxBookingDuration: number;
  ndaRequired: boolean;
  ndaContent: string;
}

interface ConsultantBookingWidgetProps {
  consultantSlug: string;
  embedded?: boolean;
}

const DEFAULT_NDA_CONTENT = `
MUTUAL NON-DISCLOSURE AGREEMENT

By proceeding with this consultation, both parties agree to the following terms:

1. CONFIDENTIALITY
Both the Consultant and Client agree to maintain confidentiality of any proprietary information, business strategies, or sensitive data shared during the consultation.

2. ACKNOWLEDGMENT OF CONSULTANT'S EXPERIENCE
The Client acknowledges that the Consultant has extensive experience across multiple industries including technology, energy, entertainment, fashion, and business development. The Client understands that:

   a) The Consultant may have encountered similar ideas, concepts, or business models through prior work with other clients or personal experience.
   
   b) The fact that the Consultant has heard a similar idea before does not constitute a breach of this agreement or imply that the Client's specific implementation is not unique.
   
   c) The Consultant will not use the Client's specific confidential information (such as proprietary data, trade secrets, or detailed implementation plans) for the benefit of other clients or ventures.

3. REASONABLE EXPECTATIONS
The Client understands that:
   
   a) General business strategies, industry knowledge, and commonly known practices are not considered confidential.
   
   b) The Consultant may provide similar advice to other clients facing similar challenges.
   
   c) Ideas disclosed during the consultation may already exist in the public domain or be independently developed by others.

4. PROFESSIONAL RELATIONSHIP
The Consultant's primary interest is in building successful, long-term client relationships. Misappropriating client information would be contrary to the Consultant's professional reputation and business interests.

5. DURATION
This agreement remains in effect for two (2) years from the date of the consultation.

By booking this consultation, you acknowledge that you have read, understood, and agree to these terms.
`;

export function ConsultantBookingWidget({ consultantSlug, embedded = false }: ConsultantBookingWidgetProps) {
  const [step, setStep] = useState<'loading' | 'date' | 'time' | 'details' | 'payment'>('loading');
  const [consultant, setConsultant] = useState<ConsultantInfo | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
    accessCode: '',
    ndaAccepted: false,
  });
  
  // Pricing
  const [pricing, setPricing] = useState({
    original: 0,
    discount: 0,
    final: 0,
    isFirstTime: false,
  });

  // Load consultant and availability
  useEffect(() => {
    loadAvailability();
  }, [consultantSlug]);

  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const startDate = startOfDay(new Date());
      const endDate = addDays(startDate, 30);

      const { data, error } = await supabase.functions.invoke('get-consultant-availability', {
        body: {
          consultantSlug,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      if (error) throw error;

      setConsultant(data.consultant);
      setAvailableSlots(data.slots);
      setStep('date');
    } catch (error: any) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = new Set(availableSlots.map(slot => slot.date));
    return Array.from(dates).sort();
  };

  const getSlotsForDate = (date: string) => {
    return availableSlots.filter(slot => slot.date === date);
  };

  const calculatePrice = () => {
    if (!consultant) return;

    let original: number;
    if (selectedDuration <= 30) {
      original = pricing.isFirstTime ? consultant.firstCallRate : consultant.defaultRate30min;
    } else {
      original = (consultant.defaultRateHourly / 60) * selectedDuration;
    }

    // TODO: Apply access code discount
    setPricing(prev => ({
      ...prev,
      original,
      final: original - prev.discount,
    }));
  };

  useEffect(() => {
    calculatePrice();
  }, [selectedDuration, consultant, pricing.isFirstTime]);

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(parseISO(dateStr));
    setSelectedSlot(null);
    setStep('time');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !consultant) return;

    if (!formData.name || !formData.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    if (consultant.ndaRequired && !formData.ndaAccepted) {
      toast.error('Please accept the NDA to proceed');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-consultation-checkout', {
        body: {
          consultantSlug,
          bookerEmail: formData.email,
          bookerName: formData.name,
          bookerCompany: formData.company,
          bookerPhone: formData.phone,
          startTime: selectedSlot.startTime,
          durationMinutes: selectedDuration,
          accessCode: formData.accessCode,
          bookingNotes: formData.notes,
          ndaAccepted: formData.ndaAccepted,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      if (error) throw error;

      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else if (data.status === 'confirmed') {
        // Free booking confirmed
        toast.success('Booking confirmed! Check your email for details.');
        setStep('payment');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!consultant) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Consultant not found or unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  const availableDates = getAvailableDates();

  return (
    <Card className={embedded ? 'border-0 shadow-none' : ''}>
      <CardHeader>
        <div className="flex items-center gap-4">
          {consultant.avatarUrl && (
            <img
              src={consultant.avatarUrl}
              alt={consultant.displayName}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div>
            <CardTitle>{consultant.displayName}</CardTitle>
            {consultant.title && <CardDescription>{consultant.title}</CardDescription>}
          </div>
        </div>
        {consultant.bio && <p className="mt-4 text-sm text-muted-foreground">{consultant.bio}</p>}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center gap-2 ${step === 'date' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Calendar className="h-4 w-4" />
            <span>Date</span>
          </div>
          <div className="h-px flex-1 bg-border mx-2" />
          <div className={`flex items-center gap-2 ${step === 'time' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Clock className="h-4 w-4" />
            <span>Time</span>
          </div>
          <div className="h-px flex-1 bg-border mx-2" />
          <div className={`flex items-center gap-2 ${step === 'details' ? 'text-primary' : 'text-muted-foreground'}`}>
            <User className="h-4 w-4" />
            <span>Details</span>
          </div>
          <div className="h-px flex-1 bg-border mx-2" />
          <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
            <DollarSign className="h-4 w-4" />
            <span>Confirm</span>
          </div>
        </div>

        {/* Date Selection */}
        {step === 'date' && (
          <div className="space-y-4">
            <h3 className="font-medium">Select a Date</h3>
            {availableDates.length === 0 ? (
              <p className="text-muted-foreground">No available dates in the next 30 days.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {availableDates.slice(0, 15).map(dateStr => {
                  const date = parseISO(dateStr);
                  return (
                    <Button
                      key={dateStr}
                      variant="outline"
                      className="flex flex-col h-auto py-3"
                      onClick={() => handleDateSelect(dateStr)}
                    >
                      <span className="text-xs text-muted-foreground">
                        {format(date, 'EEE')}
                      </span>
                      <span className="text-lg font-semibold">
                        {format(date, 'd')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(date, 'MMM')}
                      </span>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Time Selection */}
        {step === 'time' && selectedDate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setStep('date')}>
                Change
              </Button>
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedDuration === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDuration(30)}
                >
                  30 min - ${consultant.defaultRate30min}
                </Button>
                <Button
                  variant={selectedDuration === 60 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDuration(60)}
                >
                  60 min - ${consultant.defaultRateHourly}
                </Button>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <Label>Available Times</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {getSlotsForDate(format(selectedDate, 'yyyy-MM-dd')).map((slot, idx) => (
                  <Button
                    key={idx}
                    variant={selectedSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSlotSelect(slot)}
                  >
                    {format(parseISO(slot.startTime), 'h:mm a')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contact Details */}
        {step === 'details' && selectedSlot && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">
                  {format(parseISO(selectedSlot.startTime), 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedSlot.startTime), 'h:mm a')} - {selectedDuration} minutes
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('time')}>
                Change
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Your full name"
                    className="pl-10"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company">Company (optional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Your company"
                    className="pl-10"
                    value={formData.company}
                    onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10"
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">What would you like to discuss?</Label>
                <Textarea
                  id="notes"
                  placeholder="Brief description of your goals or questions..."
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="accessCode">Access Code (optional)</Label>
                <Input
                  id="accessCode"
                  placeholder="Enter code for discount"
                  value={formData.accessCode}
                  onChange={e => setFormData(prev => ({ ...prev, accessCode: e.target.value.toUpperCase() }))}
                />
              </div>

              {/* NDA Acceptance */}
              {consultant.ndaRequired && (
                <div className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="nda"
                      checked={formData.ndaAccepted}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, ndaAccepted: checked === true }))
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="nda"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the Mutual Non-Disclosure Agreement
                      </label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3 mr-1" />
                            Read NDA
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Mutual Non-Disclosure Agreement</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] pr-4">
                            <div className="prose prose-sm">
                              <pre className="whitespace-pre-wrap font-sans text-sm">
                                {consultant.ndaContent || DEFAULT_NDA_CONTENT}
                              </pre>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">${pricing.final.toFixed(2)}</p>
                  </div>
                  {pricing.isFirstTime && (
                    <Badge variant="secondary">First-time caller rate</Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.email || (consultant.ndaRequired && !formData.ndaAccepted)}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : pricing.final > 0 ? (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Proceed to Payment - ${pricing.final.toFixed(2)}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === 'payment' && (
          <div className="text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
            <p className="text-muted-foreground">
              Check your email for confirmation details and the meeting link.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
