/**
 * The Grid: Central Hook for Productivity Suite
 * 
 * Manages Grid state, tool access, and embedding-driven suggestions.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInstincts } from '@/hooks/useInstincts';
import { supabase } from '@/integrations/supabase/client';
import type { 
  GridToolId, 
  GridTool, 
  UserGridState, 
  GridSuggestion,
  GRID_TOOLS 
} from '@/types/grid';
import { GRID_TOOLS as tools, getActiveTools, getIntegratedTools } from '@/types/grid';

const DEFAULT_STATE: UserGridState = {
  enabledTools: ['pulse', 'rhythm', 'momentum', 'sphere', 'nexus', 'vault'],
  favoriteTools: ['pulse', 'momentum'],
  toolSettings: {},
  lastUsedTool: null,
  lastUsedAt: {},
};

export function useGrid() {
  const { user } = useAuth();
  const { emit } = useInstincts();
  const [state, setState] = useState<UserGridState>(DEFAULT_STATE);
  const [suggestions, setSuggestions] = useState<GridSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's Grid state from profile
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadState = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('metadata')
          .eq('id', user.id)
          .single();

        if (data?.metadata?.gridState) {
          setState(prev => ({
            ...prev,
            ...data.metadata.gridState,
          }));
        }
      } catch (err) {
        console.error('Failed to load Grid state:', err);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, [user?.id]);

  // Save state changes
  const saveState = useCallback(async (newState: Partial<UserGridState>) => {
    if (!user?.id) return;

    const updatedState = { ...state, ...newState };
    setState(updatedState);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('metadata')
        .eq('id', user.id)
        .single();

      await supabase
        .from('profiles')
        .update({
          metadata: {
            ...(profile?.metadata || {}),
            gridState: updatedState,
          },
        })
        .eq('id', user.id);
    } catch (err) {
      console.error('Failed to save Grid state:', err);
    }
  }, [user?.id, state]);

  // Enable/disable a tool
  const toggleTool = useCallback((toolId: GridToolId) => {
    const newEnabled = state.enabledTools.includes(toolId)
      ? state.enabledTools.filter(id => id !== toolId)
      : [...state.enabledTools, toolId];
    
    saveState({ enabledTools: newEnabled });
    
    emit({
      category: 'workflow',
      module: 'ecosystem',
      action: state.enabledTools.includes(toolId) ? 'tool_disabled' : 'tool_enabled',
      entityType: 'grid_tool',
      entityId: toolId,
      entityName: tools[toolId].name,
    });
  }, [state.enabledTools, saveState, emit]);

  // Toggle favorite
  const toggleFavorite = useCallback((toolId: GridToolId) => {
    const newFavorites = state.favoriteTools.includes(toolId)
      ? state.favoriteTools.filter(id => id !== toolId)
      : [...state.favoriteTools, toolId];
    
    saveState({ favoriteTools: newFavorites });
  }, [state.favoriteTools, saveState]);

  // Record tool usage
  const useTool = useCallback((toolId: GridToolId) => {
    const now = new Date().toISOString();
    
    saveState({
      lastUsedTool: toolId,
      lastUsedAt: {
        ...state.lastUsedAt,
        [toolId]: now,
      },
    });

    emit({
      category: 'navigation',
      module: 'ecosystem',
      action: 'tool_opened',
      entityType: 'grid_tool',
      entityId: toolId,
      entityName: tools[toolId].name,
    });
  }, [state.lastUsedAt, saveState, emit]);

  // Get enabled tools
  const getEnabledTools = useCallback((): GridTool[] => {
    return state.enabledTools
      .filter(id => tools[id])
      .map(id => tools[id]);
  }, [state.enabledTools]);

  // Get favorite tools
  const getFavoriteTools = useCallback((): GridTool[] => {
    return state.favoriteTools
      .filter(id => tools[id])
      .map(id => tools[id]);
  }, [state.favoriteTools]);

  // Get recently used tools
  const getRecentTools = useCallback((limit = 5): GridTool[] => {
    const sorted = Object.entries(state.lastUsedAt)
      .sort(([, a], [, b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, limit)
      .map(([id]) => id as GridToolId);
    
    return sorted
      .filter(id => tools[id])
      .map(id => tools[id]);
  }, [state.lastUsedAt]);

  // Generate embedding-based suggestions
  const generateSuggestions = useCallback(async () => {
    if (!user?.id) return;

    // Get user's instincts data for personalized suggestions
    const { data: stats } = await supabase
      .from('instincts_user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const newSuggestions: GridSuggestion[] = [];

    // Check for tools that might help based on activity
    if (stats?.communication_count > 10 && !state.enabledTools.includes('pulse')) {
      newSuggestions.push({
        type: 'tool',
        priority: 1,
        toolId: 'pulse',
        title: 'Enable Pulse for smarter email',
        description: 'Based on your communication patterns, Pulse could help prioritize your messages.',
        actionLabel: 'Enable Pulse',
        confidence: 0.85,
      });
    }

    if (stats?.workflow_count > 20 && !state.enabledTools.includes('flow')) {
      newSuggestions.push({
        type: 'tool',
        priority: 2,
        toolId: 'flow',
        title: 'Automate with Flow',
        description: 'You have repetitive patterns that could be automated. Flow can help.',
        actionLabel: 'Try Flow',
        confidence: 0.78,
      });
    }

    // Cross-tool connection suggestions
    if (state.enabledTools.includes('momentum') && state.enabledTools.includes('rhythm')) {
      newSuggestions.push({
        type: 'connection',
        priority: 3,
        title: 'Connect Momentum to Rhythm',
        description: 'Auto-schedule your tasks based on your calendar availability and energy patterns.',
        actionLabel: 'Connect Tools',
        confidence: 0.92,
      });
    }

    setSuggestions(newSuggestions.sort((a, b) => a.priority - b.priority));
  }, [user?.id, state.enabledTools]);

  // Load suggestions on mount and when tools change
  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  return {
    state,
    loading,
    suggestions,
    allTools: tools,
    toggleTool,
    toggleFavorite,
    useTool,
    getEnabledTools,
    getFavoriteTools,
    getRecentTools,
    getActiveTools,
    getIntegratedTools,
    refreshSuggestions: generateSuggestions,
  };
}
