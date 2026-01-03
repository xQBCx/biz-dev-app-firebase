import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Copy, 
  Share2, 
  Download,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FileText,
  Building2,
  Users,
  FolderTree,
  Zap,
  Lightbulb,
  Shield,
  Handshake,
  Workflow,
  Calendar,
  CheckSquare,
  Rocket,
  TrendingUp,
  Building,
  Grid3x3,
  Store,
  Truck,
  Megaphone,
  Receipt,
  Gift,
  Server,
  Map
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { 
  masterWhitePaperSections, 
  getFullWhitePaperContent,
  DOCUMENT_TITLE,
  PLATFORM_VERSION,
  type WhitePaperSection
} from "./masterWhitePaperSections";

interface MasterWhitePaperButtonProps {
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  FileText,
  Building2,
  Users,
  FolderTree,
  Zap,
  Lightbulb,
  Shield,
  Handshake,
  Workflow,
  Calendar,
  CheckSquare,
  Rocket,
  TrendingUp,
  Building,
  Grid3x3,
  Store,
  Truck,
  Megaphone,
  Receipt,
  Gift,
  Server,
  Map,
  BookOpen
};

export function MasterWhitePaperButton({ className }: MasterWhitePaperButtonProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("executive-summary");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const currentSection = masterWhitePaperSections.find(s => s.id === activeSection);

  const toggleExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleCopyAll = () => {
    const content = getFullWhitePaperContent();
    navigator.clipboard.writeText(content);
    toast.success("Complete white paper copied to clipboard");
  };

  const handleCopySection = (section: WhitePaperSection) => {
    let content = section.content;
    if (section.subsections) {
      content += "\n\n" + section.subsections.map(s => s.content).join("\n\n");
    }
    navigator.clipboard.writeText(content);
    toast.success(`"${section.name}" copied to clipboard`);
  };

  const handleShareAll = () => {
    const url = `${window.location.origin}/whitepaper`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard");
  };

  const handleShareSection = (section: WhitePaperSection) => {
    const url = `${window.location.origin}/whitepaper#${section.id}`;
    navigator.clipboard.writeText(url);
    toast.success(`Share link for "${section.name}" copied`);
  };

  const handleDownload = () => {
    const content = getFullWhitePaperContent();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "biz-dev-platform-master-whitepaper.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Complete white paper downloaded");
  };

  const handleTextToSpeech = () => {
    if (!currentSection) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      // Clean markdown for speech
      const cleanContent = currentSection.content
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleNavigateToRoute = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || BookOpen;
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-2xl font-bold mt-6 mb-3">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-semibold mt-5 mb-2">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-medium mt-4 mb-2">{line.substring(4)}</h3>;
      }
      
      // Bold text
      let text = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      
      // List items
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="ml-4 mb-1" dangerouslySetInnerHTML={{ __html: text.substring(2) }} />
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <li key={i} className="ml-4 mb-1 list-decimal" dangerouslySetInnerHTML={{ __html: text.replace(/^\d+\.\s/, '') }} />
        );
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={i} className="h-3" />;
      }
      
      // Regular paragraphs
      return <p key={i} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("gap-2", className)}
        >
          <BookOpen className="w-4 h-4" />
          Platform Documentation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex flex-col h-[85vh]">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {DOCUMENT_TITLE}
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      Master White Paper
                    </Badge>
                    <Badge variant="outline" className="text-xs">v{PLATFORM_VERSION}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {masterWhitePaperSections.length} Sections
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleTextToSpeech} title="Read aloud">
                  {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="outline" size="sm" onClick={handleCopyAll} title="Copy all">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareAll} title="Share link">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} title="Download">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Navigation Sidebar */}
            <div className="w-72 border-r bg-muted/30 overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <p className="text-sm font-medium text-muted-foreground">Table of Contents</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {masterWhitePaperSections.map((section) => {
                    const Icon = getIcon(section.icon);
                    const hasSubsections = section.subsections && section.subsections.length > 0;
                    const isExpanded = expandedSections.has(section.id);
                    const isActive = activeSection === section.id;
                    
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => {
                            setActiveSection(section.id);
                            if (hasSubsections) {
                              toggleExpanded(section.id);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground font-medium shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {hasSubsections ? (
                            isExpanded ? (
                              <ChevronDown className="w-4 h-4 shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 shrink-0" />
                            )
                          ) : (
                            <Icon className="w-4 h-4 shrink-0" />
                          )}
                          <span className="truncate flex-1">{section.name}</span>
                          {section.route && (
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                        
                        {/* Subsections */}
                        {hasSubsections && isExpanded && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-muted pl-2">
                            {section.subsections!.map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => setActiveSection(sub.id)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-left transition-all",
                                  activeSection === sub.id
                                    ? "bg-primary/80 text-primary-foreground font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <span className="truncate">{sub.name}</span>
                                {sub.route && (
                                  <ExternalLink className="w-3 h-3 opacity-50" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {currentSection && (
                <>
                  {/* Section Header */}
                  <div className="p-4 border-b bg-background flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = getIcon(currentSection.icon);
                        return <Icon className="w-5 h-5 text-primary" />;
                      })()}
                      <h2 className="text-lg font-semibold">{currentSection.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopySection(currentSection)}
                        title="Copy section"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleShareSection(currentSection)}
                        title="Share section"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      {currentSection.route && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleNavigateToRoute(currentSection.route!)}
                          className="gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Go to {currentSection.name}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <ScrollArea className="flex-1">
                    <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
                      {renderMarkdown(currentSection.content)}
                      
                      {/* Subsection content if viewing subsection */}
                      {currentSection.subsections && (
                        <div className="mt-8 space-y-8">
                          {currentSection.subsections.map((sub) => (
                            <div key={sub.id} className="border-t pt-6">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{sub.name}</h3>
                                {sub.route && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleNavigateToRoute(sub.route!)}
                                    className="gap-2"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Open
                                  </Button>
                                )}
                              </div>
                              {renderMarkdown(sub.content)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              This documentation automatically evolves with platform changes. Hall of Fame status documentation.
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs">
                Last synced: {new Date().toLocaleDateString()}
              </Badge>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Biz Dev Platform
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
