import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Mic, MapPin, Send, Loader2, Building2, X } from "lucide-react";
import { CompanySelector } from "./CompanySelector";
import { useInstincts } from "@/hooks/useInstincts";

interface CaptureData {
  photo: string | null;
  voiceNote: string | null;
  lat: number | null;
  lon: number | null;
  address: string | null;
  notes: string;
  selectedCompanyIds: string[];
}

export const DriveByCapture = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { trackEntityCreated, trackClick } = useInstincts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [captureData, setCaptureData] = useState<CaptureData>({
    photo: null,
    voiceNote: null,
    lat: null,
    lon: null,
    address: null,
    notes: "",
    selectedCompanyIds: [],
  });

  const getCurrentLocation = useCallback(async () => {
    return new Promise<{ lat: number; lon: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lon: position.coords.longitude }),
        (error) => reject(error),
        { enableHighAccuracy: true }
      );
    });
  }, []);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const location = await getCurrentLocation();
          const address = await reverseGeocode(location.lat, location.lon);
          setCaptureData((prev) => ({ ...prev, photo: base64, lat: location.lat, lon: location.lon, address }));
        } catch {
          setCaptureData((prev) => ({ ...prev, photo: base64 }));
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCapturing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => setCaptureData((prev) => ({ ...prev, voiceNote: reader.result as string }));
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => { if (mediaRecorderRef.current?.state === "recording") stopRecording(); }, 60000);
    } catch {
      toast({ title: "Microphone Error", description: "Could not access microphone", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) { toast({ title: "Please sign in to capture leads", variant: "destructive" }); return; }
    if (!captureData.photo && !captureData.notes) { toast({ title: "Add a photo or notes to continue", variant: "destructive" }); return; }

    setIsSubmitting(true);
    try {
      let photoUrl = null;
      if (captureData.photo) {
        const base64Data = captureData.photo.split(",")[1];
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage.from("construction-documents").upload(fileName, Uint8Array.from(atob(base64Data), c => c.charCodeAt(0)), { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("construction-documents").getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }

      const { data: capture, error } = await supabase.from("field_capture").insert({ captured_by: user.id, lat: captureData.lat, lon: captureData.lon, address: captureData.address, photo_url: photoUrl, notes: captureData.notes, status: "new" }).select().single();
      if (error) throw error;

      if (photoUrl) {
        await supabase.functions.invoke("driveby-process", { body: { captureId: capture.id, photoUrl, companyIds: captureData.selectedCompanyIds } });
      }

      trackEntityCreated("driveby", "field_capture", capture.id, "Drive-By Capture");
      toast({ title: "Capture saved!", description: "Processing in background..." });
      setCaptureData({ photo: null, voiceNote: null, lat: null, lon: null, address: null, notes: "", selectedCompanyIds: [] });
    } catch (error) {
      console.error("Capture error:", error);
      toast({ title: "Failed to save capture", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" />Quick Capture</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="relative border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
            {captureData.photo ? (
              <div className="relative">
                <img src={captureData.photo} alt="Capture" className="max-h-64 mx-auto rounded-lg" />
                <Button size="icon" variant="destructive" className="absolute top-2 right-2" onClick={(e) => { e.stopPropagation(); setCaptureData((prev) => ({ ...prev, photo: null })); }}><X className="h-4 w-4" /></Button>
              </div>
            ) : (
              <div className="space-y-2"><Camera className="h-12 w-12 mx-auto text-muted-foreground" /><p className="text-muted-foreground">{isCapturing ? "Processing..." : "Tap to capture photo"}</p></div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant={isRecording ? "destructive" : "outline"} className="flex-1" onClick={isRecording ? stopRecording : startRecording}>
              <Mic className={`h-4 w-4 mr-2 ${isRecording ? "animate-pulse" : ""}`} />{isRecording ? "Stop Recording" : "Add Voice Note"}
            </Button>
            {captureData.voiceNote && <Badge variant="secondary">Voice note added</Badge>}
          </div>

          {captureData.address && <div className="flex items-start gap-2 p-3 bg-muted rounded-lg"><MapPin className="h-4 w-4 mt-1 text-muted-foreground" /><span className="text-sm text-muted-foreground">{captureData.address}</span></div>}

          <Textarea placeholder="Add notes about what you observed..." value={captureData.notes} onChange={(e) => setCaptureData((prev) => ({ ...prev, notes: e.target.value }))} rows={3} />

          <Button variant="outline" className="w-full" onClick={() => setShowCompanySelector(true)}>
            <Building2 className="h-4 w-4 mr-2" />{captureData.selectedCompanyIds.length > 0 ? `${captureData.selectedCompanyIds.length} companies selected` : "Associate with companies"}
          </Button>

          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting || (!captureData.photo && !captureData.notes)}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Capture & Process
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[{ step: 1, title: "Capture", desc: "Take a photo of a business sign or storefront" }, { step: 2, title: "AI Processing", desc: "OCR extracts text, AI classifies the business type" }, { step: 3, title: "Auto-Route", desc: "Lead matched to your companies and products" }, { step: 4, title: "Outreach", desc: "Email drafts, call tasks, and follow-ups auto-generated" }].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">{step}</div>
              <div><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
            </div>
          ))}
        </CardContent>
      </Card>

      {showCompanySelector && <CompanySelector selectedIds={captureData.selectedCompanyIds} onSelect={(ids) => setCaptureData((prev) => ({ ...prev, selectedCompanyIds: ids }))} onClose={() => setShowCompanySelector(false)} />}
    </div>
  );
};
