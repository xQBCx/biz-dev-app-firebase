import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  FolderOpen, 
  File, 
  FileCode, 
  RefreshCw, 
  Search, 
  Download,
  ChevronRight,
  ChevronDown,
  Code,
  FileJson,
  FileText
} from "lucide-react";

interface ProjectImport {
  id: string;
  external_project_name: string;
  project_url?: string;
  metadata?: any;
}

interface CodeFile {
  id: string;
  file_path: string;
  file_size: number;
  language: string;
  last_fetched_at: string;
  file_content?: string;
}

interface CodeBrowserProps {
  projectImports: ProjectImport[];
  userId: string;
  onFileSelect?: (file: CodeFile) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  file?: CodeFile;
}

const languageIcons: Record<string, any> = {
  typescript: FileCode,
  javascript: FileCode,
  json: FileJson,
  markdown: FileText,
  default: File,
};

export function CodeBrowser({ projectImports, userId, onFileSelect }: CodeBrowserProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectImport | null>(null);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);

  useEffect(() => {
    if (selectedProject) {
      loadFiles(selectedProject.id);
    }
  }, [selectedProject]);

  const loadFiles = async (projectId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_code_files')
        .select('id, file_path, file_size, language, last_fetched_at')
        .eq('project_import_id', projectId)
        .order('file_path');

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRepoCode = async () => {
    if (!selectedProject) return;
    
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('github-fetch-code', {
        body: {
          projectImportId: selectedProject.id,
          fetchAll: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Code Fetched",
        description: `Retrieved ${data.filesStored} files from repository`,
      });

      loadFiles(selectedProject.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  const loadFileContent = async (file: CodeFile) => {
    try {
      const { data, error } = await supabase
        .from('project_code_files')
        .select('file_content')
        .eq('id', file.id)
        .single();

      if (error) throw error;
      
      const fileWithContent = { ...file, file_content: data?.file_content || '' };
      setSelectedFile(fileWithContent);
      onFileSelect?.(fileWithContent);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Build tree structure from flat file list
  const buildTree = (files: CodeFile[]): TreeNode[] => {
    const root: TreeNode[] = [];
    const filtered = searchQuery 
      ? files.filter(f => f.file_path.toLowerCase().includes(searchQuery.toLowerCase()))
      : files;

    for (const file of filtered) {
      const parts = file.file_path.split('/');
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const path = parts.slice(0, i + 1).join('/');
        const isFile = i === parts.length - 1;

        let existing = current.find(n => n.name === part);

        if (!existing) {
          existing = {
            name: part,
            path,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            file: isFile ? file : undefined,
          };
          current.push(existing);
        }

        if (!isFile && existing.children) {
          current = existing.children;
        }
      }
    }

    // Sort: folders first, then files
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
      });
      nodes.forEach(n => n.children && sortNodes(n.children));
    };
    sortNodes(root);

    return root;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node.path);
      const Icon = node.type === 'folder' 
        ? FolderOpen 
        : (languageIcons[node.file?.language || ''] || languageIcons.default);

      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 ${
              selectedFile?.file_path === node.path ? 'bg-primary/10' : ''
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => {
              if (node.type === 'folder') {
                toggleFolder(node.path);
              } else if (node.file) {
                loadFileContent(node.file);
              }
            }}
          >
            {node.type === 'folder' && (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
            <Icon className={`h-4 w-4 ${node.type === 'folder' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm truncate flex-1">{node.name}</span>
            {node.file && (
              <span className="text-xs text-muted-foreground">
                {formatSize(node.file.file_size)}
              </span>
            )}
          </div>
          {node.type === 'folder' && isExpanded && node.children && (
            renderTree(node.children, depth + 1)
          )}
        </div>
      );
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const tree = buildTree(files);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Project Selector */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Connected Projects</CardTitle>
          <CardDescription>Select a project to browse code</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {projectImports.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects discovered yet
                </p>
              ) : (
                projectImports.map(project => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      selectedProject?.id === project.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm truncate">
                        {project.external_project_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {project.project_url}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* File Tree */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {selectedProject ? selectedProject.external_project_name : 'Code Browser'}
              </CardTitle>
              <CardDescription>
                {files.length} files fetched
              </CardDescription>
            </div>
            {selectedProject && (
              <Button 
                size="sm" 
                onClick={fetchRepoCode}
                disabled={fetching}
              >
                {fetching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {files.length === 0 ? 'Fetch Code' : 'Refresh'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedProject ? (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No code fetched yet. Click "Fetch Code" to retrieve files.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {renderTree(tree)}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Code className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a project to browse its code
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
