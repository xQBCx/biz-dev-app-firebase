import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LiteNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [projectName, setProjectName] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prev) => [...prev, ...files].slice(0, 20));
    }
  };

  const handleCreate = async () => {
    if (images.length < 6) {
      toast({
        title: "More photos needed",
        description: "Please upload at least 6 photos to create your 3D environment.",
        variant: "destructive",
      });
      return;
    }

    if (!projectName) {
      toast({
        title: "Project name required",
        description: "Please give your wedding project a name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      toast({
        title: "Uploading images...",
        description: `Uploading ${images.length} photos`,
      });

      // Upload images to storage
      const uploadedPaths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileName = `${session.user.id}/${Date.now()}_${i}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from("environments")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload image ${i + 1}`,
            variant: "destructive",
          });
          return;
        }

        uploadedPaths.push(fileName);
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: projectName,
          mode: "lite",
          owner_id: session.user.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create initial scene with uploaded images
      await supabase.from("scenes").insert([{
        project_id: project.id,
        state: { objects: [], uploadedImages: uploadedPaths } as any,
        lite_env_storage_path: uploadedPaths[0],
      }]);

      toast({
        title: "Project created!",
        description: "Opening your 3D editor...",
      });

      // Navigate to editor
      setTimeout(() => {
        navigate(`/project/${project.id}/editor`);
      }, 1000);
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm mb-4 shadow-elegant">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered 3D Creation</span>
            </div>
            <h1 className="text-4xl font-bold mb-3">Create Your Wedding Space</h1>
            <p className="text-muted-foreground text-lg">
              Upload 6-20 photos of your venue, and we'll transform them into an interactive 3D environment
            </p>
          </div>

          <Card className="p-8 shadow-elegant">
            {/* Project Name */}
            <div className="mb-8">
              <Label htmlFor="projectName" className="text-lg font-semibold mb-2">
                Project Name
              </Label>
              <Input
                id="projectName"
                placeholder="e.g., Our Garden Wedding"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Upload Area */}
            <div className="mb-8">
              <Label className="text-lg font-semibold mb-4 block">Venue Photos</Label>
              
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-smooth bg-muted/30">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="imageUpload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Click to upload photos</p>
                  <p className="text-sm text-muted-foreground">
                    {images.length === 0
                      ? "Upload 6-20 photos from different angles"
                      : `${images.length} photo${images.length > 1 ? "s" : ""} uploaded`}
                  </p>
                </label>
              </div>

              {/* Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {images.map((image, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden shadow-elegant"
                    >
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-accent/30 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Tips for Best Results
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Take photos from multiple angles and heights</li>
                <li>• Include wide shots showing the entire space</li>
                <li>• Capture good lighting conditions</li>
                <li>• Overlap areas between photos for better 3D reconstruction</li>
              </ul>
            </div>

            {/* Action Button */}
            <Button
              size="lg"
              className="w-full text-lg py-6 shadow-gold hover:scale-105 transition-smooth"
              onClick={handleCreate}
            >
              Create 3D Space
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiteNew;
