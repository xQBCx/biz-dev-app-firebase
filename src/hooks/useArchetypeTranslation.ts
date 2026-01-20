import { useArchetype, LanguageConfig } from '@/contexts/ArchetypeContext';

// Extended terminology map for lifecycle modules
const lifecycleTerminology: Record<string, Record<string, string>> = {
  // Service Professional archetype
  service_professional: {
    incidents: 'service calls',
    responders: 'service team',
    deployments: 'assignments',
    trades: 'transactions',
    engagements: 'client contracts',
    earnings: 'revenue',
    equity_stakes: 'ownership positions',
    capital_investments: 'investments',
  },
  // Technical Professional archetype
  technical_professional: {
    incidents: 'issues',
    responders: 'engineers',
    deployments: 'releases',
    trades: 'operations',
    engagements: 'projects',
    earnings: 'compensation',
    equity_stakes: 'equity grants',
    capital_investments: 'portfolio',
  },
  // Tradesperson archetype
  tradesperson: {
    incidents: 'jobs',
    responders: 'crew',
    deployments: 'dispatches',
    trades: 'exchanges',
    engagements: 'contracts',
    earnings: 'pay',
    equity_stakes: 'business shares',
    capital_investments: 'capital',
  },
  // Athlete archetype
  athlete: {
    incidents: 'challenges',
    responders: 'teammates',
    deployments: 'missions',
    trades: 'plays',
    engagements: 'competitions',
    earnings: 'winnings',
    equity_stakes: 'championship stakes',
    capital_investments: 'performance investments',
  },
  // Entrepreneur archetype
  entrepreneur: {
    incidents: 'opportunities',
    responders: 'team members',
    deployments: 'ventures',
    trades: 'deals',
    engagements: 'partnerships',
    earnings: 'revenue',
    equity_stakes: 'equity positions',
    capital_investments: 'venture capital',
  },
  // Capital Allocator archetype
  capital_allocator: {
    incidents: 'market events',
    responders: 'analysts',
    deployments: 'allocations',
    trades: 'positions',
    engagements: 'mandates',
    earnings: 'returns',
    equity_stakes: 'holdings',
    capital_investments: 'allocations',
  },
};

// Default terminology
const defaultLifecycleTerms: Record<string, string> = {
  incidents: 'incidents',
  responders: 'responders',
  deployments: 'deployments',
  trades: 'trades',
  engagements: 'engagements',
  earnings: 'earnings',
  equity_stakes: 'equity stakes',
  capital_investments: 'capital investments',
  // Lifecycle phases
  earn_phase: 'Earn',
  trade_phase: 'Trade',
  invest_phase: 'Invest',
  own_phase: 'Own',
  compound_phase: 'Compound',
};

export function useLifecycleTranslation() {
  const { currentArchetype, translate } = useArchetype();

  const translateLifecycle = (key: string): string => {
    // First try archetype-specific terminology
    if (currentArchetype?.slug && lifecycleTerminology[currentArchetype.slug]) {
      const archetypeTerm = lifecycleTerminology[currentArchetype.slug][key];
      if (archetypeTerm) return archetypeTerm;
    }
    
    // Fall back to default lifecycle terms
    return defaultLifecycleTerms[key] || key;
  };

  const translateLifecycleTitle = (key: string): string => {
    const term = translateLifecycle(key);
    return term.charAt(0).toUpperCase() + term.slice(1);
  };

  return {
    tl: translateLifecycle,
    TL: translateLifecycleTitle,
    t: translate,
    archetype: currentArchetype,
    archetypeSlug: currentArchetype?.slug || 'default',
  };
}
