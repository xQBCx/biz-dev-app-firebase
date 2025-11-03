import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, Play, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Call {
  id: string;
  created_at: string;
  direction: string;
  modality: string;
  from_addr: string;
  to_addr: string;
  status: string;
  duration_seconds: number | null;
}

interface Recording {
  id: string;
  call_id: string;
  codec: string;
  duration_sec: number;
  file_path: string;
  is_preview: boolean;
}

export const CallHistory = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [recordings, setRecordings] = useState<Record<string, Recording[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (callsError) throw callsError;

      setCalls(callsData || []);

      // Load recordings for these calls
      if (callsData && callsData.length > 0) {
        const { data: recordingsData, error: recError } = await supabase
          .from('call_recordings')
          .select('*')
          .in('call_id', callsData.map(c => c.id));

        if (!recError && recordingsData) {
          const recordingsByCall: Record<string, Recording[]> = {};
          recordingsData.forEach(rec => {
            if (!recordingsByCall[rec.call_id]) {
              recordingsByCall[rec.call_id] = [];
            }
            recordingsByCall[rec.call_id].push(rec);
          });
          setRecordings(recordingsByCall);
        }
      }
    } catch (error: any) {
      console.error('Error loading call history:', error);
      toast({
        title: "Error",
        description: "Failed to load call history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const playRecording = async (recording: Recording) => {
    try {
      const { data: { signedUrl }, error } = await supabase.storage
        .from('call-recordings')
        .createSignedUrl(recording.file_path, 600); // 10 min expiry

      if (error) throw error;

      // Open audio in new window or play inline
      const audio = new Audio(signedUrl);
      audio.play();
    } catch (error: any) {
      console.error('Error playing recording:', error);
      toast({
        title: "Playback error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadRecording = async (recording: Recording) => {
    try {
      const { data: { signedUrl }, error } = await supabase.storage
        .from('call-recordings')
        .createSignedUrl(recording.file_path, 60);

      if (error) throw error;

      window.open(signedUrl, '_blank');
    } catch (error: any) {
      console.error('Error downloading recording:', error);
      toast({
        title: "Download error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading call history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {calls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No calls yet
            </p>
          ) : (
            calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  {call.direction === 'inbound' ? (
                    <PhoneIncoming className="h-4 w-4 text-green-500" />
                  ) : (
                    <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                  )}
                  
                  <div>
                    <p className="font-medium text-sm">
                      {call.direction === 'inbound' ? call.from_addr : call.to_addr}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(call.created_at), 'MMM d, yyyy h:mm a')}
                      {call.duration_seconds && ` • ${call.duration_seconds}s`}
                    </p>
                  </div>
                </div>

                {recordings[call.id] && recordings[call.id].length > 0 && (
                  <div className="flex gap-1">
                    {recordings[call.id]
                      .filter(r => r.is_preview)
                      .map(rec => (
                        <div key={rec.id} className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playRecording(rec)}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadRecording(rec)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
