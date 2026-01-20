import { ReactNode } from 'react';
import { useArchetypeTranslation } from '@/contexts/ArchetypeContext';

// Trading-specific terminology mappings
export const tradingTerminology = {
  default: {
    module_title: 'Trading Command Center',
    module_subtitle: 'Capital operations - disciplined, rules-based execution',
    dashboard: 'Dashboard',
    playbooks: 'Playbooks',
    curriculum: 'Training',
    journal: 'Trade Journal',
    performance: 'Performance',
    capital: 'Capital',
    trades: 'Trades',
    position: 'Position',
    entry: 'Entry',
    exit: 'Exit',
    stop_loss: 'Stop Loss',
    take_profit: 'Take Profit',
    win_rate: 'Win Rate',
    pnl: 'P&L',
    simulation: 'Simulation Mode',
    live: 'Live Trading',
    recruit: 'Beginner',
    trainee: 'Intermediate',
    operator: 'Advanced',
    specialist: 'Expert',
    commander: 'Master',
    strategist: 'Elite',
    allocation: 'Allocation',
    reinvest: 'Reinvest',
    withdraw: 'Withdraw',
    risk_tolerance: 'Risk Tolerance',
    max_position: 'Max Position Size',
    daily_loss_limit: 'Daily Loss Limit',
    weekly_loss_limit: 'Weekly Loss Limit',
    pre_trade_checklist: 'Pre-Trade Checklist',
    post_trade_review: 'Post-Trade Review',
    lessons_learned: 'Lessons Learned',
    rule_adherence: 'Rule Adherence',
    graduation: 'Graduation',
    mission_brief: 'Today\'s Focus',
    active_rules: 'Active Rules',
    next_training: 'Next Training',
  },
  service_professional: {
    module_title: 'Trading Command & Control',
    module_subtitle: 'Capital operations - mission-based execution protocol',
    dashboard: 'Command Center',
    playbooks: 'Rules of Engagement',
    curriculum: 'Training Protocol',
    journal: 'Operations Log',
    performance: 'After Action Review',
    capital: 'Operational Capital',
    trades: 'Missions',
    position: 'Deployment',
    entry: 'Insertion',
    exit: 'Extraction',
    stop_loss: 'Abort Threshold',
    take_profit: 'Objective Achieved',
    win_rate: 'Mission Success Rate',
    pnl: 'Mission Outcome',
    simulation: 'Training Mode',
    live: 'Live Operations',
    recruit: 'Recruit',
    trainee: 'Trainee',
    operator: 'Operator',
    specialist: 'Specialist',
    commander: 'Commander',
    strategist: 'Strategist',
    allocation: 'Resource Deployment',
    reinvest: 'Reinforce Position',
    withdraw: 'Extract to Base',
    risk_tolerance: 'Acceptable Risk Level',
    max_position: 'Max Force Commitment',
    daily_loss_limit: 'Daily Casualty Limit',
    weekly_loss_limit: 'Weekly Casualty Limit',
    pre_trade_checklist: 'Pre-Mission Briefing',
    post_trade_review: 'Debrief',
    lessons_learned: 'Intel Gathered',
    rule_adherence: 'Protocol Compliance',
    graduation: 'Promotion',
    mission_brief: 'Mission Brief',
    active_rules: 'Standing Orders',
    next_training: 'Next Drill',
  },
  technical_professional: {
    module_title: 'Trading System Console',
    module_subtitle: 'Systematic capital deployment with algorithmic precision',
    dashboard: 'System Overview',
    playbooks: 'Algorithms',
    curriculum: 'Documentation',
    journal: 'Execution Log',
    performance: 'Analytics',
    capital: 'Working Capital',
    trades: 'Executions',
    position: 'Active Position',
    entry: 'Entry Point',
    exit: 'Exit Point',
    stop_loss: 'Stop Loss Trigger',
    take_profit: 'Target Price',
    win_rate: 'Success Rate',
    pnl: 'Net P&L',
    simulation: 'Sandbox Mode',
    live: 'Production',
    recruit: 'Level 1',
    trainee: 'Level 2',
    operator: 'Level 3',
    specialist: 'Level 4',
    commander: 'Level 5',
    strategist: 'Level 6',
    allocation: 'Resource Allocation',
    reinvest: 'Compound',
    withdraw: 'Withdraw',
    risk_tolerance: 'Risk Parameters',
    max_position: 'Position Size Limit',
    daily_loss_limit: 'Daily Drawdown Limit',
    weekly_loss_limit: 'Weekly Drawdown Limit',
    pre_trade_checklist: 'Pre-Execution Checks',
    post_trade_review: 'Post-Execution Analysis',
    lessons_learned: 'System Updates',
    rule_adherence: 'Algorithm Compliance',
    graduation: 'Level Up',
    mission_brief: 'Daily Brief',
    active_rules: 'Active Parameters',
    next_training: 'Next Module',
  },
  entrepreneur: {
    module_title: 'Capital Growth Engine',
    module_subtitle: 'Strategic capital deployment for wealth building',
    dashboard: 'Overview',
    playbooks: 'Strategies',
    curriculum: 'Education',
    journal: 'Trade Log',
    performance: 'Results',
    capital: 'Investment Capital',
    trades: 'Investments',
    position: 'Holding',
    entry: 'Buy Point',
    exit: 'Sell Point',
    stop_loss: 'Risk Limit',
    take_profit: 'Profit Target',
    win_rate: 'Success Rate',
    pnl: 'Returns',
    simulation: 'Paper Trading',
    live: 'Real Money',
    recruit: 'Starter',
    trainee: 'Growing',
    operator: 'Established',
    specialist: 'Skilled',
    commander: 'Expert',
    strategist: 'Master',
    allocation: 'Investment',
    reinvest: 'Compound Returns',
    withdraw: 'Take Profits',
    risk_tolerance: 'Risk Appetite',
    max_position: 'Max Investment',
    daily_loss_limit: 'Daily Risk Limit',
    weekly_loss_limit: 'Weekly Risk Limit',
    pre_trade_checklist: 'Due Diligence',
    post_trade_review: 'Performance Review',
    lessons_learned: 'Key Takeaways',
    rule_adherence: 'Strategy Discipline',
    graduation: 'Advancement',
    mission_brief: 'Daily Plan',
    active_rules: 'Investment Rules',
    next_training: 'Next Lesson',
  },
};

type TerminologyKey = keyof typeof tradingTerminology.default;

export function useTradingTerminology() {
  const { archetype } = useArchetypeTranslation();
  
  const getTerminology = () => {
    const slug = archetype?.slug || 'default';
    return tradingTerminology[slug as keyof typeof tradingTerminology] || tradingTerminology.default;
  };

  const t = (key: TerminologyKey): string => {
    const terms = getTerminology();
    return terms[key] || tradingTerminology.default[key] || key;
  };

  const T = (key: TerminologyKey): string => {
    const term = t(key);
    return term.charAt(0).toUpperCase() + term.slice(1);
  };

  return { t, T, terminology: getTerminology(), archetypeSlug: archetype?.slug };
}

// Wrapper component for archetype-aware text
interface TradingTextProps {
  term: TerminologyKey;
  capitalize?: boolean;
  className?: string;
}

export function TradingText({ term, capitalize = false, className }: TradingTextProps) {
  const { t, T } = useTradingTerminology();
  return <span className={className}>{capitalize ? T(term) : t(term)}</span>;
}

// Skill level display with archetype-aware labels
export function useSkillLevelDisplay() {
  const { t } = useTradingTerminology();
  
  return {
    recruit: { label: t('recruit'), color: 'bg-slate-500' },
    trainee: { label: t('trainee'), color: 'bg-blue-500' },
    operator: { label: t('operator'), color: 'bg-green-500' },
    specialist: { label: t('specialist'), color: 'bg-yellow-500' },
    commander: { label: t('commander'), color: 'bg-orange-500' },
    strategist: { label: t('strategist'), color: 'bg-purple-500' },
  };
}
