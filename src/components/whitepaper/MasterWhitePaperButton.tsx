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
  Map,
  Wrench,
  Brain,
  Target,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  masterWhitePaperSections, 
  getFullWhitePaperContent,
  getFullWhitePaperJSON,
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
  BookOpen,
  Wrench,
  Brain,
  Target,
  Globe
};

export function MasterWhitePaperButton({ className }: MasterWhitePaperButtonProps) {
  const navigate = useNavigate();
  const { hasPermission, isAdmin, isLoading: permissionsLoading } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("executive-summary");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showToc, setShowToc] = useState(false);

  // Check if user has permission to view white paper
  const canViewWhitePaper = isAdmin || hasPermission('white_paper' as any, 'view');
  
  // Don't render if user doesn't have permission
  if (!permissionsLoading && !canViewWhitePaper) {
    return null;
  }

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

  const handleDownload = (format: 'markdown' | 'json' = 'markdown') => {
    if (format === 'json') {
      const content = JSON.stringify(getFullWhitePaperJSON(), null, 2);
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "biz-dev-platform-master-whitepaper.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("White paper downloaded as JSON (for AI systems)");
    } else {
      const content = getFullWhitePaperContent();
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "biz-dev-platform-master-whitepaper.md";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("White paper downloaded as Markdown");
    }
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
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-[85vh] max-h-[85vh]">
          {/* Header - Mobile Optimized */}
          <DialogHeader className="p-3 md:p-4 border-b shrink-0">
            <div className="flex flex-col gap-2">
              {/* Title row */}
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-sm md:text-xl font-bold leading-tight">
                    <span className="hidden md:inline">{DOCUMENT_TITLE}</span>
                    <span className="md:hidden">Biz Dev Platform</span>
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-[10px] md:text-xs px-1.5 py-0">
                      Master White Paper
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1 py-0">v{PLATFORM_VERSION}</Badge>
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      {masterWhitePaperSections.length} Sections
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Action buttons row - compact on mobile */}
              <div className="flex items-center justify-between gap-1">
                {/* Mobile TOC toggle */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowToc(!showToc)}
                  className="md:hidden h-8 px-2 gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs">Contents</span>
                </Button>
                
                {/* Action icons */}
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={handleTextToSpeech} title="Read aloud" className="h-8 w-8 p-0">
                    {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyAll} title="Copy all" className="h-8 w-8 p-0">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload('markdown')} title="Download" className="h-8 w-8 p-0">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareAll} title="Share" className="hidden sm:flex h-8 w-8 p-0">
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Navigation Sidebar - Responsive drawer on mobile */}
            <div className={cn(
              "absolute md:relative z-10 md:z-auto inset-y-0 left-0",
              "w-64 md:w-72 border-r bg-background md:bg-muted/30 overflow-hidden flex flex-col",
              "transition-transform duration-300 md:translate-x-0",
              showToc ? "translate-x-0 shadow-xl" : "-translate-x-full"
            )}>
              <div className="p-3 md:p-4 border-b flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Table of Contents</p>
                <Button variant="ghost" size="sm" onClick={() => setShowToc(false)} className="md:hidden p-1 h-auto">
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </Button>
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
                            setShowToc(false); // Close on mobile after selection
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
                                onClick={() => {
                                  setActiveSection(sub.id);
                                  setShowToc(false);
                                }}
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

            {/* Backdrop for mobile TOC */}
            {showToc && (
              <div 
                className="absolute inset-0 bg-black/50 z-[5] md:hidden"
                onClick={() => setShowToc(false)}
              />
            )}

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {currentSection && (
                <>
                  {/* Section Header - Compact on mobile */}
                  <div className="p-2 md:p-3 border-b bg-background shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {(() => {
                          const Icon = getIcon(currentSection.icon);
                          return <Icon className="w-4 h-4 text-primary shrink-0" />;
                        })()}
                        <h2 className="text-sm md:text-base font-semibold truncate">{currentSection.name}</h2>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCopySection(currentSection)}
                          title="Copy section"
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleShareSection(currentSection)}
                          title="Share section"
                          className="h-7 w-7 p-0"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </Button>
                        {currentSection.route && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleNavigateToRoute(currentSection.route!)}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden sm:inline">Open</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content - Mobile optimized with proper scrolling */}
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-3 md:p-5 text-sm md:text-base">
                      <div className="prose prose-sm max-w-none
                                      prose-headings:text-foreground prose-headings:font-semibold
                                      prose-h1:text-lg prose-h1:md:text-xl prose-h1:mt-4 prose-h1:mb-2
                                      prose-h2:text-base prose-h2:md:text-lg prose-h2:mt-3 prose-h2:mb-2
                                      prose-h3:text-sm prose-h3:md:text-base prose-h3:mt-2 prose-h3:mb-1
                                      prose-p:text-foreground/90 prose-p:text-sm prose-p:leading-relaxed prose-p:mb-2
                                      prose-li:text-foreground/90 prose-li:text-sm prose-li:my-0.5
                                      prose-strong:text-foreground">
                        {renderMarkdown(currentSection.content)}
                        
                        {/* Subsection content */}
                        {currentSection.subsections && (
                          <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
                            {currentSection.subsections.map((sub) => (
                              <div key={sub.id} className="border-t pt-3 md:pt-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <h3 className="text-sm md:text-base font-semibold">{sub.name}</h3>
                                  {sub.route && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleNavigateToRoute(sub.route!)}
                                      className="h-6 px-2 text-xs gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
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
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>

          {/* Footer - Compact on mobile */}
          <div className="p-2 md:p-3 border-t bg-muted/30 shrink-0">
            <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-muted-foreground">
              <span className="hidden sm:inline">Auto-evolving docs</span>
              <Badge variant="outline" className="text-[9px] md:text-[10px] px-1.5 py-0 h-4">
                {new Date().toLocaleDateString()}
              </Badge>
              <span>© {new Date().getFullYear()} Biz Dev</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
