import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  label: string;
  startTime: number;
}

interface VoiceNarrationPlayerProps {
  audioUrl: string;
  chapters?: Chapter[];
  onClose: () => void;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2];

export function VoiceNarrationPlayer({ audioUrl, chapters = [], onClose }: VoiceNarrationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      // Update active chapter
      if (chapters.length > 0) {
        let idx = 0;
        for (let i = chapters.length - 1; i >= 0; i--) {
          if (audio.currentTime >= chapters[i].startTime) {
            idx = i;
            break;
          }
        }
        setActiveChapter(idx);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.play();
    setIsPlaying(true);

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl, chapters]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const cycleSpeed = () => {
    const currentIdx = SPEED_OPTIONS.indexOf(speed);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    const newSpeed = SPEED_OPTIONS[nextIdx];
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const skipToChapter = (index: number) => {
    if (!audioRef.current || !chapters[index]) return;
    audioRef.current.currentTime = chapters[index].startTime;
    setCurrentTime(chapters[index].startTime);
    setActiveChapter(index);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card border rounded-lg p-3 shadow-lg w-72">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">Voice Overview</span>
        </div>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={togglePlay}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={skipForward}>
          <SkipForward className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-mono" onClick={cycleSpeed}>
          {speed}x
        </Button>
      </div>

      {/* Chapters */}
      {chapters.length > 0 && (
        <div className="border-t pt-2 max-h-24 overflow-y-auto">
          <div className="text-[10px] text-muted-foreground mb-1">Sections</div>
          <div className="space-y-0.5">
            {chapters.map((chapter, idx) => (
              <button
                key={idx}
                onClick={() => skipToChapter(idx)}
                className={cn(
                  "w-full text-left text-xs px-1.5 py-0.5 rounded hover:bg-accent transition-colors flex justify-between",
                  activeChapter === idx && "bg-accent font-medium"
                )}
              >
                <span className="truncate">{chapter.label}</span>
                <span className="text-muted-foreground ml-1">{formatTime(chapter.startTime)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
