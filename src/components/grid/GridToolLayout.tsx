/**
 * Grid Tool Layout: Shared layout wrapper for all Grid tools
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Settings, Star, Sparkles, ExternalLink } from 'lucide-react';
import { useGrid } from '@/hooks/useGrid';
import type { GridTool, GridToolId } from '@/types/grid';

interface GridToolLayoutProps {
  tool: GridTool;
  children: ReactNode;
  actions?: ReactNode;
  sidebar?: ReactNode;
}

export function GridToolLayout({ tool, children, actions, sidebar }: GridToolLayoutProps) {
  const navigate = useNavigate();
  const { toggleFavorite, getIntegratedTools, state } = useGrid();
  
  const isFavorite = state.favoriteTools.includes(tool.id);
  const integratedTools = getIntegratedTools(tool.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/grid')}
            >
              <ChevronLeft className="h-4 w-4" />
              The Grid
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">{tool.name}</h1>
              {tool.status === 'beta' && (
                <Badge variant="outline" className="text-xs">Beta</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(tool.id)}
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {/* Tool Intelligence Banner */}
            <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{tool.tagline}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tool.intelligence.personalizedSuggestions && 'Personalized • '}
                    {tool.intelligence.predictiveActions && 'Predictive • '}
                    {tool.intelligence.crossToolIntelligence && 'Connected'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tool Content */}
            {children}
          </div>

          {/* Sidebar */}
          {(sidebar || integratedTools.length > 0) && (
            <div className="w-72 flex-shrink-0 space-y-6">
              {sidebar}
              
              {integratedTools.length > 0 && (
                <div className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium text-sm mb-3">Connected Tools</h4>
                  <div className="space-y-2">
                    {integratedTools.map(t => (
                      <Button
                        key={t.id}
                        variant="ghost"
                        className="w-full justify-start gap-2 h-auto py-2"
                        onClick={() => navigate(`/grid/${t.id}`)}
                      >
                        <span className="truncate">{t.name}</span>
                        <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
