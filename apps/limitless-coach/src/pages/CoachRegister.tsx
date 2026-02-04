import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Dumbbell, Users, DollarSign,
  CheckCircle2, ArrowRight
} from "lucide-react";

const benefits = [
  "Access to the Limitless Coach client base",
  "Booking and scheduling tools",
  "Payment processing handled for you",
  "Marketing support and featured placement",
  "Only 5% platform fee per session",
];

const specialtyOptions = [
  "Strength Training",
  "Fat Loss",
  "HIIT",
  "Bodybuilding",
  "Functional Fitness",
  "Sports Performance",
  "Yoga/Mobility",
  "Rehabilitation",
  "Senior Fitness",
  "Beginners",
];

const CoachRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    certifications: "",
    specialties: [] as string[],
    bio: "",
    sessionPrice: "",
    agreed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('coach_profiles')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          experience: formData.experience,
          certifications: formData.certifications,
          specialties: formData.specialties,
          bio: formData.bio,
          session_price: parseFloat(formData.sessionPrice),
          status: 'pending',
        });

      if (error) throw error;
      
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 48 hours.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-accent" />
              <span className="font-display font-bold">Limitless Coach</span>
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold">Become a Coach Partner</h1>
          <p className="text-primary-foreground/70">
            Join our network and grow your coaching business
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {step === 1 && (
          <>
            {/* Benefits Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  Why Partner with Us?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Basic Info Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tell Us About Yourself</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Houston, TX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g., 5 years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                    placeholder="e.g., NASM-CPT, CSCS"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!formData.fullName || !formData.email || !formData.phone || !formData.location}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Specialties & Bio */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Your Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Specialties (select all that apply) *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialtyOptions.map(specialty => (
                      <Button
                        key={specialty}
                        type="button"
                        variant={formData.specialties.includes(specialty) ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => handleSpecialtyToggle(specialty)}
                      >
                        {formData.specialties.includes(specialty) && (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {specialty}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About You *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell potential clients about your coaching style, experience, and what makes you unique..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionPrice">Session Price ($/hour) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sessionPrice"
                      type="number"
                      value={formData.sessionPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, sessionPrice: e.target.value }))}
                      placeholder="75"
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You'll receive 95% of this amount. Platform fee is 5%.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Agreement */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreed"
                    checked={formData.agreed}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, agreed: checked as boolean }))
                    }
                  />
                  <Label htmlFor="agreed" className="text-sm leading-relaxed">
                    I agree to the Limitless Coach Partner Terms and understand that my application 
                    will be reviewed before approval. I certify that all information provided is accurate.
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={
                  !formData.specialties.length ||
                  !formData.bio ||
                  !formData.sessionPrice ||
                  !formData.agreed ||
                  isSubmitting
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CoachRegister;