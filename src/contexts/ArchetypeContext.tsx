import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Types for archetype configuration
export interface LanguageConfig {
  tasks: string;
  deals: string;
  projects: string;
  team: string;
  clients: string;
  meetings: string;
  goals: string;
  success: string;
  dashboard: string;
  [key: string]: string;
}

export interface OnboardingFlow {
  steps: string[];
  messaging: Record<string, string>;
  featured_modules: string[];
}

export interface IncentiveConfig {
  achievement_language: string;
  reward_language: string;
  progress_language: string;
  rank_system: boolean;
}

export interface TrustSignals {
  primary_credentials: string[];
  verification_badges: string[];
  display_priorities: string[];
}

export interface RoleProgression {
  from: string;
  to: string;
  requirements: string[];
}

export interface Archetype {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  icon_name: string;
  language_config: LanguageConfig;
  onboarding_flow: OnboardingFlow;
  incentive_config: IncentiveConfig;
  trust_signals: TrustSignals;
  default_permissions: Record<string, unknown>;
  role_progressions: { pathways: RoleProgression[] };
  theme_config: Record<string, unknown>;
  is_active: boolean;
  sort_order: number;
}

interface ArchetypeContextValue {
  currentArchetype: Archetype | null;
  archetypes: Archetype[];
  isLoading: boolean;
  error: string | null;
  setArchetype: (archetypeId: string) => Promise<void>;
  translate: (key: keyof LanguageConfig) => string;
  translatePlural: (key: keyof LanguageConfig) => string;
}

const defaultLanguageConfig: LanguageConfig = {
  tasks: 'tasks',
  deals: 'deals',
  projects: 'initiatives',
  team: 'team',
  clients: 'clients',
  meetings: 'meetings',
  goals: 'objectives',
  success: 'success',
  dashboard: 'command center',
};

const ArchetypeContext = createContext<ArchetypeContextValue | undefined>(undefined);

export function ArchetypeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [currentArchetype, setCurrentArchetype] = useState<Archetype | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all active archetypes
  useEffect(() => {
    async function fetchArchetypes() {
      try {
        const { data, error: fetchError } = await supabase
          .from('platform_archetypes')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (fetchError) throw fetchError;

        // Parse JSONB fields
        const parsed = (data || []).map((a: any) => ({
          ...a,
          language_config: a.language_config || defaultLanguageConfig,
          onboarding_flow: a.onboarding_flow || { steps: [], messaging: {}, featured_modules: [] },
          incentive_config: a.incentive_config || { achievement_language: 'achievements', reward_language: 'rewards', progress_language: 'progress', rank_system: false },
          trust_signals: a.trust_signals || { primary_credentials: [], verification_badges: [], display_priorities: [] },
          role_progressions: a.role_progressions || { pathways: [] },
        }));

        setArchetypes(parsed);
      } catch (err) {
        console.error('Error fetching archetypes:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch archetypes');
      }
    }

    fetchArchetypes();
  }, []);

  // Fetch user's current archetype
  useEffect(() => {
    async function fetchUserArchetype() {
      if (!user?.id || archetypes.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('archetype_id, archetype_overrides')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        if (profile?.archetype_id) {
          const archetype = archetypes.find(a => a.id === profile.archetype_id);
          if (archetype) {
            // Apply any user-specific overrides
            const overrides = (profile.archetype_overrides || {}) as Record<string, unknown>;
            const languageOverrides = (overrides.language_config || {}) as Partial<LanguageConfig>;
            const merged = {
              ...archetype,
              language_config: { ...archetype.language_config, ...languageOverrides },
            };
            setCurrentArchetype(merged);
          }
        }
      } catch (err) {
        console.error('Error fetching user archetype:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserArchetype();
  }, [user?.id, archetypes]);

  // Set archetype for current user
  const setArchetype = async (archetypeId: string) => {
    if (!user?.id) return;

    try {
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ archetype_id: archetypeId })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Log to history
      await supabase
        .from('user_archetype_history')
        .insert({
          user_id: user.id,
          archetype_id: archetypeId,
        });

      // Update local state
      const archetype = archetypes.find(a => a.id === archetypeId);
      if (archetype) {
        setCurrentArchetype(archetype);
      }
    } catch (err) {
      console.error('Error setting archetype:', err);
      throw err;
    }
  };

  // Translation function
  const translate = (key: keyof LanguageConfig): string => {
    const keyStr = key as string;
    if (currentArchetype?.language_config?.[keyStr]) {
      return currentArchetype.language_config[keyStr];
    }
    return defaultLanguageConfig[keyStr] || keyStr;
  };

  // Capitalize first letter for titles
  const translatePlural = (key: keyof LanguageConfig): string => {
    const term = translate(key);
    return term.charAt(0).toUpperCase() + term.slice(1);
  };

  return (
    <ArchetypeContext.Provider
      value={{
        currentArchetype,
        archetypes,
        isLoading,
        error,
        setArchetype,
        translate,
        translatePlural,
      }}
    >
      {children}
    </ArchetypeContext.Provider>
  );
}

export function useArchetype() {
  const context = useContext(ArchetypeContext);
  if (context === undefined) {
    throw new Error('useArchetype must be used within an ArchetypeProvider');
  }
  return context;
}

// Convenience hook for just translations
export function useArchetypeTranslation() {
  const { translate, translatePlural, currentArchetype } = useArchetype();
  return { t: translate, T: translatePlural, archetype: currentArchetype };
}
