-- Create players table
CREATE TABLE IF NOT EXISTS public.trueodds_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  position TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  next_game TIMESTAMP WITH TIME ZONE,
  next_opponent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player props table (current projections/odds)
CREATE TABLE IF NOT EXISTS public.trueodds_player_props (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.trueodds_players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  team TEXT NOT NULL,
  stat_type TEXT NOT NULL,
  projection DECIMAL NOT NULL,
  over_odds DECIMAL NOT NULL DEFAULT 1.90,
  under_odds DECIMAL NOT NULL DEFAULT 1.90,
  game_opponent TEXT NOT NULL,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player history table (past game stats)
CREATE TABLE IF NOT EXISTS public.trueodds_player_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.trueodds_players(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL,
  stat_value DECIMAL NOT NULL,
  opponent TEXT NOT NULL,
  game_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trueodds_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_player_props ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trueodds_player_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read access)
CREATE POLICY "Public can view players"
  ON public.trueodds_players FOR SELECT
  USING (true);

CREATE POLICY "Public can view player props"
  ON public.trueodds_player_props FOR SELECT
  USING (true);

CREATE POLICY "Public can view player history"
  ON public.trueodds_player_history FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_trueodds_player_props_player_id ON public.trueodds_player_props(player_id);
CREATE INDEX idx_trueodds_player_props_stat_type ON public.trueodds_player_props(stat_type);
CREATE INDEX idx_trueodds_player_history_player_id ON public.trueodds_player_history(player_id);
CREATE INDEX idx_trueodds_player_history_stat_type ON public.trueodds_player_history(stat_type);
CREATE INDEX idx_trueodds_players_name ON public.trueodds_players(name);

-- Trigger for updated_at
CREATE TRIGGER update_trueodds_players_updated_at
  BEFORE UPDATE ON public.trueodds_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trueodds_player_props_updated_at
  BEFORE UPDATE ON public.trueodds_player_props
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();