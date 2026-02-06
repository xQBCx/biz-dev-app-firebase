-- Insert course modules for the first course (Front Desk Excellence)
INSERT INTO academy_course_modules (
  course_id,
  title,
  description,
  content_type,
  duration_minutes,
  xp_reward,
  order_index,
  active
) 
SELECT 
  c.id,
  module_data.title,
  module_data.description,
  module_data.content_type,
  module_data.duration_minutes,
  module_data.xp_reward,
  module_data.order_index,
  true
FROM academy_courses c,
(VALUES 
  ('Welcome & First Impressions', 'Learn the psychology behind first impressions and how to make every guest feel valued from the moment they arrive.', 'video', 8, 10, 1),
  ('Property Management System Mastery', 'Complete walkthrough of PMS operations including check-in, check-out, room assignments, and guest preferences.', 'interactive', 12, 15, 2),
  ('The LAST Method for Complaint Resolution', 'Master the proven 4-step process for turning guest complaints into opportunities for exceptional service.', 'video', 10, 15, 3),
  ('Upselling Techniques That Work', 'Ethical upselling strategies that increase revenue while enhancing the guest experience.', 'video', 8, 10, 4),
  ('Safety & Security Protocols', 'Essential safety procedures for guest and staff protection, including emergency response.', 'document', 7, 10, 5)
) AS module_data(title, description, content_type, duration_minutes, xp_reward, order_index)
WHERE c.title = 'Front Desk Excellence: First Impressions Matter';

-- Insert course modules for the second course (Housekeeping Mastery)
INSERT INTO academy_course_modules (
  course_id,
  title,
  description,
  content_type,
  duration_minutes,
  xp_reward,
  order_index,
  active
) 
SELECT 
  c.id,
  module_data.title,
  module_data.description,
  module_data.content_type,
  module_data.duration_minutes,
  module_data.xp_reward,
  module_data.order_index,
  true
FROM academy_courses c,
(VALUES 
  ('The 22-Minute Room Standard', 'Step-by-step breakdown of efficient room cleaning that maintains quality while meeting time targets.', 'video', 15, 20, 1),
  ('Chemical Safety & Proper Dilution', 'OSHA-compliant chemical handling, proper dilution ratios, and personal protective equipment usage.', 'interactive', 12, 15, 2),
  ('Maintenance Spotting & Reporting', 'How to identify potential maintenance issues and communicate them effectively to prevent guest complaints.', 'video', 8, 10, 3),
  ('Deep Cleaning Protocols', 'Advanced techniques for thorough deep cleaning that exceeds guest expectations.', 'video', 15, 20, 4),
  ('Cart Organization & Efficiency', 'Optimal housekeeping cart setup and organization strategies for maximum productivity.', 'document', 10, 15, 5)
) AS module_data(title, description, content_type, duration_minutes, xp_reward, order_index)
WHERE c.title = 'Housekeeping Mastery: Speed, Quality, and Safety';

-- Insert course modules for the third course (Leadership Fundamentals)
INSERT INTO academy_course_modules (
  course_id,
  title,
  description,
  content_type,
  duration_minutes,
  xp_reward,
  order_index,
  active
) 
SELECT 
  c.id,
  module_data.title,
  module_data.description,
  module_data.content_type,
  module_data.duration_minutes,
  module_data.xp_reward,
  module_data.order_index,
  true
FROM academy_courses c,
(VALUES 
  ('Situational Leadership Mastery', 'Learn to adapt your leadership style based on team member competence and commitment levels.', 'video', 18, 25, 1),
  ('Performance Conversations That Work', 'Framework for conducting effective performance discussions that motivate and improve results.', 'interactive', 15, 20, 2),
  ('Building Psychological Safety', 'Create an environment where team members feel safe to speak up, make mistakes, and innovate.', 'video', 12, 15, 3),
  ('Goal Setting & Accountability', 'Implement SMART+ goals and accountability systems that drive consistent results.', 'video', 20, 30, 4),
  ('Conflict Resolution Strategies', 'Navigate workplace conflicts with techniques that preserve relationships and find win-win solutions.', 'video', 15, 20, 5),
  ('Creating a High-Performance Culture', 'Build and maintain a culture of excellence that attracts and retains top talent.', 'document', 10, 15, 6)
) AS module_data(title, description, content_type, duration_minutes, xp_reward, order_index)
WHERE c.title = 'Leadership Fundamentals: Building High-Performance Teams';