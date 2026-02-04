import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Network, 
  Search, 
  Filter, 
  Zap, 
  Users, 
  Building2, 
  Box, 
  Workflow,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  RefreshCw,
  Layers,
  Move3D,
  Maximize2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EntityEmbedding {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  embedding_vector: number[];
  metadata: Record<string, unknown>;
  similarity?: number;
  cluster_id?: number;
}

interface Cluster {
  id: number;
  name: string;
  color: string;
  entities: EntityEmbedding[];
  centroid?: number[];
}

const ENTITY_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  user: { icon: Users, color: "bg-blue-500", label: "Users" },
  company: { icon: Building2, color: "bg-green-500", label: "Companies" },
  product: { icon: Box, color: "bg-purple-500", label: "Products" },
  workflow: { icon: Workflow, color: "bg-orange-500", label: "Workflows" },
  agent: { icon: Zap, color: "bg-pink-500", label: "Agents" },
};

const CLUSTER_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// Mock entity data for visualization
const generateMockEntities = (): EntityEmbedding[] => {
  const entities: EntityEmbedding[] = [];
  const types = ["user", "company", "product", "workflow", "agent"];
  const names: Record<string, string[]> = {
    user: ["Alice Johnson", "Bob Smith", "Carol Davis", "Dan Brown", "Eve Wilson", "Frank Miller", "Grace Lee"],
    company: ["Acme Corp", "TechFlow Inc", "DataDrive", "InnovateLab", "CloudPeak", "NexGen Systems"],
    product: ["Analytics Pro", "DataSync", "WorkflowHub", "AI Assistant", "SecureVault", "ReportGen"],
    workflow: ["Lead Nurture", "Deal Pipeline", "Content Review", "Customer Onboard", "Invoice Process"],
    agent: ["Sales Coach", "Data Analyst", "Task Manager", "Meeting Scheduler", "Report Generator"],
  };

  types.forEach((type) => {
    names[type].forEach((name, idx) => {
      // Generate a mock 8-dimensional embedding (simplified for visualization)
      const embedding = Array.from({ length: 8 }, () => Math.random() * 2 - 1);
      entities.push({
        id: `${type}-${idx}`,
        entity_type: type,
        entity_id: `${type}_${idx}`,
        entity_name: name,
        embedding_vector: embedding,
        metadata: {
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          activity_score: Math.random() * 100,
        },
      });
    });
  });

  return entities;
};

// Simple K-means clustering for visualization
const kMeansClustering = (entities: EntityEmbedding[], k: number): Cluster[] => {
  if (entities.length === 0) return [];
  
  // Initialize centroids randomly
  const centroids = entities.slice(0, k).map((e) => [...e.embedding_vector]);
  
  // Assign entities to clusters
  const assignments = entities.map((entity) => {
    let minDist = Infinity;
    let clusterId = 0;
    
    centroids.forEach((centroid, idx) => {
      const dist = entity.embedding_vector.reduce(
        (sum, val, i) => sum + Math.pow(val - (centroid[i] || 0), 2),
        0
      );
      if (dist < minDist) {
        minDist = dist;
        clusterId = idx;
      }
    });
    
    return { ...entity, cluster_id: clusterId };
  });
  
  // Group by cluster
  const clusters: Cluster[] = Array.from({ length: k }, (_, idx) => ({
    id: idx,
    name: `Cluster ${idx + 1}`,
    color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
    entities: assignments.filter((e) => e.cluster_id === idx),
    centroid: centroids[idx],
  }));
  
  return clusters;
};

// Calculate cosine similarity
const cosineSimilarity = (a: number[], b: number[]): number => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB) || 0;
};

export default function EntityEmbeddingsVisualizer() {
  const [entities, setEntities] = useState<EntityEmbedding[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityEmbedding | null>(null);
  const [similarEntities, setSimilarEntities] = useState<EntityEmbedding[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterCount, setClusterCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load mock data (replace with real Supabase query when embeddings are available)
    const loadEntities = async () => {
      setIsLoading(true);
      // In production, fetch from instincts_entity_embedding table
      const mockData = generateMockEntities();
      setEntities(mockData);
      setClusters(kMeansClustering(mockData, clusterCount));
      setIsLoading(false);
    };
    
    loadEntities();
  }, [clusterCount]);

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const matchesType = filterType === "all" || entity.entity_type === filterType;
      const matchesSearch = entity.entity_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [entities, filterType, searchQuery]);

  const handleEntitySelect = (entity: EntityEmbedding) => {
    setSelectedEntity(entity);
    
    // Calculate similarity to all other entities
    const similarities = entities
      .filter((e) => e.id !== entity.id)
      .map((e) => ({
        ...e,
        similarity: cosineSimilarity(entity.embedding_vector, e.embedding_vector),
      }))
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 10);
    
    setSimilarEntities(similarities);
  };

  const recluster = () => {
    setClusters(kMeansClustering(filteredEntities, clusterCount));
  };

  const EntityNode = ({ entity, size = "md" }: { entity: EntityEmbedding; size?: "sm" | "md" | "lg" }) => {
    const config = ENTITY_TYPE_CONFIG[entity.entity_type] || ENTITY_TYPE_CONFIG.user;
    const Icon = config.icon;
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16",
    };
    
    return (
      <button
        onClick={() => handleEntitySelect(entity)}
        className={`${sizeClasses[size]} rounded-full ${config.color} flex items-center justify-center cursor-pointer 
          hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all duration-200
          ${selectedEntity?.id === entity.id ? "ring-2 ring-offset-2 ring-primary" : ""}`}
        title={entity.entity_name}
      >
        <Icon className="w-1/2 h-1/2 text-white" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Network className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Entity Embeddings</h1>
              <p className="text-muted-foreground">
                Visualize and explore entity relationships in embedding space
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={recluster}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recluster
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(ENTITY_TYPE_CONFIG).map(([type, config]) => {
            const count = entities.filter((e) => e.entity_type === type).length;
            const Icon = config.icon;
            return (
              <Card key={type} className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setFilterType(type)}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}/10`}>
                    <Icon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(ENTITY_TYPE_CONFIG).map(([type, config]) => (
                      <SelectItem key={type} value={type}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <Select value={clusterCount.toString()} onValueChange={(v) => setClusterCount(parseInt(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Clusters" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} Clusters</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cluster Visualization */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Move3D className="w-5 h-5" />
                Embedding Space
              </CardTitle>
              <CardDescription>
                Entities clustered by embedding similarity (2D projection)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="relative h-[400px] bg-muted/30 rounded-lg border overflow-hidden">
                  {/* Simplified 2D scatter visualization */}
                  <div className="absolute inset-0 p-4">
                    {clusters.map((cluster) => (
                      <div key={cluster.id} className="absolute" style={{
                        left: `${20 + (cluster.id % 3) * 30}%`,
                        top: `${15 + Math.floor(cluster.id / 3) * 40}%`,
                      }}>
                        <div 
                          className="absolute -inset-8 rounded-full opacity-10"
                          style={{ backgroundColor: cluster.color }}
                        />
                        <div className="relative flex flex-wrap gap-2 max-w-[200px]">
                          {cluster.entities.slice(0, 6).map((entity) => (
                            <EntityNode key={entity.id} entity={entity} size="sm" />
                          ))}
                          {cluster.entities.length > 6 && (
                            <Badge variant="secondary" className="h-8 px-2">
                              +{cluster.entities.length - 6}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-medium mt-2 text-center" style={{ color: cluster.color }}>
                          {cluster.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
                    {Object.entries(ENTITY_TYPE_CONFIG).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <div key={type} className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${config.color}`} />
                          <span className="text-xs">{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entity Details Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Entity Details
              </CardTitle>
              <CardDescription>
                {selectedEntity ? "Selected entity information" : "Click an entity to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEntity ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <EntityNode entity={selectedEntity} size="lg" />
                    <div>
                      <h3 className="font-semibold">{selectedEntity.entity_name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {selectedEntity.entity_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Embedding Vector (8D)</h4>
                    <div className="space-y-1">
                      {selectedEntity.embedding_vector.slice(0, 8).map((val, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-8">D{idx + 1}</span>
                          <Progress 
                            value={((val + 1) / 2) * 100} 
                            className="h-2 flex-1"
                          />
                          <span className="text-xs font-mono w-12">{val.toFixed(3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Most Similar Entities
                    </h4>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {similarEntities.map((entity) => {
                          const config = ENTITY_TYPE_CONFIG[entity.entity_type];
                          const Icon = config?.icon || Users;
                          return (
                            <button
                              key={entity.id}
                              onClick={() => handleEntitySelect(entity)}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${config?.color || "bg-gray-500"} flex items-center justify-center`}>
                                  <Icon className="w-3 h-3 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{entity.entity_name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{entity.entity_type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                <span className="text-sm font-mono">
                                  {((entity.similarity || 0) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                  <Network className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-center">Select an entity from the visualization to view its embedding details and find similar entities</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cluster Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Cluster Analysis</CardTitle>
            <CardDescription>Overview of entity distribution across clusters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {clusters.map((cluster) => (
                <Card key={cluster.id} className="border-2" style={{ borderColor: cluster.color }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold" style={{ color: cluster.color }}>
                        {cluster.name}
                      </h4>
                      <Badge variant="secondary">{cluster.entities.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(ENTITY_TYPE_CONFIG).map(([type, config]) => {
                        const count = cluster.entities.filter((e) => e.entity_type === type).length;
                        if (count === 0) return null;
                        const Icon = config.icon;
                        return (
                          <div key={type} className="flex items-center gap-2 text-sm">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <span className="flex-1">{config.label}</span>
                            <span className="font-mono">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
