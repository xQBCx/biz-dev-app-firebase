import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WhitePaperIcon } from "@/components/whitepaper/WhitePaperIcon";
import { 
  Users, 
  FolderTree, 
  FileText, 
  Truck, 
  Calendar, 
  DollarSign,
  MessageSquare,
  BarChart3,
  Briefcase,
  Package,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ModuleEnablePanelProps {
  businessId: string;
  businessType?: string;
  enabledModules: Record<string, boolean>;
  onModuleToggle: (moduleKey: string, enabled: boolean) => void;
}

interface PlatformModule {
  key: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  recommended?: boolean;
  premium?: boolean;
}

const platformModules: PlatformModule[] = [
  // Core Business
  {
    key: "crm",
    name: "CRM",
    description: "Customer relationship management with AI-powered contact insights, deal tracking, and communication history.",
    icon: Users,
    category: "Core Business",
    recommended: true,
  },
  {
    key: "erp",
    name: "ERP System",
    description: "Enterprise resource planning with automated workflows, document management, and organizational structure.",
    icon: FolderTree,
    category: "Core Business",
    recommended: true,
  },
  {
    key: "service_offerings",
    name: "Service Offerings",
    description: "Define and manage your service catalog with pricing, packages, and deliverables.",
    icon: Package,
    category: "Core Business",
    recommended: true,
  },
  {
    key: "deal_room",
    name: "Deal Room",
    description: "Secure negotiation environment with document sharing, milestone tracking, and stakeholder management.",
    icon: Briefcase,
    category: "Core Business",
  },
  
  // Operations
  {
    key: "fleet",
    name: "Fleet Management",
    description: "Track vehicles, maintenance schedules, driver assignments, and fuel consumption.",
    icon: Truck,
    category: "Operations",
  },
  {
    key: "calendar",
    name: "Calendar & Scheduling",
    description: "Appointment booking, team calendars, and automated reminders.",
    icon: Calendar,
    category: "Operations",
    recommended: true,
  },
  {
    key: "workflows",
    name: "Workflow Automation",
    description: "Build custom automated processes with triggers, conditions, and actions.",
    icon: Settings,
    category: "Operations",
  },
  
  // Finance
  {
    key: "invoicing",
    name: "Invoicing & Billing",
    description: "Create invoices, track payments, and manage recurring billing.",
    icon: DollarSign,
    category: "Finance",
    recommended: true,
  },
  {
    key: "expenses",
    name: "Expense Tracking",
    description: "Log expenses, categorize spending, and generate financial reports.",
    icon: FileText,
    category: "Finance",
  },
  
  // Communication
  {
    key: "communications",
    name: "Communication Hub",
    description: "Unified inbox for email, SMS, and internal messaging.",
    icon: MessageSquare,
    category: "Communication",
    recommended: true,
  },
  
  // Intelligence
  {
    key: "research_studio",
    name: "Research Studio",
    description: "AI-powered document analysis, market research, and knowledge base Q&A.",
    icon: BarChart3,
    category: "Intelligence",
    premium: true,
  },
];

export function ModuleEnablePanel({ 
  businessId, 
  businessType, 
  enabledModules, 
  onModuleToggle 
}: ModuleEnablePanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Core Business": true,
    "Operations": false,
    "Finance": false,
    "Communication": false,
    "Intelligence": false,
  });

  const categories = [...new Set(platformModules.map(m => m.category))];
  const modulesByCategory = categories.reduce((acc, category) => {
    acc[category] = platformModules.filter(m => m.category === category);
    return acc;
  }, {} as Record<string, PlatformModule[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleToggle = (moduleKey: string, enabled: boolean) => {
    onModuleToggle(moduleKey, enabled);
    toast.success(enabled ? `${moduleKey} enabled` : `${moduleKey} disabled`);
  };

  const enabledCount = Object.values(enabledModules).filter(Boolean).length;
  const recommendedCount = platformModules.filter(m => m.recommended && enabledModules[m.key]).length;
  const totalRecommended = platformModules.filter(m => m.recommended).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Platform Modules</h3>
          <p className="text-sm text-muted-foreground">
            Enable the tools your business needs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {enabledCount} enabled
          </Badge>
          <Badge variant="outline" className="text-xs">
            {recommendedCount}/{totalRecommended} recommended
          </Badge>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-muted border border-border rounded-lg p-3 mb-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">AI Recommendation</p>
          <p className="text-xs text-muted-foreground">
            Based on your {businessType || "business"} profile, we recommend enabling the modules marked with the{" "}
            <Badge variant="secondary" className="text-xs px-1 py-0">recommended</Badge> tag.
          </p>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-2">
        <div className="space-y-3">
          {categories.map((category) => (
            <Collapsible 
              key={category}
              open={expandedCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    {expandedCategories[category] ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm">{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {modulesByCategory[category].filter(m => enabledModules[m.key]).length}/
                      {modulesByCategory[category].length}
                    </Badge>
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-2 mt-2 pl-2">
                  {modulesByCategory[category].map((module) => {
                    const Icon = module.icon;
                    const isEnabled = enabledModules[module.key] ?? false;
                    
                    return (
                      <div
                        key={module.key}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                          isEnabled ? "bg-muted border-foreground/20" : "bg-card border-border"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          isEnabled ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{module.name}</span>
                            {module.recommended && (
                              <Badge variant="secondary" className="text-xs">recommended</Badge>
                            )}
                            {module.premium && (
                              <Badge variant="outline" className="text-xs">
                                premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {module.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <WhitePaperIcon 
                            moduleKey={module.key} 
                            moduleName={module.name}
                          />
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleToggle(module.key, checked)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <Button variant="outline" size="sm" onClick={() => {
          const recommended = platformModules.filter(m => m.recommended);
          recommended.forEach(m => onModuleToggle(m.key, true));
          toast.success("Recommended modules enabled");
        }}>
          Enable Recommended
        </Button>
        <Button size="sm">
          Save Configuration
        </Button>
      </div>
    </Card>
  );
}
