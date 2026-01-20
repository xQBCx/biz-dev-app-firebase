import React from 'react';
import { useArchetype, LanguageConfig } from '@/contexts/ArchetypeContext';

interface ArchetypeTextProps {
  term: keyof LanguageConfig;
  capitalize?: boolean;
  className?: string;
}

/**
 * Renders archetype-aware terminology
 * 
 * @example
 * <ArchetypeText term="tasks" /> // renders "missions" for service professionals
 * <ArchetypeText term="deals" capitalize /> // renders "Operations" for service professionals
 */
export function ArchetypeText({ term, capitalize = false, className }: ArchetypeTextProps) {
  const { translate, translatePlural } = useArchetype();
  
  const text = capitalize ? translatePlural(term) : translate(term);
  
  return <span className={className}>{text}</span>;
}

/**
 * Higher-order component to inject archetype translations as props
 */
export function withArchetypeTranslation<P extends object>(
  WrappedComponent: React.ComponentType<P & { t: (key: keyof LanguageConfig) => string }>
) {
  return function WithArchetypeTranslation(props: P) {
    const { translate } = useArchetype();
    return <WrappedComponent {...props} t={translate} />;
  };
}
