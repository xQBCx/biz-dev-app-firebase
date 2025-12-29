import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet,
  ExternalLink,
  Copy,
  Download,
  Palette,
  Layout,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WebsitePreviewProps {
  websiteData: any;
  businessName: string;
}

export function WebsitePreview({ websiteData, businessName }: WebsitePreviewProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const sections = websiteData.sections || websiteData.pages?.[0]?.sections || [];
  const theme = websiteData.theme || {};
  const meta = websiteData.meta || { title: businessName, description: websiteData.description };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(websiteData, null, 2));
    toast.success("Website data copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(websiteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-website.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Website data downloaded");
  };

  const containerWidths = {
    desktop: 'max-w-4xl',
    tablet: 'max-w-xl',
    mobile: 'max-w-sm'
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Website Preview</h2>
            <p className="text-sm text-muted-foreground">{sections.length} sections generated</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Viewport Switcher */}
          <div className="flex items-center border rounded-lg p-1">
            <Button 
              variant={viewMode === 'desktop' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'tablet' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'mobile' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Preview Tabs */}
      <Tabs defaultValue="preview" className="w-full">
        <TabsList>
          <TabsTrigger value="preview" className="gap-2">
            <Layout className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2">
            <Globe className="w-4 h-4" />
            Sections
          </TabsTrigger>
          {Object.keys(theme).length > 0 && (
            <TabsTrigger value="theme" className="gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="preview">
          {/* Website Preview */}
          <Card className={cn(
            "mx-auto overflow-hidden transition-all duration-300",
            containerWidths[viewMode]
          )}>
            {/* Browser Chrome */}
            <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  {businessName.toLowerCase().replace(/\s+/g, '')}.com
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="bg-background">
              {sections.map((section: any, index: number) => {
                const isHero = section.type === 'hero' || index === 0;
                const isCTA = section.type === 'cta';
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "p-6 md:p-8 border-b last:border-b-0",
                      isHero && "bg-gradient-to-br from-primary/5 via-background to-primary/10 py-12 md:py-16",
                      isCTA && "bg-primary/5 text-center"
                    )}
                  >
                    {section.title && (
                      <h2 className={cn(
                        "font-bold mb-3",
                        isHero ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"
                      )}>
                        {section.title}
                      </h2>
                    )}
                    
                    {section.subtitle && (
                      <p className="text-lg text-muted-foreground mb-4 font-medium">
                        {section.subtitle}
                      </p>
                    )}
                    
                    {section.content && (
                      <div className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                        {typeof section.content === 'string' 
                          ? section.content.split('\n\n').slice(0, 2).map((p: string, i: number) => (
                              <p key={i} className="mb-2">{p}</p>
                            ))
                          : null
                        }
                      </div>
                    )}

                    {/* Items Grid */}
                    {section.items && Array.isArray(section.items) && section.items.length > 0 && (
                      <div className={cn(
                        "grid gap-4 mt-6",
                        viewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
                      )}>
                        {section.items.slice(0, 4).map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="p-4 bg-card border rounded-lg">
                            {typeof item === 'string' ? (
                              <p className="font-medium text-sm">{item}</p>
                            ) : (
                              <>
                                {item.title && <h4 className="font-semibold mb-1">{item.title}</h4>}
                                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    {(section.cta || section.buttonText) && (
                      <Button className="mt-4" size={isHero ? "lg" : "default"}>
                        {section.cta || section.buttonText}
                      </Button>
                    )}
                  </div>
                );
              })}

              {sections.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No sections available</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <div className="space-y-4">
            {sections.map((section: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{section.title || `Section ${index + 1}`}</h3>
                      {section.type && (
                        <Badge variant="outline" className="text-xs">{section.type}</Badge>
                      )}
                    </div>
                    {section.subtitle && (
                      <p className="text-sm text-muted-foreground mb-2">{section.subtitle}</p>
                    )}
                    {section.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
                      </p>
                    )}
                    {section.items && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Badge variant="secondary">{section.items.length} items</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {Object.keys(theme).length > 0 && (
          <TabsContent value="theme">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Colors
              </h3>
              <div className="flex gap-4 flex-wrap">
                {theme.colors && Object.entries(theme.colors).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border shadow-sm" 
                      style={{ backgroundColor: value }}
                    />
                    <div>
                      <div className="text-sm font-medium capitalize">{key}</div>
                      <div className="text-xs text-muted-foreground">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Raw Data */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
          <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
          View Raw JSON
        </summary>
        <Card className="mt-2 p-4">
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(websiteData, null, 2)}
          </pre>
        </Card>
      </details>
    </div>
  );
}
