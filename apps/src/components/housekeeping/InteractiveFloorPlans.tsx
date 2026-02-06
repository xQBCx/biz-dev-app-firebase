import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  Wrench,
  Sparkles,
  Map as MapIcon,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  ListChecks,
  ClipboardCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Download,
  QrCode,
  Image as ImageIcon,
  Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import QRCode from "react-qr-code";

// Types
export type RoomStatus =
  | "clean"
  | "dirty"
  | "in_progress"
  | "inspected"
  | "out_of_order"
  | "dnd"
  | "vacant"
  | "occupied";

export type RoomPoly = { x: number; y: number }[];

export type Room = {
  id: string;
  name?: string;
  floorId: string;
  polygon: RoomPoly;
  status: RoomStatus[];
  priority?: "normal" | "high" | "urgent";
  lastCleanedAt?: string;
  lastInspectedAt?: string;
  notes?: string[];
  assets?: string[];
  tags?: string[];
};

export type Floor = {
  id: string;
  name: string;
  imageUrl?: string;
  rooms: Room[];
};

// Helpers
const statusColor: Record<RoomStatus, string> = {
  clean: "fill-green-500/30 stroke-green-700",
  dirty: "fill-red-500/30 stroke-red-700",
  in_progress: "fill-amber-500/30 stroke-amber-700",
  inspected: "fill-emerald-500/30 stroke-emerald-700",
  out_of_order: "fill-zinc-500/30 stroke-zinc-700",
  dnd: "fill-fuchsia-500/30 stroke-fuchsia-700",
  vacant: "fill-sky-500/20 stroke-sky-700",
  occupied: "fill-blue-500/20 stroke-blue-700",
};

const statusLabel: Record<RoomStatus, string> = {
  clean: "Clean",
  dirty: "Dirty",
  in_progress: "In Progress",
  inspected: "Inspected",
  out_of_order: "Out of Order",
  dnd: "Do Not Disturb",
  vacant: "Vacant",
  occupied: "Occupied",
};

function classNames(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function toPoints(poly: RoomPoly) {
  return poly.map((p) => `${p.x},${p.y}`).join(" ");
}

function rect(x: number, y: number, w: number, h: number): RoomPoly {
  return [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ];
}

function genRow(
  ids: (string | number)[],
  startX: number,
  endX: number,
  y: number,
  height: number,
  floorId: string
): Room[] {
  const n = ids.length;
  const gap = 2; // Reduced gap for tighter spacing
  const span = endX - startX;
  const w = span / n;
  return ids.map((id, i) => {
    const x = startX + i * w + gap * 0.5;
    const width = Math.max(10, w - gap);
    return {
      id: String(id),
      floorId,
      name: undefined,
      polygon: rect(x, y, width, height),
      status: ["vacant", "dirty"],
      assets: ["TV", "PTAC"],
      tags: [],
    } as Room;
  });
}

function generateFloor1(): Floor {
  const floorId = "1F";
  // Much tighter vertical spacing - bringing top and bottom rooms closer
  const leftTop = genRow([101, 103, 105, 107], 60, 440, 250, 100, floorId);
  const leftBottom = genRow([102, 104, 106, 108], 60, 440, 380, 100, floorId);
  const rightTop = genRow([121, 123, 126, 127, 129, 131, 133], 480, 940, 250, 100, floorId);
  const rightBottom = genRow([128, 130], 480, 720, 380, 100, floorId);
  const rooms = [...leftTop, ...leftBottom, ...rightTop, ...rightBottom];
  return { id: floorId, name: "First Floor", rooms };
}

function generateFloor2(): Floor {
  const floorId = "2F";
  const leftTop = genRow([201, 203, 205, 207, 209, 211, 213], 60, 440, 250, 100, floorId);
  const leftBottom = genRow([202, 204, 206, 208, 210, 212, 214, 216], 60, 440, 380, 100, floorId);
  const rightTop = genRow([219, 221, 223, 225, 227, 229, 231, 233], 480, 940, 250, 100, floorId);
  const rightBottom = genRow([218, 220, 222, 224, 226, 228, 230], 480, 940, 380, 100, floorId);
  const rooms = [...leftTop, ...leftBottom, ...rightTop, ...rightBottom];
  return { id: floorId, name: "Second Floor", rooms };
}

function generateFloor3(): Floor {
  const floorId = "3F";
  const leftTop = genRow([301, 303, 305, 307, 309, 311, 313], 60, 440, 250, 100, floorId);
  const leftBottom = genRow([302, 304, 306, 308, 310, 312, 314, 316], 60, 440, 380, 100, floorId);
  const rightTop = genRow([319, 321, 323, 325, 327, 329, 331, 333], 480, 940, 250, 100, floorId);
  const rightBottom = genRow([318, 320, 322, 324, 326, 328, 330], 480, 940, 380, 100, floorId);
  const rooms = [...leftTop, ...leftBottom, ...rightTop, ...rightBottom];
  return { id: floorId, name: "Third Floor", rooms };
}

const Legend = () => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium">Status Legend</h4>
    <div className="grid grid-cols-2 gap-1 text-xs">
      {Object.entries(statusLabel).map(([status, label]) => (
        <div key={status} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${statusColor[status as RoomStatus].replace('fill-', 'bg-').replace('/30', '').replace('/20', '')}`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  </div>
);

const Checklist = ({ room, onComplete }: { room: Room; onComplete: () => void }) => {
  const [items, setItems] = useState([
    // Set Room
    { id: 1, category: "Set Room", text: "Towels set and tags tucked", checked: false },
    { id: 2, category: "Set Room", text: "Toilet paper on roll-neatly folded", checked: false },
    { id: 3, category: "Set Room", text: "An extra roll of toilet paper", checked: false },
    { id: 4, category: "Set Room", text: "Box of tissue-neatly folded", checked: false },
    { id: 5, category: "Set Room", text: "1 bar of soap, 1 makeup remover, 1 tube of lotion", checked: false },
    { id: 6, category: "Set Room", text: "Check soap dispenser levels", checked: false },
    { id: 7, category: "Set Room", text: "Sanitized strip", checked: false },
    { id: 8, category: "Set Room", text: "4 cups", checked: false },
    { id: 9, category: "Set Room", text: "An ice bucket bag", checked: false },
    { id: 10, category: "Set Room", text: "1 can liner and 1 extra trash bag in both cans", checked: false },
    { id: 11, category: "Set Room", text: "1 brown blanket per bed", checked: false },
    { id: 12, category: "Set Room", text: "Check for missing signage", checked: false },

    // Make Bed
    { id: 13, category: "Make Bed", text: "Ensure the flat sheets match in double-bed rooms", checked: false },
    { id: 14, category: "Make Bed", text: "Seams of the flat sheet run vertically alongside of the bed", checked: false },
    { id: 15, category: "Make Bed", text: "Flat sheet and comforter fold 6 inches from headboard", checked: false },
    { id: 16, category: "Make Bed", text: "Tucks clean and crisp, comforter pulled tight without wrinkles", checked: false },
    { id: 17, category: "Make Bed", text: "Pillows placed diagonally with corners pointed", checked: false },

    // Sanitize/Cleaning Room
    { id: 18, category: "Sanitize/Cleaning", text: "High touch surface areas disinfected", checked: false },
    { id: 19, category: "Sanitize/Cleaning", text: "Desk, remote, TV guide disinfected", checked: false },
    { id: 20, category: "Sanitize/Cleaning", text: "Chairs wiped of any debris or hair", checked: false },
    { id: 21, category: "Sanitize/Cleaning", text: "Closet has 6 hangers and 1-2 brown blankets", checked: false },
    { id: 22, category: "Sanitize/Cleaning", text: "Closet mirror is free of smudges", checked: false },
    { id: 23, category: "Sanitize/Cleaning", text: "Shelves dusted", checked: false },
    { id: 24, category: "Sanitize/Cleaning", text: "Ice bucket clean/disinfected", checked: false },
    { id: 25, category: "Sanitize/Cleaning", text: "Microwave clean/disinfected", checked: false },
    { id: 26, category: "Sanitize/Cleaning", text: "Refrigerator clean/disinfected", checked: false },
    { id: 27, category: "Sanitize/Cleaning", text: "Window seat wiped of any debris and/or hair", checked: false },
    { id: 28, category: "Sanitize/Cleaning", text: "Window free of any handprints/smudges", checked: false },
    { id: 29, category: "Sanitize/Cleaning", text: "Curtains neatly tucked behind seat cushions", checked: false },
    { id: 30, category: "Sanitize/Cleaning", text: "Bedside table, alarm clock, phone dusted/disinfected", checked: false },
    { id: 31, category: "Sanitize/Cleaning", text: "Alarm clock time set correctly, alarms are off", checked: false },
    { id: 32, category: "Sanitize/Cleaning", text: "Thermostat is set to 68 degrees", checked: false },

    // Bathroom
    { id: 33, category: "Bathroom", text: "Mirror free of water spots/toothpaste", checked: false },
    { id: 34, category: "Bathroom", text: "Sink clean/disinfected", checked: false },
    { id: 35, category: "Bathroom", text: "Amenity Tray clean/disinfected", checked: false },
    { id: 36, category: "Bathroom", text: "Shower clean/disinfected/free of any hair", checked: false },
    { id: 37, category: "Bathroom", text: "All chrome fixtures disinfected/free of smudges", checked: false },
    { id: 38, category: "Bathroom", text: "Toilet wiped clean/disinfected/sanitized strip", checked: false },
    { id: 39, category: "Bathroom", text: "Floor vacuumed/mopped (free of any hair)", checked: false },

    // General Requirements
    { id: 40, category: "General", text: "Doors, walls, ceilings free of dirt, lint, hair, stains", checked: false },
    { id: 41, category: "General", text: "Furniture free of finger marks, smudges, cobwebs", checked: false },
    { id: 42, category: "General", text: "HVAC/PTAC units cleaned", checked: false },
    { id: 43, category: "General", text: "Windows and windowsills cleaned", checked: false },
    { id: 44, category: "General", text: "Report any maintenance issues to supervisor", checked: false },
  ]);

  const allChecked = items.every(item => item.checked);
  const categories = ["Set Room", "Make Bed", "Sanitize/Cleaning", "Bathroom", "General"];

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Cleaning Checklist</Label>
        {allChecked && (
          <Button size="sm" onClick={onComplete}>
            <ClipboardCheck className="w-4 h-4 mr-2"/>
            Mark Complete
          </Button>
        )}
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {categories.map((category) => {
          const categoryItems = items.filter(i => i.category === category);
          const categoryDone = categoryItems.every(i => i.checked);
          return (
            <div key={category} className="space-y-2">
              <h4 className={`font-semibold text-sm flex items-center gap-2 ${categoryDone ? 'text-green-600' : ''}`}>
                {categoryDone && <ClipboardCheck className="w-4 h-4" />}
                {category}
              </h4>
              <div className="space-y-1 pl-2">
                {categoryItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      className="w-4 h-4 mt-0.5 rounded"
                    />
                    <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <span className="text-sm text-muted-foreground">
          {items.filter(i => i.checked).length} of {items.length} completed
        </span>
      </div>
    </div>
  );
};

export default function InteractiveFloorPlans() {
  const [mode, setMode] = useState<"housekeeping" | "maintenance">("housekeeping");
  const [floors, setFloors] = useState<Floor[]>([
    generateFloor1(),
    generateFloor2(),
    generateFloor3(),
  ]);
  const [activeFloorId, setActiveFloorId] = useState<string>("1F");
  const activeFloor = floors.find((f) => f.id === activeFloorId)!;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [workOrderOpen, setWorkOrderOpen] = useState(false);
  const [traceMode, setTraceMode] = useState(false);
  const [dragPoint, setDragPoint] = useState<{ roomId: string; idx: number } | null>(null);

  function onMouseDown(e: React.MouseEvent) {
    if (traceMode) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (traceMode) return;
    if (!dragging.current || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    last.current = { x: e.clientX, y: e.clientY };
  }

  function onMouseUp() {
    dragging.current = false;
    last.current = null;
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeFloor.rooms.filter((r) => {
      const matchesQuery = !q || r.id.toLowerCase().includes(q) || (r.name || "").toLowerCase().includes(q);
      const matchesFilter = filter === "all" || r.status.includes(filter as RoomStatus);
      return matchesQuery && matchesFilter;
    });
  }, [activeFloor, query, filter]);

  function updateRoom(roomId: string, updater: (prev: Room) => Room) {
    setFloors((prev) =>
      prev.map((f) =>
        f.id !== activeFloorId
          ? f
          : {
              ...f,
              rooms: f.rooms.map((r) => (r.id === roomId ? updater(r) : r)),
            }
      )
    );
  }

  function setRoomStatus(room: Room, next: RoomStatus) {
    updateRoom(room.id, (prev) => {
      const other = prev.status.filter((s) => s !== "clean" && s !== "dirty" && s !== "in_progress" && s !== "inspected" && s !== "out_of_order");
      return { ...prev, status: [...other, next] };
    });
  }

  function toggleTag(room: Room, tag: RoomStatus) {
    updateRoom(room.id, (prev) => {
      const has = prev.status.includes(tag);
      return { ...prev, status: has ? prev.status.filter((t) => t !== tag) : [...prev.status, tag] };
    });
  }

  function setFloorImage(floorId: string, dataUrl: string) {
    setFloors((prev) =>
      prev.map((f) => (f.id === floorId ? { ...f, imageUrl: dataUrl } : f))
    );
  }

  function onUploadBackground(e: React.ChangeEvent<HTMLInputElement>, floorId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFloorImage(floorId, String(reader.result));
    reader.readAsDataURL(file);
  }

  function exportConfig() {
    const payload = JSON.stringify(floors, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smartlink-floor-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function startDragPoint(roomId: string, idx: number, e: React.MouseEvent) {
    e.stopPropagation();
    setTraceMode(true);
    setDragPoint({ roomId, idx });
  }

  function moveDragPoint(e: React.MouseEvent<SVGCircleElement>) {
    if (!traceMode || !dragPoint) return;
    const svg = (e.currentTarget.ownerSVGElement as SVGSVGElement)!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; 
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = pt.matrixTransform(ctm.inverse());
    updateRoom(dragPoint.roomId, (prev) => {
      const poly = prev.polygon.slice();
      poly[dragPoint.idx] = { x: Math.max(0, Math.min(1000, p.x)), y: Math.max(0, Math.min(1000, p.y)) };
      return { ...prev, polygon: poly };
    });
  }

  function endDragPoint() { 
    setTraceMode(false); 
    setDragPoint(null); 
  }

  return (
    <div className="w-full h-full p-3 grid grid-cols-12 gap-6">
      {/* Left: Controls */}
      <div className="col-span-4 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <MapIcon className="w-5 h-5"/> Hotel Floors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Tabs value={activeFloorId} onValueChange={setActiveFloorId}>
              <TabsList className="grid grid-cols-3">
                {floors.map((f) => (
                  <TabsTrigger key={f.id} value={f.id}>{f.id}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <div className="w-full relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 opacity-70"/>
                <Input placeholder="Search room # or name" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {(
                    [
                      "clean",
                      "dirty",
                      "in_progress",
                      "inspected",
                      "out_of_order",
                      "dnd",
                      "vacant",
                      "occupied",
                    ] as RoomStatus[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setMode("housekeeping")} 
                className={mode === "housekeeping" ? "ring-2 ring-primary" : ""}
              >
                <Sparkles className="w-4 h-4 mr-2"/> Housekeeping
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setMode("maintenance")} 
                className={mode === "maintenance" ? "ring-2 ring-primary" : ""}
              >
                <Wrench className="w-4 h-4 mr-2"/> Maintenance
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(4, z * 1.2))}>
                <ZoomIn className="w-4 h-4 mr-1"/>Zoom
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(0.25, z / 1.2))}>
                <ZoomOut className="w-4 h-4 mr-1"/>Zoom
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="w-4 h-4 mr-1"/>Reset
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4"/> Upload floor background
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {floors.map((f) => (
                  <label key={f.id} className="text-xs inline-flex items-center gap-2">
                    <Input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadBackground(e, f.id)} />
                    <span className="px-2 py-1 rounded border cursor-pointer">{f.id}</span>
                  </label>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Tip: upload the three JPGs you sent for 1F/2F/3F to align polygons visually.
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" className="w-full" onClick={exportConfig}>
                <Download className="w-4 h-4 mr-2"/>Export Layout JSON
              </Button>
            </div>

            <Legend />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks className="w-5 h-5"/> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectedRoom && setRoomStatus(selectedRoom, "clean")}
              disabled={!selectedRoom}
            >
              <ClipboardCheck className="w-4 h-4 mr-2"/>Mark Clean
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectedRoom && setRoomStatus(selectedRoom, "dirty")}
              disabled={!selectedRoom}
            >
              <AlertTriangle className="w-4 h-4 mr-2"/>Mark Dirty
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectedRoom && setRoomStatus(selectedRoom, "in_progress")}
              disabled={!selectedRoom}
            >
              <Wrench className="w-4 h-4 mr-2"/>In Progress
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectedRoom && setRoomStatus(selectedRoom, "inspected")}
              disabled={!selectedRoom}
            >
              <Info className="w-4 h-4 mr-2"/>Inspected
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Edit3 className="w-5 h-5"/> Trace Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Drag the round points to fine‑tune polygons over the background. Turn off by releasing the point.</p>
            <p className="text-muted-foreground">
              (We pre‑generated rectangles from your plans; this lets you calibrate quickly.)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right: Canvas */}
      <div className="col-span-8">
        <Card className="h-[85vh] shadow-sm overflow-hidden">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary"/> {activeFloor.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {filteredRooms.length} rooms
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Zoom: {Math.round(zoom * 100)}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-full p-0 relative">
            <div
              className="relative h-full w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60 select-none cursor-grab active:cursor-grabbing"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              {/* Mini toolbar overlay */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="shadow-md"
                  onClick={() => setZoom(z => Math.min(4, z * 1.3))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shadow-md"
                  onClick={() => setZoom(z => Math.max(0.3, z / 1.3))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shadow-md"
                  onClick={resetView}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <div
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) translate(-50%, -50%)`,
                  transformOrigin: "0 0",
                }}
              >
                <svg viewBox="0 0 1000 1000" className="block border rounded-lg shadow-inner" style={{ width: 1000, height: 700, backgroundColor: 'rgba(255,255,255,0.9)' }}>
                  {/* Background floor image or enhanced grid */}
                  {activeFloor.imageUrl ? (
                    <image href={activeFloor.imageUrl} x={0} y={0} width={1000} height={1000} preserveAspectRatio="xMidYMid meet" opacity="0.7" />
                  ) : (
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3"/>
                        <path d="M 25 0 L 25 50 M 0 25 L 50 25" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.15"/>
                      </pattern>
                      <linearGradient id="floorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.3"/>
                      </linearGradient>
                    </defs>
                  )}
                  {!activeFloor.imageUrl && (
                    <>
                      <rect x={0} y={0} width={1000} height={1000} fill="url(#floorGradient)" />
                      <rect x={0} y={0} width={1000} height={1000} fill="url(#grid)" />
                    </>
                  )}

                  {filteredRooms.map((room) => (
                    <g key={room.id} onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }} className="cursor-pointer">
                      {(() => {
                        const paint = room.status.find((s) => ["out_of_order","in_progress","dirty","clean","inspected","dnd"].includes(s))
                          || room.status[0]
                          || "vacant";
                        return (
                          <polygon
                            points={toPoints(room.polygon)}
                            className={classNames("stroke-[2]", statusColor[paint as RoomStatus])}
                          />
                        );
                      })()}
                      {traceMode && room.polygon.map((pt, idx) => (
                        <circle
                          key={`${room.id}-${idx}`}
                          cx={pt.x}
                          cy={pt.y}
                          r={8}
                          className="fill-white stroke-primary stroke-[2]"
                          onMouseDown={(e) => startDragPoint(room.id, idx, e)}
                          onMouseMove={moveDragPoint}
                          onMouseUp={endDragPoint}
                        />
                      ))}
                      {/* Enhanced room label with status indicator */}
                      {(() => {
                        const xs = room.polygon.map(p => p.x);
                        const ys = room.polygon.map(p => p.y);
                        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
                        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
                        const primaryStatus = room.status.find((s) => ["out_of_order","in_progress","dirty","clean","inspected"].includes(s)) || "vacant";
                        const statusIcon = {
                          clean: "✓",
                          dirty: "!",
                          in_progress: "⏳",
                          inspected: "★",
                          out_of_order: "✕",
                          dnd: "🚫",
                          vacant: "",
                          occupied: "👤"
                        }[primaryStatus];
                        
                        return (
                          <g>
                            <text x={cx} y={cy-8} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[14px] font-bold drop-shadow-sm">
                              {room.id}
                            </text>
                            {statusIcon && (
                              <text x={cx} y={cy+8} textAnchor="middle" dominantBaseline="middle" className="text-[12px]">
                                {statusIcon}
                              </text>
                            )}
                          </g>
                        );
                      })()}
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Drawer */}
      <Sheet open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <SheetContent side="right" className="w-[520px] sm:max-w-none overflow-y-auto">
          {selectedRoom && (
            <div className="space-y-4">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Room {selectedRoom.id} {selectedRoom.name ? `— ${selectedRoom.name}` : ""}</span>
                  <Badge variant="outline">{activeFloor.name}</Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-wrap gap-2">
                {selectedRoom.status.map((s) => (
                  <Badge key={s} variant="secondary">{statusLabel[s]}</Badge>
                ))}
                {(selectedRoom.tags || []).map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setRoomStatus(selectedRoom, "clean")}>
                  <ClipboardCheck className="w-4 h-4 mr-2"/>Mark Clean
                </Button>
                <Button variant="outline" onClick={() => setRoomStatus(selectedRoom, "dirty")}>
                  <AlertTriangle className="w-4 h-4 mr-2"/>Mark Dirty
                </Button>
                <Button variant="outline" onClick={() => setRoomStatus(selectedRoom, "in_progress")}>
                  <Wrench className="w-4 h-4 mr-2"/>In Progress
                </Button>
                <Button variant="outline" onClick={() => setRoomStatus(selectedRoom, "inspected")}>
                  <Info className="w-4 h-4 mr-2"/>Inspected
                </Button>
                <Button variant="outline" onClick={() => toggleTag(selectedRoom, "occupied")}>
                  {selectedRoom.status.includes("occupied") ? "Set Vacant" : "Set Occupied"}
                </Button>
                <Button variant="outline" onClick={() => toggleTag(selectedRoom, "out_of_order")}>
                  {selectedRoom.status.includes("out_of_order") ? "Clear OOO" : "Mark OOO"}
                </Button>
              </div>

              <Tabs defaultValue={mode} value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList>
                  <TabsTrigger value="housekeeping">
                    <Sparkles className="w-4 h-4 mr-2"/>Housekeeping
                  </TabsTrigger>
                  <TabsTrigger value="maintenance">
                    <Wrench className="w-4 h-4 mr-2"/>Maintenance
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="housekeeping" className="space-y-3">
                  <Checklist room={selectedRoom} onComplete={() => setRoomStatus(selectedRoom, "inspected")} />
                  <div className="space-y-2">
                    <Label htmlFor="hk-notes">Notes</Label>
                    <Textarea id="hk-notes" placeholder="Add housekeeping notes..." />
                  </div>
                  <div className="space-y-2">
                    <Label>QR Code (Door Sticker)</Label>
                    <div className="p-4 bg-white rounded-xl inline-block">
                      <QRCode value={`https://smartlink.app/room/${selectedRoom.id}`} size={128} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-3">
                  <div className="space-y-2">
                    <Label>Assets</Label>
                    <div className="flex flex-wrap gap-2">
                      {(selectedRoom.assets || ["TV","PTAC"]).map((a) => (
                        <Badge key={a} variant="outline">{a}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="default" onClick={() => setWorkOrderOpen(true)}>
                    <Plus className="w-4 h-4 mr-2"/> New Work Order
                  </Button>
                  <div className="space-y-2">
                    <Label htmlFor="mt-notes">Notes</Label>
                    <Textarea id="mt-notes" placeholder="Add maintenance notes..." />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="text-xs text-muted-foreground">
                Tip: Upload the exact plan JPG for this floor, then toggle Trace Mode and drag the corners of any room polygon to align perfectly.
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Work Order Dialog */}
      <Dialog open={workOrderOpen} onOpenChange={setWorkOrderOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>New Work Order — Room {selectedRoom?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label>Issue Type</Label>
              <Select defaultValue="general">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Priority</Label>
              <Select defaultValue="normal">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the issue..." />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWorkOrderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setWorkOrderOpen(false)}>
                <Save className="w-4 h-4 mr-2"/>Create Work Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}