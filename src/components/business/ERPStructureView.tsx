import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderTree, 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Building2,
  Users,
  DollarSign,
  Package,
  Megaphone,
  Settings,
  Download,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ERPStructureViewProps {
  erpData: any;
  businessName: string;
}

interface FolderNodeProps {
  name: string;
  data: any;
  level?: number;
  icon?: React.ReactNode;
}

const moduleIcons: Record<string, React.ReactNode> = {
  'Client Management': <Users className="w-4 h-4" />,
  'Clients': <Users className="w-4 h-4" />,
  'Project Delivery': <Package className="w-4 h-4" />,
  'Projects': <Package className="w-4 h-4" />,
  'Financials': <DollarSign className="w-4 h-4" />,
  'Finance': <DollarSign className="w-4 h-4" />,
  'Marketing': <Megaphone className="w-4 h-4" />,
  'Marketing & Content': <Megaphone className="w-4 h-4" />,
  'R&D': <Settings className="w-4 h-4" />,
  'Operations': <Building2 className="w-4 h-4" />,
};

const FolderNode = ({ name, data, level = 0, icon }: FolderNodeProps) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0;
  const isArray = Array.isArray(data);

  const displayIcon = icon || moduleIcons[name] || (hasChildren ? (isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />) : <FileText className="w-4 h-4" />);

  return (
    <div className={cn("select-none", level > 0 && "ml-4 border-l border-border/50 pl-3")}>
      <div 
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors",
          hasChildren && "hover:bg-muted/50",
          isOpen && hasChildren && "bg-muted/30"
        )}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren && (
          <span className="text-muted-foreground">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
        <span className={cn(
          "text-primary",
          !hasChildren && "text-muted-foreground ml-4"
        )}>
          {displayIcon}
        </span>
        <span className={cn(
          "text-sm font-medium",
          !hasChildren && "text-muted-foreground font-normal"
        )}>
          {name}
        </span>
        {isArray && (
          <Badge variant="secondary" className="text-xs ml-auto">
            {data.length} items
          </Badge>
        )}
      </div>
      
      {isOpen && hasChildren && (
        <div className="animate-in slide-in-from-top-1">
          {Object.entries(data).map(([key, value]) => (
            <FolderNode key={key} name={key} data={value} level={level + 1} />
          ))}
        </div>
      )}
      
      {isOpen && isArray && data.length > 0 && (
        <div className="ml-8 space-y-1 py-2">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground py-1 px-2">
              <FileText className="w-3 h-3" />
              <span>{typeof item === 'string' ? item : item.name || item.title || `Item ${index + 1}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function ERPStructureView({ erpData, businessName }: ERPStructureViewProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(erpData, null, 2));
    toast.success("ERP structure copied to clipboard");
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(erpData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-erp-structure.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("ERP structure downloaded");
  };

  // Parse the ERP structure - handle 'raw' property if it's a string
  const parseERPData = () => {
    if (!erpData) return null;
    
    // Check if there's a 'raw' property with JSON string
    if (erpData.raw && typeof erpData.raw === 'string') {
      try {
        return JSON.parse(erpData.raw);
      } catch (e) {
        console.error("Failed to parse ERP raw data:", e);
        return erpData;
      }
    }
    
    // Return the structure directly
    return erpData.organization_structure || erpData.modules || erpData.structure || erpData;
  };
  
  const parsedData = parseERPData();
  const modules = parsedData?.departments || parsedData?.modules || parsedData?.structure || parsedData;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FolderTree className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">ERP Structure</h2>
            <p className="text-sm text-muted-foreground">Organizational structure for {businessName}</p>
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

      {/* Structure Visualization */}
      <Card className="p-6">
        <div className="space-y-1">
          {typeof modules === 'object' && !Array.isArray(modules) ? (
            Object.entries(modules).map(([key, value]) => (
              <FolderNode key={key} name={key} data={value} />
            ))
          ) : Array.isArray(modules) ? (
            modules.map((module: any, index: number) => (
              <FolderNode 
                key={index} 
                name={module.name || module.title || `Module ${index + 1}`} 
                data={module.children || module.folders || module.items || {}} 
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>No structure data available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Raw Data (collapsed by default) */}
      <details className="group">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-2">
          <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
          View Raw JSON
        </summary>
        <Card className="mt-2 p-4">
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(erpData, null, 2)}
          </pre>
        </Card>
      </details>
    </div>
  );
}
