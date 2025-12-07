import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Zap, Brain, TrendingUp, Users, Mail, 
  FileText, Settings, Sparkles, ClipboardCheck
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  node_definitions: any[];
  is_featured: boolean;
}

interface TemplateGalleryProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
}

const categoryIcons: Record<string, any> = {
  sales: TrendingUp,
  marketing: Mail,
  ai_content: Brain,
  operations: Settings,
  erp_audit: ClipboardCheck,
};

const categoryColors: Record<string, string> = {
  sales: "bg-emerald-500/10 text-emerald-500",
  marketing: "bg-blue-500/10 text-blue-500",
  ai_content: "bg-purple-500/10 text-purple-500",
  operations: "bg-amber-500/10 text-amber-500",
  erp_audit: "bg-orange-500/10 text-orange-500",
};

export function TemplateGallery({ templates, onUseTemplate }: TemplateGalleryProps) {
  const groupedTemplates = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, Template[]>);

  const categoryLabels: Record<string, string> = {
    sales: "Sales & CRM",
    marketing: "Marketing",
    ai_content: "AI & Content",
    operations: "Operations",
    erp_audit: "ERP & Audit",
  };

  return (
    <ScrollArea className="h-[60vh]">
      <div className="space-y-6 pr-4">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
          const Icon = categoryIcons[category] || Zap;
          const colorClass = categoryColors[category] || "bg-primary/10 text-primary";
          
          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold">
                  {categoryLabels[category] || category}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {categoryTemplates.length}
                </Badge>
              </div>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {categoryTemplates.map(template => (
                  <Card 
                    key={template.id} 
                    className="hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onUseTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {template.name}
                            </h4>
                            {template.is_featured && (
                              <Sparkles className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="outline" className="text-[10px]">
                          {template.node_definitions?.length || 0} nodes
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
