import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Volume2, VolumeX } from "lucide-react";
import { useBrowserTTS, TTSPersona } from "@/hooks/useBrowserTTS";
import { cn } from "@/lib/utils";

interface TextToSpeechButtonProps {
  text: string;
  persona?: TTSPersona;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline" | "secondary";
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

export function TextToSpeechButton({
  text,
  persona = 'biz',
  className,
  size = "icon",
  variant = "ghost",
  tooltipSide = "top",
}: TextToSpeechButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useBrowserTTS();

  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, persona);
    }
  };

  const personaLabel = persona === 'biz' ? 'Biz' : 'Dev';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            className={cn(
              "transition-all",
              isSpeaking && "text-primary",
              className
            )}
          >
            {isSpeaking ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>
          <p>{isSpeaking ? 'Stop' : `Listen (${personaLabel} voice)`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
