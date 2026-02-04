import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, LogOut, Calendar, Users, DollarSign, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  mode: string;
  guest_count: number | null;
  budget_cents: number | null;
  currency: string;
  created_at: string;
}

const LiteDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-elegant flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">The Wedding View</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your Projects</h1>
              <p className="text-muted-foreground">Create and manage your wedding designs</p>
            </div>
            <Button
              size="lg"
              className="shadow-gold hover:scale-105 transition-smooth"
              onClick={() => navigate("/lite/new")}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </div>

          {/* Projects Grid or Empty State */}
          <div className="grid gap-6">
            {projects.length === 0 ? (
              <Card className="p-12 text-center shadow-elegant">
                <div className="max-w-md mx-auto">
                  <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary" />
                  <h2 className="text-2xl font-bold mb-3">Start Your First Project</h2>
                  <p className="text-muted-foreground mb-6">
                    Upload photos of your venue and let AI create an immersive 3D space where you can plan every detail of your wedding.
                  </p>
                  <Button
                    size="lg"
                    className="shadow-gold hover:scale-105 transition-smooth"
                    onClick={() => navigate("/lite/new")}
                  >
                    Create Your First Project
                    <Plus className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} navigate={navigate} />
                ))}
              </div>
            )}

            {/* Features Preview */}
            {projects.length === 0 && (
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <Card className="p-6 shadow-elegant">
                  <h3 className="font-semibold mb-2">3D Visualization</h3>
                  <p className="text-sm text-muted-foreground">
                    Transform photos into interactive 3D environments you can explore and customize
                  </p>
                </Card>
                <Card className="p-6 shadow-elegant">
                  <h3 className="font-semibold mb-2">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant suggestions and guidance from Viewy, your AI wedding planner
                  </p>
                </Card>
                <Card className="p-6 shadow-elegant">
                  <h3 className="font-semibold mb-2">Vendor Connect</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover local vendors and add items directly to your scene and budget
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectCard = ({ project, navigate }: { project: Project; navigate: any }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (cents: number | null, currency: string) => {
    if (!cents) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-gold transition-elegant cursor-pointer border-border">
      <div
        className="p-6"
        onClick={() => navigate(`/project/${project.id}/editor`)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-smooth">
              {project.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {project.mode}
            </Badge>
          </div>
          <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-smooth" />
        </div>

        {/* Stats */}
        <div className="space-y-3 mb-4">
          {project.guest_count && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{project.guest_count} guests</span>
            </div>
          )}
          {project.budget_cents !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>{formatCurrency(project.budget_cents, project.currency)} budget</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
        </div>

        {/* Action */}
        <Button
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth"
          size="sm"
        >
          Open Editor
        </Button>
      </div>
    </Card>
  );
};

export default LiteDashboard;
