-- Create courses table
CREATE TABLE public.academy_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  thumbnail_url TEXT,
  instructor_name TEXT,
  learning_objectives TEXT[],
  prerequisites TEXT[],
  tags TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course modules table
CREATE TABLE public.academy_course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'video',
  content_url TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course enrollments table
CREATE TABLE public.academy_course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'enrolled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create module progress table
CREATE TABLE public.academy_module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id UUID NOT NULL,
  course_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_module_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Everyone can view active courses"
ON public.academy_courses
FOR SELECT
USING (active = true);

CREATE POLICY "Authenticated users can manage courses"
ON public.academy_courses
FOR ALL
USING (true);

-- RLS Policies for course modules
CREATE POLICY "Everyone can view active modules"
ON public.academy_course_modules
FOR SELECT
USING (active = true);

CREATE POLICY "Authenticated users can manage modules"
ON public.academy_course_modules
FOR ALL
USING (true);

-- RLS Policies for enrollments
CREATE POLICY "Users can view their own enrollments"
ON public.academy_course_enrollments
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own enrollments"
ON public.academy_course_enrollments
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own enrollments"
ON public.academy_course_enrollments
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can manage all enrollments"
ON public.academy_course_enrollments
FOR ALL
USING (true);

-- RLS Policies for module progress
CREATE POLICY "Users can view their own progress"
ON public.academy_module_progress
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
ON public.academy_module_progress
FOR ALL
USING (user_id = auth.uid());

CREATE POLICY "System can manage all progress"
ON public.academy_module_progress
FOR ALL
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_academy_courses_updated_at
BEFORE UPDATE ON public.academy_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_course_modules_updated_at
BEFORE UPDATE ON public.academy_course_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_course_enrollments_updated_at
BEFORE UPDATE ON public.academy_course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academy_module_progress_updated_at
BEFORE UPDATE ON public.academy_module_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses for different departments
INSERT INTO public.academy_courses (title, description, department, difficulty, duration_minutes, xp_reward, instructor_name, learning_objectives, prerequisites, tags, featured) VALUES
-- Front Desk Department
('Guest Service Excellence', 'Master the art of exceptional guest service and create memorable experiences for every visitor.', 'Front Desk', 'beginner', 45, 100, 'Sarah Johnson', 
 ARRAY['Understand guest service fundamentals', 'Handle difficult situations professionally', 'Create positive first impressions', 'Master phone and email etiquette'],
 ARRAY[]::text[], ARRAY['customer service', 'communication', 'hospitality'], true),

('Property Management Systems (PMS)', 'Complete guide to using property management software for check-ins, reservations, and guest records.', 'Front Desk', 'intermediate', 60, 120, 'Michael Chen',
 ARRAY['Navigate PMS interfaces efficiently', 'Process check-ins and check-outs', 'Manage reservations and modifications', 'Generate reports and analytics'],
 ARRAY['Guest Service Excellence'], ARRAY['technology', 'pms', 'operations'], true),

-- Housekeeping Department  
('Room Cleaning Standards', 'Learn the comprehensive standards for maintaining pristine guest rooms and common areas.', 'Housekeeping', 'beginner', 40, 80, 'Maria Rodriguez',
 ARRAY['Master room cleaning procedures', 'Understand quality control standards', 'Learn time management techniques', 'Ensure guest satisfaction'],
 ARRAY[]::text[], ARRAY['cleaning', 'standards', 'quality'], true),

('Inventory Management & Supplies', 'Efficient management of housekeeping supplies, inventory tracking, and cost control.', 'Housekeeping', 'intermediate', 35, 90, 'David Kim',
 ARRAY['Track inventory levels accurately', 'Optimize supply usage', 'Implement cost-saving measures', 'Coordinate with purchasing'],
 ARRAY['Room Cleaning Standards'], ARRAY['inventory', 'supplies', 'cost control'], false),

-- Maintenance Department
('Preventive Maintenance Fundamentals', 'Essential preventive maintenance practices to keep properties running smoothly and efficiently.', 'Maintenance', 'beginner', 50, 110, 'Robert Torres',
 ARRAY['Understand preventive maintenance importance', 'Create maintenance schedules', 'Identify potential issues early', 'Document maintenance activities'],
 ARRAY[]::text[], ARRAY['maintenance', 'prevention', 'equipment'], true),

('Emergency Response Procedures', 'Critical emergency response protocols for various property incidents and safety situations.', 'Maintenance', 'advanced', 40, 150, 'Jennifer Walsh',
 ARRAY['Respond to emergency situations', 'Follow safety protocols', 'Coordinate with emergency services', 'Document incidents properly'],
 ARRAY['Preventive Maintenance Fundamentals'], ARRAY['emergency', 'safety', 'protocols'], true),

-- Operations Department
('Revenue Management Basics', 'Introduction to revenue optimization strategies and pricing techniques for maximum profitability.', 'Operations', 'intermediate', 55, 130, 'Amanda Foster',
 ARRAY['Understand revenue management principles', 'Analyze market trends', 'Optimize pricing strategies', 'Maximize occupancy and ADR'],
 ARRAY[]::text[], ARRAY['revenue', 'pricing', 'analytics'], true),

('Leadership & Team Development', 'Essential leadership skills for managers and supervisors to build and motivate high-performing teams.', 'Operations', 'advanced', 70, 180, 'James Peterson',
 ARRAY['Develop leadership competencies', 'Build effective teams', 'Motivate and engage employees', 'Handle performance management'],
 ARRAY[]::text[], ARRAY['leadership', 'management', 'teams'], true),

-- General/Cross-Department
('Workplace Safety & OSHA Compliance', 'Comprehensive workplace safety training covering OSHA requirements and best practices.', 'General', 'beginner', 45, 100, 'Lisa Thompson',
 ARRAY['Understand OSHA regulations', 'Identify workplace hazards', 'Implement safety procedures', 'Report incidents properly'],
 ARRAY[]::text[], ARRAY['safety', 'osha', 'compliance'], true),

('Customer Experience Excellence', 'Advanced strategies for creating exceptional customer experiences across all touchpoints.', 'General', 'intermediate', 65, 140, 'Carlos Martinez',
 ARRAY['Design customer journey maps', 'Exceed customer expectations', 'Handle complaints effectively', 'Build customer loyalty'],
 ARRAY[]::text[], ARRAY['customer experience', 'service', 'loyalty'], true);