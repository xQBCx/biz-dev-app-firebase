import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useXEvents, XEvent, XEventRegistration } from "@/hooks/useXEvents";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Search, 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  User,
  Ticket,
  Clock,
  Loader2,
  Camera,
  ScanLine
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const XEventCheckinPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEvent, getRegistrations, updateRegistrationStatus } = useXEvents();
  
  const [event, setEvent] = useState<XEvent | null>(null);
  const [registrations, setRegistrations] = useState<XEventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [checkinStats, setCheckinStats] = useState({ total: 0, checkedIn: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      const [eventData, regs] = await Promise.all([
        getEvent(id),
        getRegistrations(id)
      ]);
      
      if (eventData) {
        setEvent(eventData);
        setRegistrations(regs);
        updateStats(regs);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [id, getEvent, getRegistrations]);

  const updateStats = (regs: XEventRegistration[]) => {
    const confirmed = regs.filter(r => r.status === 'confirmed' || r.status === 'checked_in');
    const checkedIn = regs.filter(r => r.status === 'checked_in');
    setCheckinStats({ total: confirmed.length, checkedIn: checkedIn.length });
  };

  const handleCheckin = async (registration: XEventRegistration) => {
    if (registration.status === 'checked_in') {
      toast.info("Already checked in");
      return;
    }
    
    const success = await updateRegistrationStatus(registration.id, 'checked_in');
    if (success) {
      const updatedRegs = registrations.map(r => 
        r.id === registration.id 
          ? { ...r, status: 'checked_in' as const, checked_in_at: new Date().toISOString() }
          : r
      );
      setRegistrations(updatedRegs);
      updateStats(updatedRegs);
      toast.success(`${registration.first_name} ${registration.last_name} checked in!`);
    }
  };

  const handleManualCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    const registration = registrations.find(r => 
      r.ticket_code.toLowerCase() === manualCode.trim().toLowerCase()
    );
    
    if (registration) {
      await handleCheckin(registration);
      setManualCode("");
    } else {
      toast.error("Ticket code not found");
    }
  };

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(true);
    } catch (err) {
      toast.error("Unable to access camera");
      console.error(err);
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      reg.first_name.toLowerCase().includes(query) ||
      reg.last_name.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      reg.ticket_code.toLowerCase().includes(query) ||
      (reg.company && reg.company.toLowerCase().includes(query))
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <Button onClick={() => navigate("/xevents")}>Back to Events</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/xevents/${id}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold truncate">{event.name}</h1>
              <p className="text-sm text-muted-foreground">Check-in Station</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{checkinStats.checkedIn}/{checkinStats.total}</p>
              <p className="text-xs text-muted-foreground">checked in</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="scan" className="gap-2">
              <QrCode className="w-4 h-4" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Ticket className="w-4 h-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <User className="w-4 h-4" />
              List
            </TabsTrigger>
          </TabsList>

          {/* QR Scan Tab */}
          <TabsContent value="scan" className="space-y-4">
            <Card className="p-6">
              {isScanning ? (
                <div className="space-y-4">
                  <div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-black">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg">
                        <ScanLine className="w-full h-full text-primary/50 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={stopScanner} className="w-full">
                    Stop Scanning
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Position the QR code within the frame to scan
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-medium">Scan Attendee QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your device camera to scan attendee tickets
                  </p>
                  <Button onClick={startScanner} className="gap-2">
                    <QrCode className="w-4 h-4" />
                    Start Scanner
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4">
            <Card className="p-6">
              <form onSubmit={handleManualCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter Ticket Code</label>
                  <Input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC12345"
                    className="text-center text-xl font-mono tracking-wider"
                    maxLength={8}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!manualCode.trim()}>
                  Check In
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ticket code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2">
                {filteredRegistrations.length === 0 ? (
                  <Card className="p-6 text-center text-muted-foreground">
                    {searchQuery ? "No matching registrations" : "No registrations yet"}
                  </Card>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <Card 
                      key={reg.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        reg.status === 'checked_in' ? 'bg-green-500/10 border-green-500/30' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleCheckin(reg)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          reg.status === 'checked_in' ? 'bg-green-500' : 'bg-muted'
                        }`}>
                          {reg.status === 'checked_in' ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {reg.first_name} {reg.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {reg.company || reg.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">{reg.ticket_code}</p>
                          {reg.checked_in_at && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              {format(parseISO(reg.checked_in_at), "h:mm a")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default XEventCheckinPage;
