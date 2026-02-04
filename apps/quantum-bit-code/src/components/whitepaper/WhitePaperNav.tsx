import { cn } from "@/lib/utils";
import { 
  Hexagon, 
  Layers, 
  Key, 
  Globe, 
  Fingerprint, 
  ArrowLeftRight, 
  Shield,
  FileText,
  Brain
} from "lucide-react";

interface WhitePaperNavProps {
  activeModule: string | null;
  onModuleChange: (module: string | null) => void;
}

const modules = [
  { id: null, label: "Complete System", icon: FileText, color: "text-foreground" },
  { id: "qbc", label: "QBC Encoding", icon: Hexagon, color: "text-primary" },
  { id: "mesh34", label: "MESH 34", icon: Layers, color: "text-quantum-blue" },
  { id: "luxkey", label: "LUXKEY", icon: Key, color: "text-quantum-orange" },
  { id: "earthpulse", label: "EarthPulse", icon: Globe, color: "text-quantum-green" },
  { id: "fractalpulse", label: "FractalPulse", icon: Fingerprint, color: "text-quantum-purple" },
  { id: "bridge", label: "Bridge", icon: ArrowLeftRight, color: "text-primary" },
  { id: "doctrine", label: "Doctrine", icon: Shield, color: "text-primary" },
  { id: "lexie", label: "LEXIE", icon: Brain, color: "text-destructive" },
];

const WhitePaperNav = ({ activeModule, onModuleChange }: WhitePaperNavProps) => {
  return (
    <nav className="space-y-1">
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 px-3">
        Modules
      </p>
      {modules.map((module) => {
        const isActive = activeModule === module.id;
        const Icon = module.icon;
        
        return (
          <button
            key={module.id ?? "all"}
            onClick={() => onModuleChange(module.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
              isActive 
                ? "bg-primary/10 text-foreground border border-primary/30" 
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? module.color : "")} />
            <span>{module.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default WhitePaperNav;
