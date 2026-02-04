import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Image as ImageIcon, CreditCard, AlertTriangle } from "lucide-react";
import { compressImage } from "@/lib/imageCompression";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocation } from "@/contexts/LocationContext";
import { ServiceQuestionnaire, QuestionnaireData } from "@/components/ServiceQuestionnaire";

const SERVICE_TYPES = [
  { value: "basic-wash", label: "Basic Wash & Vacuum - $150", price: 150 },
  { value: "full-detail", label: "Full Detail - $300", price: 300 },
  { value: "premium-detail", label: "Premium Detail - $500", price: 500 },
  { value: "exotic-detail", label: "Exotic/Luxury Detail - $750+", price: 750 },
  { value: "ceramic-coating", label: "Ceramic Coating - Quote", price: 0 },
  { value: "paint-correction", label: "Paint Correction - Quote", price: 0 },
];

const AVAILABLE_ADDONS = [
  { id: "engine-bay-cleaning", name: "Engine Bay Cleaning", price: 35 },
  { id: "engine-bay-deep", name: "Engine Bay Deep Cleaning", price: 50 },
  { id: "leather-protection", name: "Leather Protection & Conditioning", price: 40 },
  { id: "leather-ceramic", name: "Leather Seat Ceramic Coating", price: 50, note: "(Per Seat)" },
  { id: "carpet-seat-extraction", name: "Carpet Seat Extraction", price: 75 },
  { id: "carpet-floor-shampoo", name: "Carpet Floor Shampoo (Includes Mats)", price: 35 },
  { id: "pet-hair-removal", name: "Pet Hair Removal", price: 25 },
  { id: "car-seat-deep-clean", name: "Car Seat Deep Clean", price: 15 },
  { id: "decon-clay-bar", name: "Decon & Clay Bar", price: 100 },
  { id: "dashboard-uv-protectant", name: "Dashboard & Trim UV Protectant", price: 35 },
  { id: "headlight-restoration", name: "HeadLight Restoration", price: 65 },
  { id: "window-rain-repellant", name: "Window Rain Repellant", price: 50 },
  { id: "acid-water-spot", name: "ACID Water-spot Removing", price: 75 },
  { id: "mild-scratch-repair", name: "Mild scratch Repair", price: 75 },
  { id: "bodily-fluids", name: "Bodily Fluids/Throw up", price: 50 },
  { id: "odor-removal", name: "Odor Removal", price: 40 },
];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
];

interface RebookData {
  id: string;
  service_type: string;
  preferred_date: string;
  customer_name: string;
  vehicle_info: string;
  address: string;
  city: string;
  zip_code: string;
}

interface BookingFormProps {
  analysisData?: {
    vehicleType?: string;
    vehicleCondition?: string;
    recommendedServices?: Array<{ service: string; priority: string }>;
    estimatedDuration?: number;
    recommendedAddOns?: Array<{
      name: string;
      price: number;
      reason: string;
      priority: string;
    }>;
  };
  vehicleImages?: string[];
  isBookingForOther?: boolean;
  rebookData?: RebookData | null;
}

export const BookingForm = ({ analysisData, vehicleImages = [], isBookingForOther = false, rebookData }: BookingFormProps = {}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { locationConfig } = useLocation();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [analysisImages, setAnalysisImages] = useState<string[]>([]);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);

  // Load vehicle images from analysis
  useEffect(() => {
    if (vehicleImages && vehicleImages.length > 0) {
      setAnalysisImages(vehicleImages);
    }
  }, [vehicleImages]);
  const [businesses, setBusinesses] = useState<Array<{ id: string; business_name: string; city: string }>>([]);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_type: "",
    business_id: "",
    vehicle_info: "",
    preferred_date: "",
    preferred_time: "",
    address: "",
    city: locationConfig.city,
    zip_code: "",
    notes: "",
  });

  // Pre-fill form with AI analysis data
  useEffect(() => {
    if (analysisData) {
      const recommendedService = analysisData.recommendedServices?.[0]?.service;
      const vehicleInfo = `${analysisData.vehicleType || ''} - ${analysisData.vehicleCondition || ''}`.trim();
      
      setFormData(prev => ({
        ...prev,
        service_type: recommendedService || prev.service_type,
        vehicle_info: vehicleInfo || prev.vehicle_info,
        notes: analysisData.estimatedDuration 
          ? `AI Estimated Duration: ${analysisData.estimatedDuration} minutes\n\n${prev.notes}`
          : prev.notes,
      }));

      // Auto-select recommended add-ons with high priority
      if (analysisData.recommendedAddOns) {
        const highPriorityAddOns = analysisData.recommendedAddOns
          .filter(addon => addon.priority === 'recommended')
          .map(addon => {
            // Match addon name to ID in AVAILABLE_ADDONS
            const match = AVAILABLE_ADDONS.find(a => 
              a.name.toLowerCase().includes(addon.name.toLowerCase()) ||
              addon.name.toLowerCase().includes(a.name.toLowerCase())
            );
            return match?.id;
          })
          .filter(Boolean) as string[];
        
        setSelectedAddOns(highPriorityAddOns);
      }

      if (recommendedService) {
        toast({
          title: "AI Recommendations Applied",
          description: `We've pre-selected the ${recommendedService} service based on your vehicle analysis`,
        });
      }
    }
  }, [analysisData, toast]);

  // Pre-fill form with rebook data
  useEffect(() => {
    if (rebookData) {
      setFormData(prev => ({
        ...prev,
        customer_name: rebookData.customer_name || prev.customer_name,
        service_type: rebookData.service_type || prev.service_type,
        vehicle_info: rebookData.vehicle_info || prev.vehicle_info,
        address: rebookData.address || prev.address,
        city: rebookData.city || prev.city,
        zip_code: rebookData.zip_code || prev.zip_code,
      }));
      setShowQuestionnaire(false); // Skip questionnaire for rebook
      toast({
        title: "Rebooking Service",
        description: "We've pre-filled your details from the previous booking",
      });
    }
  }, [rebookData, toast]);

  // Check authentication on mount (but don't require it)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);

      // Load available businesses filtered by location
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("id, business_name, city")
        .ilike("city", `%${locationConfig.city}%`)
        .order("business_name");

      if (businessError) {
        console.error("Error loading businesses:", businessError);
      } else {
        setBusinesses(businessData || []);
      }
    };
    checkAuth();
  }, [locationConfig.city]);

  // Update city when location changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, city: locationConfig.city }));
  }, [locationConfig.city]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    // Validate total image count
    if (analysisImages.length + uploadedPhotos.length + validFiles.length > 5) {
      toast({
        title: "Too many photos",
        description: "You can upload a maximum of 5 photos total",
        variant: "destructive",
      });
      return;
    }

    // Compress images and create preview URLs
    try {
      const compressedFiles = await Promise.all(
        validFiles.map(file => compressImage(file))
      );
      const newPreviewUrls = compressedFiles.map(file => URL.createObjectURL(file));
      
      setUploadedPhotos(prev => [...prev, ...compressedFiles]);
      setPhotoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process images",
        variant: "destructive",
      });
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Build selected add-ons data with prices
      const addOnsData = selectedAddOns.map(addonId => {
        const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
        return addon ? { id: addon.id, name: addon.name, price: addon.price } : null;
      }).filter(Boolean);

      // Build notes with questionnaire data
      let notesWithQuestionnaire = formData.notes;
      if (questionnaireData) {
        const qSummary = [
          `--- Service Assessment ---`,
          `Exterior Condition: ${questionnaireData.exteriorCondition || 'Not specified'}`,
          `Interior Condition: ${questionnaireData.interiorCondition || 'Not specified'}`,
          `Seat Material: ${questionnaireData.seatMaterial || 'Not specified'}`,
          questionnaireData.exteriorNeeds.length > 0 ? `Exterior Services: ${questionnaireData.exteriorNeeds.join(', ')}` : null,
          questionnaireData.interiorNeeds.length > 0 ? `Interior Services: ${questionnaireData.interiorNeeds.join(', ')}` : null,
          questionnaireData.hasPetHair ? 'Has pet hair' : null,
          questionnaireData.hasStains ? 'Has stains' : null,
          questionnaireData.hasOdors ? 'Has odors' : null,
          questionnaireData.hasWaterSpots ? 'Has water spots' : null,
          questionnaireData.hasScratches ? 'Has scratches' : null,
          questionnaireData.additionalNotes ? `Customer Notes: ${questionnaireData.additionalNotes}` : null,
        ].filter(Boolean).join('\n');
        notesWithQuestionnaire = qSummary + (formData.notes ? `\n\n${formData.notes}` : '');
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          ...formData,
          notes: notesWithQuestionnaire,
          business_id: formData.business_id || null,
          user_id: user?.id || null, // Guest bookings have null user_id
          status: "pending",
          payment_status: "pending",
          selected_add_ons: addOnsData,
          ai_recommendations: analysisData || null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Upload photos if any
      if (uploadedPhotos.length > 0 && bookingData && user) {
        for (const photo of uploadedPhotos) {
          const fileExt = photo.name.split(".").pop();
          const fileName = `${bookingData.id}/customer_${Date.now()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("job-photos")
            .upload(fileName, photo);

          if (uploadError) {
            console.error("Photo upload error:", uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from("job-photos")
            .getPublicUrl(fileName);

          await supabase.from("job_photos").insert({
            booking_id: bookingData.id,
            uploaded_by: user.id,
            image_url: publicUrl,
            image_type: "before",
          });
        }
      }

      const successMessage = user 
        ? "Your booking has been saved. View it in your dashboard."
        : "Your booking has been received! We'll contact you at the email provided.";

      toast({
        title: "Booking Submitted!",
        description: successMessage,
      });

      // Show account creation prompt for guest users
      if (!user) {
        setShowAccountPrompt(true);
      }

      // Clean up preview URLs
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        service_type: "",
        business_id: "",
        vehicle_info: "",
        preferred_date: "",
        preferred_time: "",
        address: "",
        city: "",
        zip_code: "",
        notes: "",
      });
      setUploadedPhotos([]);
      setPhotoPreviewUrls([]);
      setSelectedAddOns([]);
      setAnalysisImages([]);

      // Only navigate to bookings page if user is logged in
      if (user) {
        setTimeout(() => navigate('/my-bookings'), 1500);
      } else {
        // For guests, show prompt for 3 seconds then go home
        setTimeout(() => {
          setShowAccountPrompt(false);
          navigate('/');
        }, 3000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionnaireComplete = (data: QuestionnaireData) => {
    setQuestionnaireData(data);
    setShowQuestionnaire(false);
    
    // Auto-select relevant add-ons based on questionnaire
    const autoSelectedAddOns: string[] = [...selectedAddOns];
    if (data.hasPetHair && !autoSelectedAddOns.includes("pet-hair-removal")) {
      autoSelectedAddOns.push("pet-hair-removal");
    }
    if (data.hasOdors && !autoSelectedAddOns.includes("odor-removal")) {
      autoSelectedAddOns.push("odor-removal");
    }
    if (data.hasStains && !autoSelectedAddOns.includes("carpet-seat-extraction")) {
      autoSelectedAddOns.push("carpet-seat-extraction");
    }
    if (data.seatMaterial === "Leather" && !autoSelectedAddOns.includes("leather-protection")) {
      autoSelectedAddOns.push("leather-protection");
    }
    if (data.hasWaterSpots && !autoSelectedAddOns.includes("acid-water-spot")) {
      autoSelectedAddOns.push("acid-water-spot");
    }
    if (data.hasScratches && !autoSelectedAddOns.includes("mild-scratch-repair")) {
      autoSelectedAddOns.push("mild-scratch-repair");
    }
    if (data.exteriorNeeds.includes("headlights") && !autoSelectedAddOns.includes("headlight-restoration")) {
      autoSelectedAddOns.push("headlight-restoration");
    }
    setSelectedAddOns(autoSelectedAddOns);
    
    toast({
      title: "Questionnaire Complete",
      description: "We've pre-selected recommended add-ons based on your responses",
    });
  };

  const handleQuestionnaireSkip = () => {
    setShowQuestionnaire(false);
  };

  if (checkingAuth) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showQuestionnaire) {
    return (
      <ServiceQuestionnaire
        onComplete={handleQuestionnaireComplete}
        onSkip={handleQuestionnaireSkip}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl">
          {isBookingForOther ? "Book for Someone Else" : "Book Your Detail"}
        </CardTitle>
        <CardDescription>
          {isBookingForOther
            ? "Enter the recipient's contact information below"
            : user 
              ? "Fill out the form below and we'll contact you to confirm your appointment"
              : "Book as a guest or sign in to track your bookings and earn rewards"
          }
        </CardDescription>
        {isBookingForOther && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Gift Booking
          </div>
        )}
        {!user && !isBookingForOther && (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Sign In for Account Benefits
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  required
                  value={formData.customer_name}
                  onChange={(e) => handleChange("customer_name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Phone *</Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => handleChange("customer_phone", e.target.value)}
                  placeholder="(713) 555-0123"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customer_email">Email *</Label>
              <Input
                id="customer_email"
                type="email"
                required
                value={formData.customer_email}
                onChange={(e) => handleChange("customer_email", e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Details</h3>
            
            <div>
              <Label htmlFor="business_id">Select Service Provider *</Label>
              {businesses.length === 0 ? (
                <div className="flex items-center justify-center h-10 px-3 py-2 border rounded-md bg-muted">
                  <span className="text-sm text-muted-foreground">No service providers available</span>
                </div>
              ) : (
                <Select
                  required
                  value={formData.business_id}
                  onValueChange={(value) => handleChange("business_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.business_name} - {business.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <Select
                required
                value={formData.service_type}
                onValueChange={(value) => handleChange("service_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicle_info">Vehicle Information *</Label>
              <Input
                id="vehicle_info"
                required
                value={formData.vehicle_info}
                onChange={(e) => handleChange("vehicle_info", e.target.value)}
                placeholder="e.g., 2023 Tesla Model S"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preferred Schedule</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="preferred_date">Preferred Date *</Label>
                <Input
                  id="preferred_date"
                  type="date"
                  required
                  value={formData.preferred_date}
                  onChange={(e) => handleChange("preferred_date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="preferred_time">Preferred Time *</Label>
                <Select
                  required
                  value={formData.preferred_time}
                  onValueChange={(value) => handleChange("preferred_time", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Service Location</h3>
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                required
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Houston"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  id="zip_code"
                  required
                  value={formData.zip_code}
                  onChange={(e) => handleChange("zip_code", e.target.value)}
                  placeholder="77001"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Photos (Optional with Warning) */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="vehicle_photos">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Vehicle Photos (Optional) {analysisImages.length > 0 && "- From Analysis"}
                </div>
              </Label>
              {analysisImages.length > 0 ? (
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  {analysisImages.length} image(s) from AI analysis. You can remove images or add up to {5 - analysisImages.length - uploadedPhotos.length} more (Max 5 total).
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Upload up to 5 photos of your vehicle (Max 5MB each). This helps us prepare for your service.
                </p>
              )}
              
              {/* No Photo Warning */}
              {analysisImages.length === 0 && uploadedPhotos.length === 0 && (
                <Alert variant="destructive" className="mb-3 bg-destructive/10 border-destructive/30">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Customer Assumed Risk Notice</AlertTitle>
                  <AlertDescription className="text-sm">
                    Without photos, we cannot provide accurate pricing estimates. Final pricing will be determined upon vehicle inspection. 
                    By proceeding without photos, you acknowledge that the quoted price may change based on actual vehicle condition.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Analysis Images */}
              {analysisImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-2">From Analysis:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analysisImages.map((url, index) => (
                      <div key={`analysis-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={`Analysis ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-primary"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setAnalysisImages(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional Uploaded Photos */}
              {photoPreviewUrls.length > 0 && (
                <div className="mb-4">
                  {analysisImages.length > 0 && (
                    <p className="text-xs font-medium mb-2">Additional Photos:</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={`upload-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(analysisImages.length + uploadedPhotos.length) < 5 && (
                <Label
                  htmlFor="vehicle_photos"
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload {analysisImages.length > 0 ? 'more ' : ''}photos ({analysisImages.length + uploadedPhotos.length}/5)
                      </p>
                    </div>
                  </div>
                </Label>
              )}
              
              <Input
                id="vehicle_photos"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          {/* Add-Ons Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Select Add-Ons</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {analysisData?.recommendedAddOns && analysisData.recommendedAddOns.length > 0
                  ? "Based on AI analysis, we've pre-selected recommended add-ons. You can adjust as needed."
                  : "Choose additional services to enhance your detailing package."}
              </p>
            </div>

            {/* AI Recommended Add-Ons */}
            {analysisData?.recommendedAddOns && analysisData.recommendedAddOns.length > 0 && (
              <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-primary">🤖 AI Recommended Add-Ons</h4>
                {analysisData.recommendedAddOns.map((addon, idx) => {
                  const matchedAddon = AVAILABLE_ADDONS.find(a => 
                    a.name.toLowerCase().includes(addon.name.toLowerCase()) ||
                    addon.name.toLowerCase().includes(a.name.toLowerCase())
                  );
                  
                  if (!matchedAddon) return null;
                  
                  return (
                    <div
                      key={`recommended-${idx}`}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        addon.priority === 'recommended' 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-muted border-border'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`addon-${matchedAddon.id}`}
                        checked={selectedAddOns.includes(matchedAddon.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAddOns(prev => [...prev, matchedAddon.id]);
                          } else {
                            setSelectedAddOns(prev => prev.filter(id => id !== matchedAddon.id));
                          }
                        }}
                        className="mt-1 h-4 w-4"
                      />
                      <label htmlFor={`addon-${matchedAddon.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">
                            {matchedAddon.name} {matchedAddon.note && <span className="text-xs text-muted-foreground">{matchedAddon.note}</span>}
                          </span>
                          <span className="text-lg font-semibold text-primary">
                            ${matchedAddon.price}+
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{addon.reason}</p>
                        {addon.priority === 'recommended' && (
                          <span className="inline-block mt-1 text-xs font-semibold uppercase px-2 py-1 rounded bg-primary/10 text-primary">
                            Recommended
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All Available Add-Ons */}
            <div className="space-y-2">
              <h4 className="font-medium">All Available Add-Ons</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_ADDONS.map((addon) => {
                  // Skip if already shown in recommended
                  const isRecommended = analysisData?.recommendedAddOns?.some(recAddon =>
                    addon.name.toLowerCase().includes(recAddon.name.toLowerCase()) ||
                    recAddon.name.toLowerCase().includes(addon.name.toLowerCase())
                  );
                  
                  if (isRecommended) return null;
                  
                  return (
                    <div
                      key={addon.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`addon-${addon.id}`}
                        checked={selectedAddOns.includes(addon.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAddOns(prev => [...prev, addon.id]);
                          } else {
                            setSelectedAddOns(prev => prev.filter(id => id !== addon.id));
                          }
                        }}
                        className="mt-1 h-4 w-4"
                      />
                      <label htmlFor={`addon-${addon.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {addon.name} {addon.note && <span className="text-xs text-muted-foreground">{addon.note}</span>}
                          </span>
                          <span className="font-semibold text-primary">
                            ${addon.price}+
                          </span>
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Estimate Calculation */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
              <h4 className="font-semibold text-primary">Estimated Price Summary</h4>
              
              {/* Base Service */}
              <div className="flex justify-between items-center">
                <span className="text-sm">Base Service:</span>
                <span className="font-semibold">
                  {formData.service_type 
                    ? `$${SERVICE_TYPES.find(s => s.value === formData.service_type)?.price || 0}${SERVICE_TYPES.find(s => s.value === formData.service_type)?.price === 0 ? ' (Quote)' : '+'}`
                    : 'Select a service'}
                </span>
              </div>

              {/* Add-Ons */}
              {selectedAddOns.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Add-Ons ({selectedAddOns.length}):</span>
                  <span className="font-semibold">
                    ${selectedAddOns.reduce((total, addonId) => {
                      const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
                      return total + (addon?.price || 0);
                    }, 0)}+
                  </span>
                </div>
              )}

              {/* Separator */}
              <div className="border-t border-primary/20 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Estimated Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${(() => {
                      const servicePrice = SERVICE_TYPES.find(s => s.value === formData.service_type)?.price || 0;
                      const addOnsPrice = selectedAddOns.reduce((total, addonId) => {
                        const addon = AVAILABLE_ADDONS.find(a => a.id === addonId);
                        return total + (addon?.price || 0);
                      }, 0);
                      return servicePrice + addOnsPrice;
                    })()}+
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Final pricing may vary based on vehicle condition and inspection. 
                {selectedAddOns.length > 0 && ` ${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? 's' : ''} selected.`}
              </p>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Any special requests or details about your vehicle?"
              rows={4}
            />
          </div>

          {/* Payment Section - Placeholder */}
          <Alert>
            <CreditCard className="h-4 w-4" />
            <AlertTitle>Payment Integration Coming Soon</AlertTitle>
            <AlertDescription>
              Stripe payment integration will be configured to accept payments securely.
              For now, bookings are submitted without payment.
            </AlertDescription>
          </Alert>

          {/* Account Benefits for Guests */}
          {!user && (
            <Alert>
              <AlertTitle>💎 Create an Account for Extra Benefits</AlertTitle>
              <AlertDescription>
                Track your bookings, earn loyalty points, get priority scheduling, and receive exclusive offers!
              </AlertDescription>
            </Alert>
          )}

          {/* Account Creation Success Prompt */}
          {showAccountPrompt && (
            <Alert className="bg-primary/10 border-primary">
              <AlertTitle>✨ Want to track this booking?</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Create an account to view your booking history and earn rewards!</p>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="mt-2"
                >
                  Create Free Account
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              user ? "Submit Booking Request" : "Book as Guest"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
