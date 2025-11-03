import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const VoIPDialer = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const { toast } = useToast();

  const startCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to call",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('call-create', {
        body: {
          to_addr: phoneNumber,
          modality: 'webrtc',
          direction: 'outbound',
        },
      });

      if (error) throw error;

      setCallId(data.call.id);
      setIsInCall(true);
      setCallStartTime(Date.now());

      toast({
        title: "Call initiated",
        description: `Calling ${phoneNumber}...`,
      });

      // Here you would initialize WebRTC with data.iceServers
      // and connect to data.sfuConfig.endpoint
      console.log('WebRTC config:', data);
    } catch (error: any) {
      console.error('Error starting call:', error);
      toast({
        title: "Call failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const endCall = async () => {
    if (!callId || !callStartTime) return;

    const durationSeconds = Math.floor((Date.now() - callStartTime) / 1000);

    try {
      const { error } = await supabase.functions.invoke('call-end', {
        body: {
          call_id: callId,
          duration_seconds: durationSeconds,
        },
      });

      if (error) throw error;

      setIsInCall(false);
      setCallId(null);
      setCallStartTime(null);
      setPhoneNumber("");

      toast({
        title: "Call ended",
        description: `Duration: ${durationSeconds}s`,
      });
    } catch (error: any) {
      console.error('Error ending call:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Here you would actually mute/unmute the audio stream
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          VoIP Dialer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isInCall}
          />
        </div>

        {!isInCall ? (
          <Button
            onClick={startCall}
            className="w-full"
            size="lg"
          >
            <Phone className="mr-2 h-5 w-5" />
            Call
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">In call with</p>
              <p className="text-lg font-semibold">{phoneNumber}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <Button
                onClick={endCall}
                variant="destructive"
                size="lg"
                className="flex-1"
              >
                <PhoneOff className="mr-2 h-5 w-5" />
                End Call
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Note: WebRTC calling requires external SFU server setup
        </div>
      </CardContent>
    </Card>
  );
};
