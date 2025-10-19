import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface VoiceRecorderProps {
  onTaskCreated?: () => void;
  compact?: boolean;
}

export const VoiceRecorder = ({ onTaskCreated, compact = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { user } = useAuth();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        // Step 1: Transcribe audio
        toast.info("Transcribing audio...");
        const { data: transcriptionData, error: transcriptionError } = await supabase.functions.invoke(
          'transcribe-audio',
          { body: { audio: base64Audio } }
        );

        if (transcriptionError) throw transcriptionError;
        if (!transcriptionData?.text) throw new Error('No transcription received');

        const transcribedText = transcriptionData.text;
        toast.success("Audio transcribed!");

        // Step 2: Categorize and extract task details
        toast.info("Analyzing task...");
        const { data: categoryData, error: categoryError } = await supabase.functions.invoke(
          'categorize-task',
          { body: { text: transcribedText } }
        );

        if (categoryError) throw categoryError;

        // Step 3: Create task in database
        const taskData = {
          user_id: user?.id,
          title: categoryData.title || transcribedText.substring(0, 80),
          description: categoryData.description || transcribedText,
          category: categoryData.category || 'personal',
          priority: categoryData.priority || 'medium',
          status: 'pending',
          due_date: categoryData.suggestedDueDate || null,
          metadata: {
            contactName: categoryData.contactName,
            companyName: categoryData.companyName,
            originalTranscription: transcribedText,
          }
        };

        const { error: insertError } = await supabase
          .from('tasks')
          .insert(taskData);

        if (insertError) throw insertError;

        toast.success(`Task created: ${taskData.title}`);
        onTaskCreated?.();
      };
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error.message || "Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  if (compact) {
    return (
      <Button
        size="icon"
        variant={isRecording ? "destructive" : "default"}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className="rounded-full"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <Square className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        variant={isRecording ? "destructive" : "default"}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className="gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : isRecording ? (
          <>
            <Square className="h-5 w-5" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="h-5 w-5" />
            Voice Memo
          </>
        )}
      </Button>
      {isRecording && (
        <p className="text-sm text-muted-foreground text-center animate-pulse">
          Recording in progress...
        </p>
      )}
    </div>
  );
};
