import { DashboardMetrics, Inspection, Defect, PipeSupport } from "@/types/inspection";

export const mockMetrics: DashboardMetrics = {
  totalInspections: 1247,
  defectsFound: 89,
  criticalDefects: 12,
  repairCosts: 45680,
  inspectionsToday: 23,
  avgInspectionTime: 18,
  complianceRate: 94.2,
};

export const mockRecentInspections: Inspection[] = [
  {
    id: "INS-001",
    timestamp: new Date("2024-01-15T09:30:00"),
    welderId: "WLD-042",
    welderName: "John Martinez",
    location: "Unit 3 - Header B-12",
    gpsCoords: { lat: 29.7604, lng: -95.3698 },
    defects: [
      {
        id: "DEF-001",
        type: "undercut",
        severity: "major",
        location: "6 o'clock position",
        description: "0.8mm undercut on root pass",
        timestamp: new Date("2024-01-15T09:32:00"),
        repairRequired: true,
        repairStatus: "pending",
      },
    ],
    status: "requires-review",
    wpsRef: "WPS-2024-001",
    notes: "Undercut detected at root pass, recommend grinding and reweld",
    photos: [],
    audioNotes: [],
    costs: {
      laborHours: 2.5,
      laborRate: 65,
      materials: [
        { name: "ER70S-6 Wire", quantity: 1, unitCost: 45, totalCost: 45 },
        { name: "Grinding Disc", quantity: 2, unitCost: 8, totalCost: 16 },
      ],
      totalCost: 223.5,
    },
  },
  {
    id: "INS-002",
    timestamp: new Date("2024-01-15T10:15:00"),
    welderId: "WLD-018",
    welderName: "Sarah Chen",
    location: "Unit 2 - Riser C-05",
    gpsCoords: { lat: 29.7612, lng: -95.3701 },
    defects: [],
    status: "completed",
    wpsRef: "WPS-2024-003",
    notes: "All welds passed visual inspection per ASME Sec VIII",
    photos: [],
    audioNotes: [],
    costs: {
      laborHours: 1.0,
      laborRate: 65,
      materials: [],
      totalCost: 65,
    },
  },
  {
    id: "INS-003",
    timestamp: new Date("2024-01-15T11:00:00"),
    welderId: "WLD-027",
    welderName: "Mike Johnson",
    location: "Unit 1 - Spring Can SC-47",
    gpsCoords: { lat: 29.7598, lng: -95.3695 },
    defects: [
      {
        id: "DEF-002",
        type: "porosity",
        severity: "critical",
        location: "Cap pass cluster",
        description: "Cluster porosity exceeding acceptance criteria",
        timestamp: new Date("2024-01-15T11:05:00"),
        repairRequired: true,
        repairStatus: "in-progress",
      },
      {
        id: "DEF-003",
        type: "lack-of-fusion",
        severity: "critical",
        location: "Sidewall fusion zone",
        description: "LOF detected at 3 o'clock position",
        timestamp: new Date("2024-01-15T11:08:00"),
        repairRequired: true,
        repairStatus: "pending",
      },
    ],
    status: "requires-review",
    wpsRef: "WPS-2024-002",
    notes: "Multiple critical defects - requires immediate repair before operation",
    photos: [],
    audioNotes: [],
    costs: {
      laborHours: 4.0,
      laborRate: 75,
      materials: [
        { name: "Carbon Arc Gouging Electrodes", quantity: 5, unitCost: 12, totalCost: 60 },
        { name: "ER70S-6 Wire", quantity: 2, unitCost: 45, totalCost: 90 },
        { name: "Grinding Disc", quantity: 4, unitCost: 8, totalCost: 32 },
      ],
      totalCost: 482,
    },
  },
];

export const mockPipeSupports: PipeSupport[] = [
  {
    id: "PS-001",
    name: "Spring Can SC-47",
    type: "spring-can",
    blueprintRef: "DWG-2024-SC-001",
    location: "Unit 1 - Bay 12",
    lastInspection: new Date("2024-01-15"),
    status: "critical",
    inspections: ["INS-003"],
  },
  {
    id: "PS-002",
    name: "Constant Hanger CH-23",
    type: "hanger",
    blueprintRef: "DWG-2024-CH-002",
    location: "Unit 2 - Bay 8",
    lastInspection: new Date("2024-01-14"),
    status: "good",
    inspections: [],
  },
  {
    id: "PS-003",
    name: "Pipe Guide PG-15",
    type: "guide",
    blueprintRef: "DWG-2024-PG-003",
    location: "Unit 3 - Bay 5",
    lastInspection: new Date("2024-01-10"),
    status: "needs-repair",
    inspections: [],
  },
];

export const defectTypeLabels: Record<string, string> = {
  undercut: "Undercut",
  porosity: "Porosity",
  "lack-of-fusion": "Lack of Fusion",
  "sloppy-weld": "Sloppy Weld",
  "cold-lap": "Cold Lap",
  crack: "Crack",
  "incomplete-penetration": "Incomplete Penetration",
  spatter: "Excessive Spatter",
  distortion: "Distortion",
};

export const severityColors = {
  critical: "destructive",
  major: "warning",
  minor: "minor",
} as const;
