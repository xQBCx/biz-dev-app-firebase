import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX, Loader2, RefreshCw, Headphones } from "lucide-react";
import { toast } from "sonner";

interface AudioOverviewPlayerProps {
  transcript: string;
  audioUrl?: string;
  outputId: string;
  onGenerateAudio?: () => void;
}

export function AudioOverviewPlayer({
  transcript,
  audioUrl,
  outputId,
  onGenerateAudio,
}: AudioOverviewPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(audioUrl || null);

  const effectiveAudioUrl = generatedAudioUrl || audioUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [effectiveAudioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const vol = value[0];
    audio.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleGenerateAudio = async () => {
    if (!transcript) {
      toast.error("No transcript available to generate audio");
      return;
    }

    setIsGenerating(true);
    try {
      // Get the user's auth token for proper authentication
      const { data: { session } } = await import("@/integrations/supabase/client").then(m => m.supabase.auth.getSession());
      
      if (!session?.access_token) {
        throw new Error("Please log in to generate audio");
      }

      // Call ElevenLabs TTS endpoint with user's auth token
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notebook-generate-audio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            outputId,
            transcript,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate audio");
      }

      const data = await response.json();
      setGeneratedAudioUrl(data.audioUrl);
      toast.success("Audio generated successfully!");
    } catch (error) {
      console.error("Audio generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate audio");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 via-background to-blue-500/10">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Headphones className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold">Audio Overview</h3>
            <p className="text-sm text-muted-foreground">
              {effectiveAudioUrl ? "Listen to the podcast-style discussion" : "Generate audio from transcript"}
            </p>
          </div>
        </div>

        {/* Audio Player or Generate Button */}
        {effectiveAudioUrl ? (
          <>
            <audio ref={audioRef} src={effectiveAudioUrl} preload="metadata" />

            {/* Progress */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 w-32">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Regenerate option */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleGenerateAudio}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate Audio
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Transcript Preview:</p>
              <p className="text-sm line-clamp-4">{transcript}</p>
            </div>

            <Button
              className="w-full"
              onClick={handleGenerateAudio}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Audio with AI Voices...
                </>
              ) : (
                <>
                  <Headphones className="h-4 w-4 mr-2" />
                  Generate Podcast Audio
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Uses ElevenLabs AI voices for natural podcast-style audio
            </p>
          </div>
        )}

        {/* Transcript Accordion */}
        {effectiveAudioUrl && transcript && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              View Full Transcript
            </summary>
            <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm max-h-60 overflow-y-auto">
              {transcript}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
