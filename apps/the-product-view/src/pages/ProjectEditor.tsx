import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SceneViewer } from "@/components/3d/SceneViewer";
import { AssetSidebar } from "@/components/editor/AssetSidebar";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

interface SceneObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
}

const ProjectEditor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [history, setHistory] = useState<SceneObject[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [environmentImages, setEnvironmentImages] = useState<string[]>([]);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load project and scene
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      if (project.owner_id !== session.user.id) {
        toast({
          title: "Access denied",
          description: "You don't have permission to edit this project.",
          variant: "destructive",
        });
        navigate("/lite/dashboard");
        return;
      }

      // Load scene
      const { data: scenes, error: sceneError } = await supabase
        .from("scenes")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (sceneError) throw sceneError;

      if (scenes && scenes.length > 0) {
        const sceneState = scenes[0].state as { objects?: SceneObject[]; uploadedImages?: string[] };
        setSceneObjects(sceneState.objects || []);
        setEnvironmentImages(sceneState.uploadedImages || []);
        setHistory([sceneState.objects || []]);
        setHistoryIndex(0);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading project:", error);
      toast({
        title: "Error loading project",
        description: error.message,
        variant: "destructive",
      });
      navigate("/lite/dashboard");
    }
  };

  const saveHistory = (objects: SceneObject[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(objects);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleAddAsset = (type: string) => {
    const newObject: SceneObject = {
      id: `obj-${Date.now()}`,
      type,
      position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: "#ffffff",
    };

    const newObjects = [...sceneObjects, newObject];
    setSceneObjects(newObjects);
    saveHistory(newObjects);
    setSelectedObjectId(newObject.id);

    toast({
      title: "Asset added",
      description: `${type} added to scene`,
    });
  };

  const handleUpdateObject = (updates: Partial<SceneObject>) => {
    if (!selectedObjectId) return;

    const newObjects = sceneObjects.map((obj) =>
      obj.id === selectedObjectId ? { ...obj, ...updates } : obj
    );
    setSceneObjects(newObjects);
    saveHistory(newObjects);
  };

  const handleDeleteObject = () => {
    if (!selectedObjectId) return;

    const newObjects = sceneObjects.filter((obj) => obj.id !== selectedObjectId);
    setSceneObjects(newObjects);
    saveHistory(newObjects);
    setSelectedObjectId(null);

    toast({
      title: "Object deleted",
    });
  };

  const handleDuplicateObject = () => {
    if (!selectedObjectId) return;

    const objectToDuplicate = sceneObjects.find((obj) => obj.id === selectedObjectId);
    if (!objectToDuplicate) return;

    const newObject = {
      ...objectToDuplicate,
      id: `obj-${Date.now()}`,
      position: [
        objectToDuplicate.position[0] + 1,
        objectToDuplicate.position[1],
        objectToDuplicate.position[2] + 1,
      ] as [number, number, number],
    };

    const newObjects = [...sceneObjects, newObject];
    setSceneObjects(newObjects);
    saveHistory(newObjects);
    setSelectedObjectId(newObject.id);

    toast({
      title: "Object duplicated",
    });
  };

  const handleSave = async () => {
    try {
      const { data: scenes } = await supabase
        .from("scenes")
        .select("id")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1);

      const sceneState = { objects: sceneObjects };

      if (scenes && scenes.length > 0) {
        await supabase
          .from("scenes")
          .update({ state: sceneState as any })
          .eq("id", scenes[0].id);
      } else {
        await supabase.from("scenes").insert([{
          project_id: projectId,
          state: sceneState as any,
        }]);
      }

      toast({
        title: "Project saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error saving:", error);
      toast({
        title: "Error saving project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSceneObjects(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSceneObjects(history[newIndex]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  const selectedObject = sceneObjects.find((obj) => obj.id === selectedObjectId) || null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorToolbar
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPreview={() => toast({ title: "Preview mode coming soon!" })}
        onShare={() => toast({ title: "Share feature coming soon!" })}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Asset Sidebar */}
        <div className="w-80 border-r border-border overflow-hidden">
          <AssetSidebar onAddAsset={handleAddAsset} />
        </div>

        {/* 3D Viewer */}
        <div className="flex-1 relative bg-gradient-elegant">
          <SceneViewer
            sceneObjects={sceneObjects}
            environmentImages={environmentImages}
            onObjectSelect={setSelectedObjectId}
            selectedObjectId={selectedObjectId}
          />
          
          {/* Floating hint */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-elegant border border-border">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Click objects to select • Drag to move camera</span>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 border-l border-border overflow-hidden">
          <PropertiesPanel
            selectedObject={selectedObject}
            onUpdate={handleUpdateObject}
            onDelete={handleDeleteObject}
            onDuplicate={handleDuplicateObject}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
