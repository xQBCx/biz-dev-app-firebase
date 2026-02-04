/**
 * The Grid: Central Hook for Productivity Suite
 * 
 * Manages Grid state, tool access, and embedding-driven suggestions.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEffectiveUser } from '@/hooks/useEffectiveUser';
import { useInstincts } from '@/hooks/useInstincts';
import { supabase } from '@/integrations/supabase/client';
import type { GridToolId, GridTool, GridSuggestion } from '@/types/grid';
import { GRID_TOOLS as tools, getActiveTools, getIntegratedTools } from '@/types/grid';

export interface UserGridState {
  enabledTools: GridToolId[];
  favoriteTools: GridToolId[];
  toolSettings: Partial<Record<GridToolId, Record<string, unknown>>>;
  lastUsedTool: GridToolId | null;
  lastUsedAt: Partial<Record<GridToolId, string>>;
}

const DEFAULT_STATE: UserGridState = {
  enabledTools: ['pulse', 'rhythm', 'momentum', 'sphere', 'nexus', 'vault'],
  favoriteTools: ['pulse', 'momentum'],
  toolSettings: {},
  lastUsedTool: null,
  lastUsedAt: {},
};

export function useGrid() {
  const { user } = useAuth();
  const { id: effectiveUserId } = useEffectiveUser();
  const { emit } = useInstincts();
  const [state, setState] = useState<UserGridState>(DEFAULT_STATE);
  const [suggestions, setSuggestions] = useState<GridSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's Grid state from grid_tools_config table
  useEffect(() => {
    if (!effectiveUserId) {
      setLoading(false);
      return;
    }

    const loadState = async () => {
      try {
        // Load from grid_tools_config table
        const { data: configs, error } = await supabase
          .from('grid_tools_config')
          .select('*')
          .eq('user_id', effectiveUserId);

        if (configs && configs.length > 0) {
          const enabledTools: GridToolId[] = [];
          const favoriteTools: GridToolId[] = [];
          const lastUsedAt: Partial<Record<GridToolId, string>> = {};
          const toolSettings: Partial<Record<GridToolId, Record<string, unknown>>> = {};

          configs.forEach(config => {
            const toolId = config.tool_id as GridToolId;
            if (config.enabled) enabledTools.push(toolId);
            if (config.is_favorite) favoriteTools.push(toolId);
            if (config.last_used_at) lastUsedAt[toolId] = config.last_used_at;
            if (config.settings) toolSettings[toolId] = config.settings as Record<string, unknown>;
          });

          setState({
            enabledTools: enabledTools.length > 0 ? enabledTools : DEFAULT_STATE.enabledTools,
            favoriteTools,
            toolSettings,
            lastUsedTool: null,
            lastUsedAt,
          });
        }
      } catch (err) {
        console.error('Failed to load Grid state:', err);
      } finally {
        setLoading(false);
      }
    };

    loadState();
  }, [effectiveUserId]);

  // Save tool config
  const saveToolConfig = useCallback(async (
    toolId: GridToolId, 
    updates: { enabled?: boolean; is_favorite?: boolean; settings?: Record<string, string | number | boolean>; last_used_at?: string }
  ) => {
    if (!effectiveUserId) return;

    try {
      const { data: existing } = await supabase
        .from('grid_tools_config')
        .select('id')
        .eq('user_id', effectiveUserId)
        .eq('tool_id', toolId)
        .maybeSingle();

      const settingsJson = updates.settings ? JSON.parse(JSON.stringify(updates.settings)) : null;

      if (existing) {
        await supabase
          .from('grid_tools_config')
          .update({
            enabled: updates.enabled,
            is_favorite: updates.is_favorite,
            last_used_at: updates.last_used_at,
            ...(settingsJson ? { settings: settingsJson } : {}),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('grid_tools_config')
          .insert({
            user_id: effectiveUserId,
            tool_id: toolId,
            enabled: updates.enabled ?? true,
            is_favorite: updates.is_favorite ?? false,
            last_used_at: updates.last_used_at,
            settings: settingsJson || {},
          });
      }
    } catch (err) {
      console.error('Failed to save Grid tool config:', err);
    }
  }, [effectiveUserId]);

  // Enable/disable a tool
  const toggleTool = useCallback((toolId: GridToolId) => {
    const isEnabled = state.enabledTools.includes(toolId);
    const newEnabled = isEnabled
      ? state.enabledTools.filter(id => id !== toolId)
      : [...state.enabledTools, toolId];
    
    setState(prev => ({ ...prev, enabledTools: newEnabled }));
    saveToolConfig(toolId, { enabled: !isEnabled });
    
    emit({
      category: 'workflow',
      module: 'ecosystem',
      action: isEnabled ? 'tool_disabled' : 'tool_enabled',
      entityType: 'grid_tool',
      entityId: toolId,
      entityName: tools[toolId]?.name,
    });
  }, [state.enabledTools, saveToolConfig, emit]);

  // Toggle favorite
  const toggleFavorite = useCallback((toolId: GridToolId) => {
    const isFavorite = state.favoriteTools.includes(toolId);
    const newFavorites = isFavorite
      ? state.favoriteTools.filter(id => id !== toolId)
      : [...state.favoriteTools, toolId];
    
    setState(prev => ({ ...prev, favoriteTools: newFavorites }));
    saveToolConfig(toolId, { is_favorite: !isFavorite });
  }, [state.favoriteTools, saveToolConfig]);

  // Record tool usage
  const useTool = useCallback((toolId: GridToolId) => {
    const now = new Date().toISOString();
    
    setState(prev => ({
      ...prev,
      lastUsedTool: toolId,
      lastUsedAt: {
        ...prev.lastUsedAt,
        [toolId]: now,
      },
    }));

    saveToolConfig(toolId, { last_used_at: now });

    emit({
      category: 'navigation',
      module: 'ecosystem',
      action: 'tool_opened',
      entityType: 'grid_tool',
      entityId: toolId,
      entityName: tools[toolId]?.name,
    });
  }, [saveToolConfig, emit]);

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
    const entries = Object.entries(state.lastUsedAt) as [GridToolId, string][];
    const sorted = entries
      .sort(([, a], [, b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, limit)
      .map(([id]) => id);
    
    return sorted
      .filter(id => tools[id])
      .map(id => tools[id]);
  }, [state.lastUsedAt]);

  // Generate embedding-based suggestions
  const generateSuggestions = useCallback(async () => {
    if (!effectiveUserId) return;

    // Get user's instincts data for personalized suggestions
    const { data: stats } = await supabase
      .from('instincts_user_stats')
      .select('*')
      .eq('user_id', effectiveUserId)
      .single();

    const newSuggestions: GridSuggestion[] = [];

    // Check for tools that might help based on activity
    if (stats?.communication_count && stats.communication_count > 10 && !state.enabledTools.includes('pulse')) {
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

    if (stats?.workflow_count && stats.workflow_count > 20 && !state.enabledTools.includes('flow')) {
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
  }, [effectiveUserId, state.enabledTools]);

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
