import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Volume2, VolumeX, Copy, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { getWhitePaperContent, formatWhitePaperAsText, WhitePaperData } from "./whitePaperContent";

interface WhitePaperIconProps {
  moduleKey: string;
  moduleName: string;
  className?: string;
  variant?: "icon" | "button";
}

export function WhitePaperIcon({ moduleKey, moduleName, className, variant = "icon" }: WhitePaperIconProps) {
  const { hasPermission, isAdmin, isLoading: permissionsLoading } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [whitePaper, setWhitePaper] = useState<{
    data: WhitePaperData;
    textContent: string;
  } | null>(null);

  // Check if user has permission to view module white papers
  const canViewModuleWhitePapers = isAdmin || hasPermission('module_white_papers' as any, 'view');
  
  // Don't render if user doesn't have permission
  if (!permissionsLoading && !canViewModuleWhitePapers) {
    return null;
  }

  const fetchWhitePaper = async () => {
    setIsLoading(true);
    try {
      const data = getWhitePaperContent(moduleKey);
      if (data) {
        setWhitePaper({
          data,
          textContent: formatWhitePaperAsText(data),
        });
      }
    } catch (error) {
      toast.error("Failed to load white paper");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && !whitePaper) {
      fetchWhitePaper();
    }
  };

  const handleCopy = () => {
    if (whitePaper) {
      navigator.clipboard.writeText(whitePaper.textContent);
      toast.success("White paper copied to clipboard");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/whitepaper/${moduleKey}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard");
  };

  const handleTextToSpeech = () => {
    if (!whitePaper) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(whitePaper.textContent);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpen}>
      <SheetTrigger asChild>
        {variant === "button" ? (
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <BookOpen className="w-4 h-4" />
            Documentation
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", className)}
            title={`View ${moduleName} Documentation`}
          >
            <BookOpen className="w-4 h-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-background" />
              </div>
              <div>
                <SheetTitle>{whitePaper?.data.title || moduleName}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    v{whitePaper?.data.version || 1}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    White Paper
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex items-center gap-2 mt-4 pb-4 border-b">
          <Button variant="outline" size="sm" onClick={handleTextToSpeech} className="gap-2">
            {isPlaying ? <><VolumeX className="w-4 h-4" />Stop</> : <><Volume2 className="w-4 h-4" />Listen</>}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            <Copy className="w-4 h-4" />Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />Share
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : whitePaper ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-4">
                {whitePaper.data.subtitle}
              </p>
              {whitePaper.data.sections.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Documentation not available for this module</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
