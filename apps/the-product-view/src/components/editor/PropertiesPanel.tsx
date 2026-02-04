import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Trash2, Copy, Move } from "lucide-react";

interface SceneObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
}

interface PropertiesPanelProps {
  selectedObject: SceneObject | null;
  onUpdate: (updates: Partial<SceneObject>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const PropertiesPanel = ({
  selectedObject,
  onUpdate,
  onDelete,
  onDuplicate,
}: PropertiesPanelProps) => {
  if (!selectedObject) {
    return (
      <Card className="h-full p-6 flex items-center justify-center text-center shadow-elegant">
        <div className="text-muted-foreground">
          <Move className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select an object to edit its properties</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-elegant">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold mb-1">{selectedObject.type.toUpperCase()}</h3>
        <p className="text-xs text-muted-foreground">Object Properties</p>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Transform */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Transform</Label>
          
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Position X</Label>
              <Slider
                value={[selectedObject.position[0]]}
                onValueChange={([x]) =>
                  onUpdate({ position: [x, selectedObject.position[1], selectedObject.position[2]] })
                }
                min={-10}
                max={10}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Position Z</Label>
              <Slider
                value={[selectedObject.position[2]]}
                onValueChange={([z]) =>
                  onUpdate({ position: [selectedObject.position[0], selectedObject.position[1], z] })
                }
                min={-10}
                max={10}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Rotation Y</Label>
              <Slider
                value={[selectedObject.rotation[1]]}
                onValueChange={([y]) =>
                  onUpdate({ rotation: [selectedObject.rotation[0], y, selectedObject.rotation[2]] })
                }
                min={0}
                max={Math.PI * 2}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Scale</Label>
              <Slider
                value={[selectedObject.scale[0]]}
                onValueChange={([s]) => onUpdate({ scale: [s, s, s] })}
                min={0.5}
                max={3}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Color */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Appearance</Label>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={selectedObject.color || "#ffffff"}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={selectedObject.color || "#ffffff"}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Actions</Label>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              size="sm"
              onClick={onDuplicate}
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
