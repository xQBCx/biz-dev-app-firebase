import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileSearch, 
  TrendingUp, 
  Target, 
  Users, 
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Copy,
  Download,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface ResearchViewProps {
  researchData: any;
  businessName: string;
}

export function ResearchView({ researchData, businessName }: ResearchViewProps) {
  const handleCopy = () => {
    const content = typeof researchData === 'string' ? researchData : JSON.stringify(researchData, null, 2);
    navigator.clipboard.writeText(content);
    toast.success("Research data copied to clipboard");
  };

  const handleDownload = () => {
    const content = typeof researchData === 'string' ? researchData : JSON.stringify(researchData, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-research.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Research downloaded");
  };

  const getIconForTitle = (title: string): React.ReactNode => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('market') || lowerTitle.includes('trend')) return <TrendingUp className="w-4 h-4" />;
    if (lowerTitle.includes('target') || lowerTitle.includes('audience')) return <Target className="w-4 h-4" />;
    if (lowerTitle.includes('competitor') || lowerTitle.includes('competition')) return <Users className="w-4 h-4" />;
    if (lowerTitle.includes('challenge') || lowerTitle.includes('risk')) return <AlertTriangle className="w-4 h-4" />;
    if (lowerTitle.includes('opportunity') || lowerTitle.includes('recommendation')) return <Lightbulb className="w-4 h-4" />;
    return <FileSearch className="w-4 h-4" />;
  };

  // Try to parse structured data if available
  const parseResearchSections = (): { title: string; content: string }[] | null => {
    if (typeof researchData === 'string') {
      const sections: { title: string; content: string }[] = [];
      const lines = researchData.split('\n');
      let currentSection = { title: 'Overview', content: '' };
      
      for (const line of lines) {
        if (line.startsWith('###') || line.startsWith('##')) {
          if (currentSection.content.trim()) {
            sections.push({ ...currentSection });
          }
          currentSection = { title: line.replace(/^#+\s*/, '').trim(), content: '' };
        } else {
          currentSection.content += line + '\n';
        }
      }
      
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }
      
      return sections.length > 1 ? sections : null;
    }
    
    if (typeof researchData === 'object') {
      return Object.entries(researchData).map(([key, value]) => ({
        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        content: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
      }));
    }
    
    return null;
  };

  const sections = parseResearchSections();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Market Research</h2>
            <p className="text-sm text-muted-foreground">AI-generated insights for {businessName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Research Content */}
      {sections ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section, index) => (
            <Card key={index} className="p-5">
              <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-primary">
                  {getIconForTitle(section.title)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {section.content.trim().slice(0, 500)}
                    {section.content.length > 500 && '...'}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {typeof researchData === 'string' ? (
              <div className="whitespace-pre-wrap">{researchData}</div>
            ) : (
              <pre className="text-xs">{JSON.stringify(researchData, null, 2)}</pre>
            )}
          </div>
        </Card>
      )}

      {/* Key Insights Summary */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Research Summary</h3>
            <p className="text-sm text-muted-foreground">
              This research was generated by our AI system to help you understand your market, 
              identify opportunities, and position your business effectively. Use these insights 
              to inform your strategy and decision-making.
            </p>
          </div>
        </div>
      </Card>

      {/* Raw Data */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
          <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
          View Raw Data
        </summary>
        <Card className="mt-2 p-4">
          <pre className="text-xs overflow-auto max-h-96">
            {typeof researchData === 'string' ? researchData : JSON.stringify(researchData, null, 2)}
          </pre>
        </Card>
      </details>
    </div>
  );
}
