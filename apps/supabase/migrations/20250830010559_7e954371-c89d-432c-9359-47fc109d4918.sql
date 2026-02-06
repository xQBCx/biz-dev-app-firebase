-- Add sample courses including the "Word for Coach" course featuring Coach Lopez
INSERT INTO academy_courses (title, description, department, difficulty, duration_minutes, xp_reward, instructor_name, learning_objectives, prerequisites, tags, featured, thumbnail_url, active) VALUES

-- Featured Coach Lopez Course
('Word for Coach: Leadership Excellence', 'Learn leadership fundamentals and team motivation from industry veteran Coach Lopez. This course covers communication strategies, conflict resolution, and building high-performing teams in hospitality environments.', 'General', 'intermediate', 45, 100, 'Coach Lopez', ARRAY['Master effective communication techniques', 'Learn conflict resolution strategies', 'Build and motivate high-performing teams', 'Develop leadership presence'], ARRAY[], ARRAY['leadership', 'communication', 'team building', 'coaching', 'management'], true, null, true),

-- Front Desk Courses
('Advanced Guest Relations', 'Master the art of exceptional guest service and handle challenging situations with confidence. Learn upselling techniques and create memorable experiences.', 'Front Desk', 'intermediate', 35, 75, 'Sarah Mitchell', ARRAY['Handle difficult guest situations', 'Master upselling techniques', 'Create memorable guest experiences', 'Develop emotional intelligence'], ARRAY['Basic Guest Service'], ARRAY['guest service', 'upselling', 'communication', 'hospitality'], false, null, true),

('Night Audit Essentials', 'Complete training for night audit operations including security protocols, emergency procedures, and morning preparation tasks.', 'Front Desk', 'beginner', 60, 90, 'Marcus Johnson', ARRAY['Execute night audit procedures', 'Handle security protocols', 'Manage emergency situations', 'Prepare morning reports'], ARRAY[], ARRAY['night audit', 'security', 'procedures', 'safety'], false, null, true),

-- Housekeeping Courses
('Eco-Friendly Cleaning Excellence', 'Learn sustainable cleaning practices and green certification standards while maintaining the highest quality service.', 'Housekeeping', 'intermediate', 40, 80, 'Maria Rodriguez', ARRAY['Implement eco-friendly practices', 'Understand green certifications', 'Maintain quality standards', 'Reduce environmental impact'], ARRAY['Basic Housekeeping'], ARRAY['sustainability', 'green cleaning', 'certification', 'environment'], false, null, true),

('Deep Clean Mastery', 'Advanced techniques for deep cleaning and restoration, including specialized equipment usage and stain removal.', 'Housekeeping', 'advanced', 55, 95, 'Jennifer Park', ARRAY['Master deep cleaning techniques', 'Use specialized equipment', 'Handle stain removal', 'Restore room conditions'], ARRAY['Eco-Friendly Cleaning'], ARRAY['deep cleaning', 'restoration', 'equipment', 'techniques'], true, null, true),

-- Maintenance Courses
('HVAC Troubleshooting Pro', 'Comprehensive HVAC system diagnostics and repair for property maintenance professionals.', 'Maintenance', 'advanced', 75, 120, 'David Chen', ARRAY['Diagnose HVAC issues', 'Perform system repairs', 'Understand energy efficiency', 'Follow safety protocols'], ARRAY['Basic Maintenance'], ARRAY['hvac', 'diagnostics', 'repair', 'energy efficiency'], false, null, true),

('Preventive Maintenance Planning', 'Learn to create and implement effective preventive maintenance schedules to reduce emergency repairs and extend equipment life.', 'Maintenance', 'intermediate', 50, 85, 'Robert Taylor', ARRAY['Create maintenance schedules', 'Implement preventive strategies', 'Track equipment lifecycle', 'Reduce emergency repairs'], ARRAY[], ARRAY['preventive maintenance', 'planning', 'scheduling', 'equipment'], false, null, true),

-- Operations Courses
('Revenue Management Fundamentals', 'Understanding pricing strategies, market analysis, and revenue optimization for maximum profitability.', 'Operations', 'intermediate', 65, 110, 'Amanda Foster', ARRAY['Understand pricing strategies', 'Analyze market trends', 'Optimize revenue streams', 'Use revenue management systems'], ARRAY[], ARRAY['revenue management', 'pricing', 'analysis', 'profitability'], true, null, true),

('Crisis Management & Emergency Response', 'Prepare for and respond to various emergency situations including natural disasters, security threats, and operational crises.', 'Operations', 'advanced', 70, 115, 'Captain James Wilson', ARRAY['Develop crisis response plans', 'Handle emergency situations', 'Coordinate with authorities', 'Maintain guest safety'], ARRAY[], ARRAY['crisis management', 'emergency response', 'safety', 'protocols'], false, null, true),

-- General Skills
('Digital Communication Mastery', 'Master modern communication tools, social media management, and digital guest engagement strategies.', 'General', 'beginner', 30, 60, 'Tech Trainer Alex Kim', ARRAY['Use digital communication tools', 'Manage social media presence', 'Engage guests online', 'Handle online reviews'], ARRAY[], ARRAY['digital communication', 'social media', 'technology', 'engagement'], false, null, true),

('Time Management & Productivity', 'Learn proven techniques to maximize productivity, manage multiple priorities, and achieve work-life balance.', 'General', 'beginner', 35, 65, 'Productivity Coach Lisa Wong', ARRAY['Master time management techniques', 'Prioritize tasks effectively', 'Achieve work-life balance', 'Use productivity tools'], ARRAY[], ARRAY['time management', 'productivity', 'organization', 'efficiency'], true, null, true);