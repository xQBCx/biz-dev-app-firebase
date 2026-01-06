import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Volume2, VolumeX, Loader2, ChevronDown } from "lucide-react";
import { useVoiceNarration, VoicePersona } from "@/hooks/useVoiceNarration";
import { cn } from "@/lib/utils";

interface VoiceNarrationButtonProps {
  text: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  showPersonaSelector?: boolean;
  defaultPersona?: VoicePersona;
}

export const VoiceNarrationButton = ({
  text,
  className,
  size = "sm",
  showPersonaSelector = false,
  defaultPersona = 'biz',
}: VoiceNarrationButtonProps) => {
  const { speak, stop, isPlaying, isLoading, hasPermission, checkPermission } = useVoiceNarration();
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(defaultPersona);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    if (!permissionChecked) {
      checkPermission().then(() => setPermissionChecked(true));
    }
  }, [checkPermission, permissionChecked]);

  // Don't render if no permission
  if (permissionChecked && hasPermission === false) {
    return null;
  }

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text, selectedPersona);
    }
  };

  const handlePersonaSelect = (persona: VoicePersona) => {
    setSelectedPersona(persona);
    speak(text, persona);
  };

  if (showPersonaSelector) {
    return (
      <div className={cn("flex items-center gap-0.5", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={size}
                onClick={handleClick}
                disabled={isLoading}
                className="rounded-r-none"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? 'Stop' : 'Listen'} ({selectedPersona === 'biz' ? 'Biz' : 'Dev'} voice)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={size} className="rounded-l-none px-1">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handlePersonaSelect('biz')}>
              <span className="font-medium">Biz</span>
              <span className="ml-2 text-muted-foreground text-xs">Professional voice</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePersonaSelect('dev')}>
              <span className="font-medium">Dev</span>
              <span className="ml-2 text-muted-foreground text-xs">Technical voice</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={size}
            onClick={handleClick}
            disabled={isLoading}
            className={className}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isPlaying ? 'Stop narration' : 'Listen to this'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
