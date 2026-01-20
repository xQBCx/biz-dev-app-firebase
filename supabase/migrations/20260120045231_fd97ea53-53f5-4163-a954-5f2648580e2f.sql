-- Trading Command & Capital Training Module
-- A disciplined capital command system for service professionals

-- Enum types for trading system
CREATE TYPE trading_skill_level AS ENUM ('recruit', 'trainee', 'operator', 'specialist', 'commander', 'strategist');
CREATE TYPE trading_session_status AS ENUM ('simulation', 'live', 'paused', 'graduated');
CREATE TYPE trade_type AS ENUM ('buy', 'sell', 'short', 'cover');
CREATE TYPE trade_status AS ENUM ('pending', 'executed', 'cancelled', 'expired');
CREATE TYPE capital_allocation_type AS ENUM ('reinvest', 'long_term_hold', 'ecosystem_company', 'co_investment', 'company_formation', 'withdrawal');

-- Trading profiles - links to user profiles and archetypes
CREATE TABLE trading_command_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_level trading_skill_level NOT NULL DEFAULT 'recruit',
  session_status trading_session_status NOT NULL DEFAULT 'simulation',
  risk_tolerance INTEGER NOT NULL DEFAULT 2 CHECK (risk_tolerance >= 1 AND risk_tolerance <= 5),
  max_position_size_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  max_daily_loss_percent DECIMAL(5,2) NOT NULL DEFAULT 2.00,
  max_weekly_loss_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  simulation_start_date TIMESTAMP WITH TIME ZONE,
  simulation_capital DECIMAL(15,2) DEFAULT 10000.00,
  live_capital DECIMAL(15,2) DEFAULT 0.00,
  total_simulated_pnl DECIMAL(15,2) DEFAULT 0.00,
  total_live_pnl DECIMAL(15,2) DEFAULT 0.00,
  graduation_criteria_met BOOLEAN DEFAULT FALSE,
  graduation_date TIMESTAMP WITH TIME ZONE,
  preferred_strategies TEXT[] DEFAULT '{}',
  trading_hours JSONB DEFAULT '{"start": "09:30", "end": "16:00", "timezone": "America/New_York"}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Trading playbooks/strategies - rules-based approaches
CREATE TABLE trading_playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  risk_level INTEGER NOT NULL DEFAULT 2 CHECK (risk_level >= 1 AND risk_level <= 5),
  min_skill_level trading_skill_level NOT NULL DEFAULT 'trainee',
  rules JSONB NOT NULL DEFAULT '{}',
  entry_criteria JSONB NOT NULL DEFAULT '[]',
  exit_criteria JSONB NOT NULL DEFAULT '[]',
  position_sizing_rules JSONB NOT NULL DEFAULT '{}',
  stop_loss_rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trading curriculum modules
CREATE TABLE trading_curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  module_order INTEGER NOT NULL,
  skill_level_required trading_skill_level NOT NULL DEFAULT 'recruit',
  content JSONB NOT NULL DEFAULT '{}',
  learning_objectives TEXT[] DEFAULT '{}',
  practical_exercises JSONB DEFAULT '[]',
  assessment_criteria JSONB DEFAULT '{}',
  estimated_hours INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User progress through curriculum
CREATE TABLE trading_curriculum_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curriculum_id UUID NOT NULL REFERENCES trading_curriculum(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assessment_score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, curriculum_id)
);

-- Trade journal - all trades (simulation and live)
CREATE TABLE trading_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_simulation BOOLEAN NOT NULL DEFAULT TRUE,
  playbook_id UUID REFERENCES trading_playbooks(id),
  symbol TEXT NOT NULL,
  trade_type trade_type NOT NULL,
  status trade_status NOT NULL DEFAULT 'pending',
  entry_price DECIMAL(15,4),
  exit_price DECIMAL(15,4),
  shares INTEGER NOT NULL,
  entry_time TIMESTAMP WITH TIME ZONE,
  exit_time TIMESTAMP WITH TIME ZONE,
  stop_loss_price DECIMAL(15,4),
  take_profit_price DECIMAL(15,4),
  realized_pnl DECIMAL(15,2),
  fees DECIMAL(10,2) DEFAULT 0.00,
  rule_adherence_score DECIMAL(5,2),
  pre_trade_notes TEXT,
  post_trade_notes TEXT,
  lessons_learned TEXT,
  emotional_state TEXT,
  market_conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance metrics snapshots
CREATE TABLE trading_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  is_simulation BOOLEAN NOT NULL DEFAULT TRUE,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  avg_winner DECIMAL(15,2),
  avg_loser DECIMAL(15,2),
  profit_factor DECIMAL(8,2),
  max_drawdown_percent DECIMAL(5,2),
  sharpe_ratio DECIMAL(8,4),
  rule_adherence_avg DECIMAL(5,2),
  capital_at_snapshot DECIMAL(15,2),
  daily_pnl DECIMAL(15,2),
  weekly_pnl DECIMAL(15,2),
  monthly_pnl DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, snapshot_date, is_simulation)
);

-- Capital allocation tracking
CREATE TABLE capital_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allocation_type capital_allocation_type NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  source_description TEXT,
  target_entity_id UUID,
  target_entity_type TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'executed', 'cancelled')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link to EROS - trading during downtime between deployments
CREATE TABLE trading_eros_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  eros_responder_id UUID REFERENCES eros_responder_profiles(id),
  auto_pause_during_deployment BOOLEAN DEFAULT TRUE,
  resume_after_deployment BOOLEAN DEFAULT TRUE,
  income_from_deployments DECIMAL(15,2) DEFAULT 0.00,
  income_allocated_to_trading DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE trading_command_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_curriculum_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_eros_integration ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trading_command_profiles
CREATE POLICY "Users can view own trading profile" ON trading_command_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own trading profile" ON trading_command_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trading profile" ON trading_command_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for trading_playbooks (public read, admin write)
CREATE POLICY "Anyone can view active playbooks" ON trading_playbooks
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage playbooks" ON trading_playbooks
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for trading_curriculum (public read)
CREATE POLICY "Anyone can view active curriculum" ON trading_curriculum
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage curriculum" ON trading_curriculum
  FOR ALL USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for trading_curriculum_progress
CREATE POLICY "Users can view own progress" ON trading_curriculum_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON trading_curriculum_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for trading_journal
CREATE POLICY "Users can view own trades" ON trading_journal
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own trades" ON trading_journal
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for trading_performance_snapshots
CREATE POLICY "Users can view own performance" ON trading_performance_snapshots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own performance snapshots" ON trading_performance_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for capital_allocations
CREATE POLICY "Users can view own allocations" ON capital_allocations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own allocations" ON capital_allocations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update pending allocations" ON capital_allocations
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- RLS Policies for trading_eros_integration
CREATE POLICY "Users can view own EROS integration" ON trading_eros_integration
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own EROS integration" ON trading_eros_integration
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_trading_profiles_user ON trading_command_profiles(user_id);
CREATE INDEX idx_trading_journal_user ON trading_journal(user_id);
CREATE INDEX idx_trading_journal_symbol ON trading_journal(symbol);
CREATE INDEX idx_trading_performance_user_date ON trading_performance_snapshots(user_id, snapshot_date);
CREATE INDEX idx_capital_allocations_user ON capital_allocations(user_id);
CREATE INDEX idx_curriculum_progress_user ON trading_curriculum_progress(user_id);

-- Triggers for updated_at
CREATE TRIGGER update_trading_command_profiles_updated_at
  BEFORE UPDATE ON trading_command_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_playbooks_updated_at
  BEFORE UPDATE ON trading_playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_curriculum_updated_at
  BEFORE UPDATE ON trading_curriculum
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_curriculum_progress_updated_at
  BEFORE UPDATE ON trading_curriculum_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_journal_updated_at
  BEFORE UPDATE ON trading_journal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capital_allocations_updated_at
  BEFORE UPDATE ON capital_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trading_eros_integration_updated_at
  BEFORE UPDATE ON trading_eros_integration
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial playbooks
INSERT INTO trading_playbooks (name, slug, description, risk_level, min_skill_level, rules, entry_criteria, exit_criteria) VALUES
('Momentum Breakout', 'momentum-breakout', 'Rules-based breakout trading on high-volume momentum stocks', 3, 'trainee', 
 '{"max_hold_time": "4 hours", "position_limit": 2, "stop_loss_percent": 2}',
 '[{"type": "price", "condition": "breaks_above", "value": "52_week_high"}, {"type": "volume", "condition": "above_average", "multiplier": 1.5}]',
 '[{"type": "profit_target", "percent": 5}, {"type": "stop_loss", "percent": 2}, {"type": "time", "max_hours": 4}]'),
('Mean Reversion', 'mean-reversion', 'Disciplined approach to oversold bounces with strict risk controls', 2, 'operator',
 '{"max_hold_time": "2 days", "position_limit": 3, "stop_loss_percent": 3}',
 '[{"type": "rsi", "condition": "below", "value": 30}, {"type": "support", "condition": "near_level"}]',
 '[{"type": "profit_target", "percent": 3}, {"type": "stop_loss", "percent": 3}, {"type": "rsi", "above": 50}]'),
('Gap Fill Strategy', 'gap-fill', 'Systematic approach to trading overnight gaps', 2, 'trainee',
 '{"max_hold_time": "1 day", "position_limit": 1, "stop_loss_percent": 1.5}',
 '[{"type": "gap", "condition": "gap_down", "min_percent": 3}, {"type": "market", "condition": "first_30_min"}]',
 '[{"type": "gap_fill", "percent": 50}, {"type": "stop_loss", "percent": 1.5}, {"type": "time", "max_hours": 6}]');

-- Insert initial curriculum modules
INSERT INTO trading_curriculum (title, description, module_order, skill_level_required, learning_objectives, estimated_hours) VALUES
('Capital Command Fundamentals', 'Understanding capital as a tool, not a gamble. Mission-oriented approach to trading.', 1, 'recruit',
 ARRAY['Understand capital preservation as priority #1', 'Learn position sizing fundamentals', 'Master the concept of risk-reward ratios'],
 2),
('Rules of Engagement', 'Establishing your personal trading rules and discipline framework.', 2, 'recruit',
 ARRAY['Create personal trading rules', 'Understand why rules matter', 'Learn to document and follow a trading plan'],
 3),
('Technical Reconnaissance', 'Chart patterns, indicators, and market analysis fundamentals.', 3, 'trainee',
 ARRAY['Read basic chart patterns', 'Understand key indicators (RSI, MACD, Volume)', 'Identify support and resistance levels'],
 4),
('Risk Management Operations', 'Position sizing, stop losses, and protecting your capital.', 4, 'trainee',
 ARRAY['Calculate proper position sizes', 'Set appropriate stop losses', 'Manage overall portfolio risk'],
 3),
('Playbook Execution', 'Implementing rules-based strategies with discipline.', 5, 'operator',
 ARRAY['Execute trades according to playbook rules', 'Document and review trades', 'Learn from wins and losses equally'],
 4),
('After-Action Review', 'Systematic trade review and continuous improvement.', 6, 'operator',
 ARRAY['Conduct thorough trade reviews', 'Identify patterns in your trading', 'Continuously refine your approach'],
 2);