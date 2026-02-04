import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Undo,
  Redo,
  Save,
  Eye,
  Share2,
  Settings,
  Maximize,
  Sun,
  Moon,
  Camera,
  Grid3x3,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditorToolbarProps {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onShare: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const EditorToolbar = ({
  onSave,
  onUndo,
  onRedo,
  onPreview,
  onShare,
  canUndo = false,
  canRedo = false,
}: EditorToolbarProps) => {
  return (
    <div className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4">
      {/* Left section - History */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="transition-smooth"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="transition-smooth"
        >
          <Redo className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className="hover:text-primary transition-smooth"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Center section - View controls */}
      <div className="flex items-center gap-2">
        <Select defaultValue="perspective">
          <SelectTrigger className="w-32 h-8">
            <Camera className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="perspective">Perspective</SelectItem>
            <SelectItem value="top">Top View</SelectItem>
            <SelectItem value="side">Side View</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="sm">
          <Sun className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Grid3x3 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button size="sm" className="shadow-soft">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};
