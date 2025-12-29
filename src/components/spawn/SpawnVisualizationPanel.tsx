import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, 
  FolderTree, 
  FileSearch, 
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Database,
  Layout,
  Code,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpawnVisualizationPanelProps {
  activeView: 'chat' | 'erp' | 'website' | 'research';
  onViewChange: (view: 'chat' | 'erp' | 'website' | 'research') => void;
  onClose: () => void;
  erpStructure?: any;
  websiteData?: any;
  researchData?: any;
  isGenerating?: boolean;
  currentStep?: string;
}

export function SpawnVisualizationPanel({
  activeView,
  onViewChange,
  onClose,
  erpStructure,
  websiteData,
  researchData,
  isGenerating,
  currentStep
}: SpawnVisualizationPanelProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  // Create pulsing effect when generating
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setPulseIntensity(prev => (prev + 1) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const views = [
    { id: 'chat', label: 'AGI Chat', icon: Sparkles, hasData: true },
    { id: 'research', label: 'Research', icon: FileSearch, hasData: !!researchData },
    { id: 'erp', label: 'ERP Structure', icon: FolderTree, hasData: !!erpStructure },
    { id: 'website', label: 'Website', icon: Globe, hasData: !!websiteData },
  ];

  return (
    <div className={cn(
      "fixed inset-0 z-50 transition-all duration-700",
      isGenerating ? "bg-background/95 backdrop-blur-md" : "bg-background"
    )}>
      {/* Ambient glow effect */}
      {isGenerating && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, hsl(var(--primary) / ${0.1 + (pulseIntensity / 500)}) 0%, transparent 70%)`,
            transition: 'background 0.1s ease'
          }}
        />
      )}

      {/* Top Navigation */}
      <div className="h-16 border-b flex items-center justify-between px-6 relative z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="h-6 w-px bg-border" />
          
          <div className="flex items-center gap-2">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              
              return (
                <Button
                  key={view.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(view.id as any)}
                  className={cn(
                    "gap-2 transition-all duration-300",
                    isActive && isGenerating && "animate-pulse"
                  )}
                  disabled={!view.hasData && view.id !== 'chat'}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                  {view.hasData && view.id !== 'chat' && (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {isGenerating && currentStep && (
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground animate-pulse">{currentStep}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        {activeView === 'research' && (
          <ResearchVisualization data={researchData} isLoading={isGenerating && currentStep?.includes('Research')} />
        )}
        
        {activeView === 'erp' && (
          <ERPVisualization structure={erpStructure} isLoading={isGenerating && currentStep?.includes('ERP')} />
        )}
        
        {activeView === 'website' && (
          <WebsiteVisualization data={websiteData} isLoading={isGenerating && currentStep?.includes('Website')} />
        )}
      </div>
    </div>
  );
}

function ResearchVisualization({ data, isLoading }: { data?: any; isLoading?: boolean }) {
  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileSearch className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Market Research</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-6 bg-muted/50 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <div>
                <div className="text-lg font-medium">Analyzing market opportunities...</div>
                <div className="text-sm text-muted-foreground">Gathering competitive intelligence and industry trends</div>
              </div>
            </div>
            
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        ) : data ? (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {typeof data === 'string' ? (
                <p className="whitespace-pre-wrap">{data}</p>
              ) : (
                <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Research data will appear here once generated</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ERPVisualization({ structure, isLoading }: { structure?: any; isLoading?: boolean }) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const renderFolder = (folder: any, path: string = '', depth: number = 0) => {
    if (!folder) return null;
    const fullPath = path ? `${path}/${folder.name || folder}` : (folder.name || folder);
    const isExpanded = expandedFolders.includes(fullPath);
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={fullPath} style={{ marginLeft: depth * 16, animationDelay: `${depth * 50}ms` }} className="animate-fade-in">
        <div 
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
            isExpanded && "bg-muted/30"
          )}
          onClick={() => hasChildren && toggleFolder(fullPath)}
        >
          {hasChildren && (
            <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
          )}
          <FolderTree className="w-4 h-4 text-primary" />
          <span className="text-sm">{folder.name || folder}</span>
          {folder.description && (
            <span className="text-xs text-muted-foreground ml-2">— {folder.description}</span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="border-l border-border/50 ml-2">
            {folder.children.map((child: any, idx: number) => renderFolder(child, fullPath, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FolderTree className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">ERP Structure</h2>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <div className="flex items-center gap-4 p-6 bg-muted/50 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Database className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div>
                <div className="text-lg font-medium">Building organizational structure...</div>
                <div className="text-sm text-muted-foreground">Creating departments, workflows, and data schemas</div>
              </div>
            </div>
            
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className="h-8 bg-muted/30 rounded-lg animate-pulse" 
                style={{ 
                  width: `${100 - (i * 10)}%`,
                  animationDelay: `${i * 0.1}s` 
                }} 
              />
            ))}
          </div>
        ) : structure ? (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <Card className="p-4">
              {structure.folder_structure ? (
                structure.folder_structure.map((folder: any) => renderFolder(folder))
              ) : Array.isArray(structure) ? (
                structure.map((folder: any) => renderFolder(folder))
              ) : (
                <pre className="text-xs">{JSON.stringify(structure, null, 2)}</pre>
              )}
            </Card>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ERP structure will appear here once generated</p>
          </div>
        )}
      </div>
    </div>
  );
}

function WebsiteVisualization({ data, isLoading }: { data?: any; isLoading?: boolean }) {
  return (
    <div className="h-full p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Website Preview</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-6 bg-muted/50 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Layout className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div>
                <div className="text-lg font-medium">Designing your website...</div>
                <div className="text-sm text-muted-foreground">Creating sections, content, and visual elements</div>
              </div>
            </div>
            
            {/* Mock website skeleton */}
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-8 w-1/2 bg-muted/50 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted/30 rounded animate-pulse" />
              </div>
            </Card>
          </div>
        ) : data ? (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <Card className="overflow-hidden">
              {/* Hero Section Preview */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-8">
                <h1 className="text-3xl font-bold mb-4">{data.title || data.businessName || 'Your Business'}</h1>
                <p className="text-lg text-muted-foreground">{data.tagline || data.description?.substring(0, 100)}</p>
              </div>
              
              {/* Sections */}
              <div className="p-6 space-y-6">
                {data.sections?.map((section: any, idx: number) => (
                  <div key={idx} className="border-b pb-4 last:border-0">
                    <h3 className="font-semibold mb-2">{section.title}</h3>
                    {section.content && <p className="text-sm text-muted-foreground">{section.content}</p>}
                  </div>
                )) || (
                  <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
                )}
              </div>
            </Card>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Website preview will appear here once generated</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpawnVisualizationPanel;
