import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { PhotoEditingWorkflow } from "@/components/PhotoEditingWorkflow";
import { Brush, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function EditingDashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();

  if (!profile?.is_photographer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">This page is only available for photographers</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brush className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Photo Editing</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Photos Requiring Editing</h2>
          <p className="text-sm text-muted-foreground">
            Upload edited versions of client photos from sessions with editing requested
          </p>
        </div>

        <PhotoEditingWorkflow photographerId={user?.id || ""} />
      </main>

      <BottomNav />
    </div>
  );
}
