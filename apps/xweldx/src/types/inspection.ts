export interface Inspection {
  id: string;
  timestamp: Date;
  welderId: string;
  welderName: string;
  location: string;
  gpsCoords?: { lat: number; lng: number };
  defects: Defect[];
  status: 'in-progress' | 'completed' | 'requires-review';
  wpsRef: string;
  notes: string;
  photos: string[];
  audioNotes: string[];
  costs: InspectionCost;
}

export interface Defect {
  id: string;
  type: DefectType;
  severity: 'critical' | 'major' | 'minor';
  location: string;
  description: string;
  photoUrl?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  timestamp: Date;
  repairRequired: boolean;
  repairStatus?: 'pending' | 'in-progress' | 'completed';
}

export type DefectType = 
  | 'undercut'
  | 'porosity'
  | 'lack-of-fusion'
  | 'sloppy-weld'
  | 'cold-lap'
  | 'crack'
  | 'incomplete-penetration'
  | 'spatter'
  | 'distortion';

export interface InspectionCost {
  laborHours: number;
  laborRate: number;
  materials: MaterialCost[];
  totalCost: number;
}

export interface MaterialCost {
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PipeSupport {
  id: string;
  name: string;
  type: 'spring-can' | 'hanger' | 'guide' | 'anchor' | 'saddle';
  blueprintRef: string;
  location: string;
  gpsCoords?: { lat: number; lng: number };
  lastInspection?: Date;
  status: 'good' | 'needs-repair' | 'critical';
  inspections: string[];
}

export interface ARGlassesStatus {
  connected: boolean;
  deviceName: string;
  batteryLevel: number;
  streaming: boolean;
  modelLoaded: boolean;
}

export interface DashboardMetrics {
  totalInspections: number;
  defectsFound: number;
  criticalDefects: number;
  repairCosts: number;
  inspectionsToday: number;
  avgInspectionTime: number;
  complianceRate: number;
}
