import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, Search, FolderOpen, MoreVertical, Box, 
  Grid3X3, List, Image as ImageIcon, Trash2, Edit, Share2 
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  itemCount: number;
  lastUpdated: string;
  thumbnail?: string;
}

const Projects = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Demo projects
  const projects: Project[] = [
    { id: "1", name: "Living Room Renovation", itemCount: 5, lastUpdated: "2 hours ago" },
    { id: "2", name: "Kitchen Update", itemCount: 3, lastUpdated: "Yesterday" },
    { id: "3", name: "Backyard Patio", itemCount: 8, lastUpdated: "3 days ago" },
    { id: "4", name: "Home Office Setup", itemCount: 2, lastUpdated: "1 week ago" },
  ];

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Box className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">The Product View</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/visualize">
              <Button variant="ghost" size="sm">New Visualization</Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Projects</h1>
            <p className="text-muted-foreground">
              Organize your visualizations by room or project
            </p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                <FolderOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to organize your visualizations
              </p>
              <Link to="/visualize">
                <Button className="bg-gradient-primary hover:opacity-90">
                  Start Visualizing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            
            {/* Create New Card */}
            <Card className="glass-card border-dashed cursor-pointer hover:border-primary/50 transition-smooth group">
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-smooth">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-smooth" />
                </div>
                <p className="text-sm text-muted-foreground">Create New Project</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="glass-card hover:border-primary/30 transition-smooth">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.itemCount} items • Updated {project.lastUpdated}
                      </p>
                    </div>
                    <ProjectMenu />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Card className="glass-card hover:border-primary/30 transition-smooth group cursor-pointer">
      <div className="aspect-[4/3] bg-muted rounded-t-lg overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth">
          <ProjectMenu />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-1 truncate">{project.name}</h3>
        <p className="text-sm text-muted-foreground">
          {project.itemCount} items • {project.lastUpdated}
        </p>
      </CardContent>
    </Card>
  );
};

const ProjectMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="w-4 h-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ImageIcon className="w-4 h-4 mr-2" />
          Export All
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Projects;