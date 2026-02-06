-- Create academy_rewards table for reward catalog
CREATE TABLE public.academy_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('experience', 'perk', 'growth', 'career')),
  xp_cost INTEGER NOT NULL CHECK (xp_cost > 0),
  image_url TEXT,
  stock INTEGER DEFAULT NULL, -- NULL means unlimited stock
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create academy_redemptions table for tracking reward requests
CREATE TABLE public.academy_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID NOT NULL REFERENCES public.academy_rewards(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL, -- References user from profiles
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'denied', 'fulfilled')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create academy_progress table for tracking XP and levels
CREATE TABLE public.academy_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  modules_completed INTEGER NOT NULL DEFAULT 0,
  hours_logged INTEGER NOT NULL DEFAULT 0,
  certifications_earned INTEGER NOT NULL DEFAULT 0,
  culture_points INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create academy_badges table for achievements
CREATE TABLE public.academy_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('learning', 'performance', 'culture', 'promotion')),
  xp_requirement INTEGER DEFAULT NULL,
  conditions JSONB, -- Flexible conditions for earning badges
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges junction table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.academy_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create academy_challenges table for team goals
CREATE TABLE public.academy_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individual', 'team', 'property')),
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.academy_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies for academy_rewards
CREATE POLICY "Everyone can view active rewards" 
ON public.academy_rewards 
FOR SELECT 
USING (active = true);

CREATE POLICY "Authenticated users can manage rewards" 
ON public.academy_rewards 
FOR ALL 
USING (true);

-- RLS policies for academy_redemptions
CREATE POLICY "Users can view their own redemptions" 
ON public.academy_redemptions 
FOR SELECT 
USING (employee_id = auth.uid());

CREATE POLICY "Users can create their own redemptions" 
ON public.academy_redemptions 
FOR INSERT 
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Authenticated users can manage all redemptions" 
ON public.academy_redemptions 
FOR ALL 
USING (true);

-- RLS policies for academy_progress
CREATE POLICY "Users can view their own progress" 
ON public.academy_progress 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress" 
ON public.academy_progress 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can manage all progress" 
ON public.academy_progress 
FOR ALL 
USING (true);

-- RLS policies for academy_badges
CREATE POLICY "Everyone can view badges" 
ON public.academy_badges 
FOR SELECT 
USING (active = true);

CREATE POLICY "Authenticated users can manage badges" 
ON public.academy_badges 
FOR ALL 
USING (true);

-- RLS policies for user_badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage user badges" 
ON public.user_badges 
FOR ALL 
USING (true);

-- RLS policies for academy_challenges
CREATE POLICY "Everyone can view active challenges" 
ON public.academy_challenges 
FOR SELECT 
USING (active = true);

CREATE POLICY "Authenticated users can manage challenges" 
ON public.academy_challenges 
FOR ALL 
USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_academy_rewards_updated_at
BEFORE UPDATE ON public.academy_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_redemptions_updated_at
BEFORE UPDATE ON public.academy_redemptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_progress_updated_at
BEFORE UPDATE ON public.academy_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample rewards
INSERT INTO public.academy_rewards (title, description, category, xp_cost, image_url) VALUES
('Extra PTO Day', 'Earn an additional paid time off day to use at your discretion', 'experience', 1000, NULL),
('Weekend Getaway Voucher', 'Two-night stay at a partner hotel or resort', 'experience', 2000, NULL),
('Wellness Retreat Access', 'Full-day wellness retreat including spa services', 'experience', 1500, NULL),
('Premium Parking Spot', 'Reserved parking spot for one month', 'perk', 300, NULL),
('Branded Backpack', 'High-quality company branded backpack', 'perk', 250, NULL),
('Free Lunch Week', 'Five free lunches at the property restaurant', 'perk', 400, NULL),
('GM Mentorship Session', 'One-on-one mentoring session with General Manager', 'growth', 800, NULL),
('Conference Ticket', 'Paid attendance to industry conference of choice', 'growth', 3000, NULL),
('Leadership Workshop', 'Access to advanced leadership training program', 'growth', 1200, NULL),
('Promotion Review Fast Track', 'Priority consideration for next promotion cycle', 'career', 2500, NULL);

-- Insert sample badges
INSERT INTO public.academy_badges (name, description, icon_name, category, xp_requirement) VALUES
('First Steps', 'Complete your first training module', 'BookOpen', 'learning', 50),
('Knowledge Seeker', 'Complete 10 training modules', 'GraduationCap', 'learning', 500),
('Master Learner', 'Complete 50 training modules', 'Award', 'learning', 2500),
('Perfect Attendance', 'Complete all assigned modules on time for 30 days', 'Calendar', 'performance', NULL),
('Culture Champion', 'Receive 50 culture points from peers', 'Heart', 'culture', NULL),
('Team Player', 'Participate in 5 team challenges', 'Users', 'culture', NULL),
('Supervisor Ready', 'Meet all requirements for supervisor promotion', 'TrendingUp', 'promotion', 1000),
('Leadership Track', 'Meet all requirements for management promotion', 'Crown', 'promotion', 3000);