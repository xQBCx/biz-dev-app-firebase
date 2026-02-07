import { useState, useEffect } from "react";
import { BookingForm } from "@/components/BookingForm";
import VehicleAnalysis from "@/components/VehicleAnalysis";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "@/contexts/LocationContext";
import { LocationSelector } from "@/components/LocationSelector";
import { BookingTypeSelector, BookingType } from "@/components/BookingTypeSelector";
import { supabase } from "packages/supabase-client/src/client";

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

const Booking = () => {
  const navigate = useNavigate();
  const { locationConfig } = useLocation();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("type");
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [rebookData, setRebookData] = useState<RebookData | null>(null);
  const [isBookingForOther, setIsBookingForOther] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, []);

  const handleAnalysisComplete = (analysis: any, images: string[]) => {
    setAnalysisData(analysis);
    setVehicleImages(images);
    setActiveTab("book");
  };

  const handleBookingTypeSelect = (type: BookingType, rebook?: RebookData) => {
    setBookingType(type);
    
    if (type === "someone-else") {
      setIsBookingForOther(true);
      setActiveTab("analyze");
    } else if (type === "rebook" && rebook) {
      setRebookData(rebook);
      setActiveTab("book");
    } else {
      setActiveTab("analyze");
    }
  };

  const handleBackToType = () => {
    setActiveTab("type");
    setBookingType(null);
    setRebookData(null);
    setIsBookingForOther(false);
    setAnalysisData(null);
    setVehicleImages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="bg-background shadow-md"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      )}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={activeTab === "type" ? () => navigate("/") : handleBackToType}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {activeTab === "type" ? "Back to Home" : "Change Booking Type"}
          </Button>
          <LocationSelector />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {activeTab === "type" ? "Book Your Detail" : "Schedule Your Mobile Detailing"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {activeTab === "type" 
              ? "Choose how you\'d like to book your service"
              : `We bring professional detailing services directly to your location in ${locationConfig.city}, ${locationConfig.state}`
            }
          </p>
          {isBookingForOther && activeTab !== "type" && (
            <p className="text-sm text-primary mt-2 font-medium">
              Booking for someone else
            </p>
          )}
        </div>

        {activeTab === "type" ? (
          <div className="max-w-4xl mx-auto">
            <BookingTypeSelector onSelect={handleBookingTypeSelect} />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="analyze" disabled={bookingType === "rebook"}>
                1. Analyze Vehicle
              </TabsTrigger>
              <TabsTrigger value="book">2. Book Service</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analyze">
              <VehicleAnalysis onAnalysisComplete={handleAnalysisComplete} />
            </TabsContent>
            
            <TabsContent value="book">
              <BookingForm 
                analysisData={analysisData} 
                vehicleImages={vehicleImages}
                isBookingForOther={isBookingForOther}
                rebookData={rebookData}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Booking;