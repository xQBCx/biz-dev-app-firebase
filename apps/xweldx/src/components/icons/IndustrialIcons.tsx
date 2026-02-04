import React from "react";
import { 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Glasses, 
  Mic, 
  Camera,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  Zap,
  Settings,
  FileText,
  BarChart3,
  Users,
  Shield,
  Wrench,
  Eye,
  Play,
  Pause,
  Square,
  Circle,
  ChevronRight,
  ChevronDown,
  X,
  Menu,
  Home,
  ClipboardList,
  Target
} from "lucide-react";

export const Icons = {
  flame: Flame,
  alertTriangle: AlertTriangle,
  checkCircle: CheckCircle2,
  glasses: Glasses,
  mic: Mic,
  camera: Camera,
  mapPin: MapPin,
  clock: Clock,
  wifi: Wifi,
  wifiOff: WifiOff,
  zap: Zap,
  settings: Settings,
  fileText: FileText,
  barChart: BarChart3,
  users: Users,
  shield: Shield,
  wrench: Wrench,
  eye: Eye,
  play: Play,
  pause: Pause,
  stop: Square,
  record: Circle,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  close: X,
  menu: Menu,
  home: Home,
  clipboard: ClipboardList,
  target: Target,
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

// Custom Weld Spark Icon
export const WeldSparkIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2L12 6" />
      <path d="M12 18L12 22" />
      <path d="M4.93 4.93L7.76 7.76" />
      <path d="M16.24 16.24L19.07 19.07" />
      <path d="M2 12L6 12" />
      <path d="M18 12L22 12" />
      <path d="M4.93 19.07L7.76 16.24" />
      <path d="M16.24 7.76L19.07 4.93" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  )
);
WeldSparkIcon.displayName = "WeldSparkIcon";

// Pipe Support Icon
export const PipeSupportIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M6 12V20" />
      <path d="M18 12V20" />
      <path d="M4 20H8" />
      <path d="M16 20H20" />
      <path d="M10 8V4" />
      <path d="M14 8V4" />
    </svg>
  )
);
PipeSupportIcon.displayName = "PipeSupportIcon";

// Defect Detection Icon
export const DefectIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8V12L15 15" />
      <path d="M8 16L16 8" className="text-destructive" stroke="currentColor" />
    </svg>
  )
);
DefectIcon.displayName = "DefectIcon";
