/**
 * The Grid: Main Dashboard Page
 * 
 * Central hub for all Grid productivity tools with embedding-driven suggestions.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGrid } from '@/hooks/useGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, Clock, FolderLock, PenTool, Grid3X3, Presentation, Network, Users,
  Target, Workflow, MessageCircle, ClipboardList, Radio, Eye, Map, Hammer,
  Video, Home, Star, Search, Sparkles, Settings, ChevronRight, ArrowUpRight
} from 'lucide-react';
import type { GridTool, GridToolId, GridToolCategory } from '@/types/grid';

// Icon mapping for tools
const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Clock, FolderLock, PenTool, Grid3X3, Presentation, Network, Users,
  Target, Workflow, MessageCircle, ClipboardList, Radio, Eye, Map, Hammer,
  Video, Home,
};

const CATEGORY_COLORS: Record<GridToolCategory, string> = {
  communication: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  productivity: 'bg-green-500/10 text-green-500 border-green-500/20',
  organization: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  automation: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  collaboration: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  intelligence: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export default function TheGrid() {
  const navigate = useNavigate();
  const { 
    loading, 
    allTools, 
    suggestions, 
    getEnabledTools, 
    getFavoriteTools, 
    getRecentTools,
    toggleTool,
    toggleFavorite,
    useTool,
  } = useGrid();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('favorites');

  const enabledTools = getEnabledTools();
  const favoriteTools = getFavoriteTools();
  const recentTools = getRecentTools(5);

  const filteredTools = Object.values(allTools).filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToolClick = (tool: GridTool) => {
    useTool(tool.id);
    navigate(`/grid/${tool.id}`);
  };

  const ToolCard = ({ tool, showActions = false }: { tool: GridTool; showActions?: boolean }) => {
    const IconComponent = TOOL_ICONS[tool.icon] || Zap;
    const isEnabled = enabledTools.some(t => t.id === tool.id);
    const isFavorite = favoriteTools.some(t => t.id === tool.id);

    return (
      <Card 
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/40 relative overflow-hidden"
        onClick={() => handleToolClick(tool)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${CATEGORY_COLORS[tool.category]}`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {tool.name}
                  {tool.status === 'beta' && (
                    <Badge variant="outline" className="text-xs">Beta</Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.tagline}</p>
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleFavorite(tool.id)}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => toggleTool(tool.id)}
                />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="text-sm line-clamp-2">
            {tool.description}
          </CardDescription>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {tool.differentiators.slice(0, 2).map((diff, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {diff.split(' ').slice(0, 3).join(' ')}...
              </Badge>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Learns from you</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">The Grid</h1>
          <p className="text-muted-foreground mt-1">
            Your productivity suite that learns from you
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Personalized Suggestions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {suggestions.slice(0, 3).map((suggestion, i) => (
                <Card key={i} className="flex-1 min-w-[280px] bg-background">
                  <CardContent className="pt-4 pb-3">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{suggestion.description}</p>
                    <Button size="sm" className="mt-3">
                      {suggestion.actionLabel}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="favorites" className="gap-2">
            <Star className="h-4 w-4" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="h-4 w-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            All Tools
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favoriteTools.length === 0 ? (
            <Card className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <h3 className="mt-4 font-semibold">No favorites yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Star your most-used tools for quick access
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab('all')}>
                Browse Tools
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {recentTools.length === 0 ? (
            <Card className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <h3 className="mt-4 font-semibold">No recent activity</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tools you use will appear here
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {searchQuery ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {(['communication', 'productivity', 'organization', 'automation', 'collaboration', 'intelligence'] as GridToolCategory[]).map(category => {
                const categoryTools = Object.values(allTools).filter(t => t.category === category);
                if (categoryTools.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h3 className="text-lg font-semibold capitalize mb-4 flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category].split(' ')[0]}`} />
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryTools.map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <div className="space-y-4">
            {Object.values(allTools).map(tool => (
              <ToolCard key={tool.id} tool={tool} showActions />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
