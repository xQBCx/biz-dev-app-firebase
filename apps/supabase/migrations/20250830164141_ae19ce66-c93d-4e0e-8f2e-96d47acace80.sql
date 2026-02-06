-- Insert three detailed sample courses
INSERT INTO academy_courses (
  title, 
  description, 
  department, 
  difficulty, 
  duration_minutes, 
  xp_reward, 
  instructor_name, 
  learning_objectives, 
  prerequisites, 
  tags, 
  featured,
  active
) VALUES 
(
  'Front Desk Excellence: First Impressions Matter',
  'Master the art of exceptional guest service from check-in to check-out. Learn proven techniques for handling difficult situations, upselling opportunities, and creating memorable experiences that drive positive reviews and repeat business.',
  'Front Desk',
  'beginner',
  45,
  100,
  'Coach Lopez',
  ARRAY[
    'Deliver exceptional first impressions within 30 seconds of guest contact',
    'Handle guest complaints with the LAST method (Listen, Apologize, Solve, Thank)',
    'Identify and execute upselling opportunities that increase revenue by 15%',
    'Master the property management system for efficient check-ins and check-outs',
    'Implement safety and security protocols for guest and staff protection'
  ],
  ARRAY['Basic computer skills', 'Customer service mindset'],
  ARRAY['customer service', 'front desk', 'hospitality', 'communication', 'upselling', 'PMS'],
  true,
  true
),
(
  'Housekeeping Mastery: Speed, Quality, and Safety',
  'Transform your housekeeping approach with industry-leading techniques that balance speed with quality. Learn the secrets of efficient room turnover, proper chemical handling, and creating spaces that wow guests while protecting your health.',
  'Housekeeping',
  'intermediate',
  60,
  120,
  'Maria Rodriguez',
  ARRAY[
    'Complete standard rooms in 22 minutes while maintaining 5-star quality',
    'Properly mix and apply cleaning chemicals following OSHA safety standards',
    'Identify and report maintenance issues before they become guest complaints',
    'Execute deep cleaning protocols for maximum guest satisfaction',
    'Manage housekeeping cart organization for maximum efficiency'
  ],
  ARRAY['Basic English comprehension', '6 months housekeeping experience'],
  ARRAY['housekeeping', 'cleaning', 'efficiency', 'safety', 'quality control'],
  true,
  true
),
(
  'Leadership Fundamentals: Building High-Performance Teams',
  'Develop the essential leadership skills needed to inspire, motivate, and guide your team to exceptional performance. Learn how to create a positive work culture, handle difficult conversations, and drive results through people.',
  'Operations',
  'advanced',
  90,
  200,
  'Coach Lopez',
  ARRAY[
    'Apply situational leadership techniques for different team member needs',
    'Conduct effective performance conversations that drive improvement',
    'Build trust and psychological safety within your team',
    'Implement goal-setting frameworks that achieve 95% completion rates',
    'Navigate conflict resolution with win-win outcomes'
  ],
  ARRAY['6+ months supervisory experience', 'Completion of "Communication Essentials" course'],
  ARRAY['leadership', 'management', 'team building', 'communication', 'performance'],
  true,
  true
);

-- Create storage bucket for academy videos
INSERT INTO storage.buckets (id, name, public) VALUES ('academy-videos', 'academy-videos', true);

-- Create policies for academy videos bucket
CREATE POLICY "Public can view academy videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'academy-videos');

CREATE POLICY "Authenticated users can upload academy videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'academy-videos' AND auth.role() = 'authenticated');