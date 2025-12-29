import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Volume2, VolumeX, Copy, Share2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WhitePaperIconProps {
  moduleKey: string;
  moduleName: string;
  className?: string;
  variant?: "icon" | "button";
}

export function WhitePaperIcon({ moduleKey, moduleName, className, variant = "icon" }: WhitePaperIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [whitePaper, setWhitePaper] = useState<{
    content: string;
    version: number;
    lastUpdated: string;
    isShareable: boolean;
    isCopyable: boolean;
  } | null>(null);

  const fetchWhitePaper = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from the database
      // For now, we'll use placeholder content based on module
      const placeholderContent = generatePlaceholderContent(moduleKey, moduleName);
      setWhitePaper({
        content: placeholderContent,
        version: 1,
        lastUpdated: new Date().toISOString(),
        isShareable: true,
        isCopyable: true,
      });
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
      navigator.clipboard.writeText(whitePaper.content);
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
      const utterance = new SpeechSynthesisUtterance(whitePaper.content);
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
            className={cn("h-8 w-8 text-muted-foreground hover:text-primary", className)}
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
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle>{moduleName}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    v{whitePaper?.version || 1}
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleTextToSpeech}
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Listen
              </>
            )}
          </Button>
          
          {whitePaper?.isCopyable && (
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          )}
          
          {whitePaper?.isShareable && (
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : whitePaper ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {whitePaper.content}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Documentation not available</p>
            </div>
          )}
        </ScrollArea>

        {whitePaper && (
          <div className="absolute bottom-4 left-6 right-6 pt-4 border-t bg-background">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(whitePaper.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function generatePlaceholderContent(moduleKey: string, moduleName: string): string {
  return `# ${moduleName} White Paper

## Overview
${moduleName} is a core module of the Biz Dev Platform designed to streamline your business operations and enhance productivity.

## Purpose
This module was created to address the growing need for intelligent, automated business management tools that can scale with your organization.

## Key Features
• Intelligent automation of routine tasks
• Real-time data synchronization
• AI-powered insights and recommendations
• Seamless integration with other platform modules
• Customizable workflows and configurations

## How It Works
The ${moduleName} module leverages advanced AI algorithms to analyze your business data and provide actionable insights. It integrates seamlessly with the platform's core infrastructure to ensure data consistency and reliability.

## Use Cases
1. **Small Businesses**: Automate daily operations and reduce manual overhead
2. **Enterprises**: Scale operations while maintaining control and visibility
3. **Startups**: Build efficient processes from day one

## Integration Points
This module connects with:
• CRM for customer relationship management
• ERP for resource planning
• Analytics for performance insights
• Communication tools for team collaboration

## Best Practices
• Configure your settings based on your specific business needs
• Regularly review AI recommendations
• Keep your data synchronized across all modules
• Utilize the automation features to reduce manual work

## Support & Resources
For additional assistance, access the platform's help center or contact our support team.

---
*This documentation is automatically generated and updated by the platform's AI system.*
`;
}
