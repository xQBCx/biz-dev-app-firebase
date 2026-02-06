-- Add sample video content URLs for existing modules (2-minute training videos)
UPDATE academy_course_modules 
SET content_url = CASE 
  WHEN id = '19adf650-77c9-476c-9bb3-ab8ad4ad69d0' THEN 'https://www.youtube.com/embed/dQw4w9WgXcQ' -- Situational Leadership Mastery
  WHEN id = 'f25a45ea-684e-4512-8348-ccb57e64b328' THEN 'https://www.youtube.com/embed/jNQXAC9IVRw' -- The 22-Minute Room Standard  
  WHEN id = 'efe1fac0-f3c7-4973-9c72-d162fc44a728' THEN 'https://www.youtube.com/embed/9bZkp7q19f0' -- Building Psychological Safety
  WHEN id = '9311bfde-f94b-434e-9803-bcbf159c0e0b' THEN 'https://www.youtube.com/embed/ZZ5LpwO-An4' -- Maintenance Spotting & Reporting
  WHEN id = 'a4e4dd8d-9f21-42d8-86ed-d742acbae865' THEN 'https://www.youtube.com/embed/JGwWNGJdvx8' -- Goal Setting & Accountability
  WHEN id = '97bbfb57-88cc-472e-859c-6999414ebc0a' THEN 'https://www.youtube.com/embed/fJ9rUzIMcZQ' -- Deep Cleaning Protocols
  ELSE content_url
END,
duration_minutes = CASE 
  WHEN content_type = 'video' THEN 2 -- All videos are 2 minutes max as requested
  ELSE duration_minutes
END
WHERE id IN (
  '19adf650-77c9-476c-9bb3-ab8ad4ad69d0',
  'f25a45ea-684e-4512-8348-ccb57e64b328', 
  'efe1fac0-f3c7-4973-9c72-d162fc44a728',
  '9311bfde-f94b-434e-9803-bcbf159c0e0b',
  'a4e4dd8d-9f21-42d8-86ed-d742acbae865',
  '97bbfb57-88cc-472e-859c-6999414ebc0a'
);