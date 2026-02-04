-- Add device and storage permission tracking to sessions
ALTER TABLE sessions 
ADD COLUMN device_used TEXT CHECK (device_used IN ('client_phone', 'photographer_phone')),
ADD COLUMN allow_photographer_portfolio BOOLEAN DEFAULT false,
ADD COLUMN editing_requested BOOLEAN DEFAULT false,
ADD COLUMN editing_fee NUMERIC;

-- Add session reference to portfolio photos
ALTER TABLE portfolio_photos
ADD COLUMN session_id UUID REFERENCES sessions(id) ON DELETE SET NULL;

CREATE INDEX idx_portfolio_photos_session ON portfolio_photos(session_id);

-- Add terms acceptance tracking to profiles
ALTER TABLE profiles
ADD COLUMN terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Create terms versions table for legal tracking
CREATE TABLE IF NOT EXISTS terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial terms version
INSERT INTO terms_versions (version, content, effective_date) VALUES 
('1.0', 'ISO FLASH Terms and Conditions

BY USING THIS SERVICE, YOU AGREE TO THE FOLLOWING TERMS:

1. LIABILITY WAIVER
ISO FLASH and its affiliates are NOT LIABLE for:
- Broken, damaged, lost, or stolen phones or equipment
- Misuse of images or videos by either party
- Any in-person incidents, disputes, or altercations
- Quality of photos/videos produced
- Loss of data or files
- Any physical injury or property damage

2. USER RESPONSIBILITIES
Users are solely responsible for:
- Their own equipment and personal property
- Backup of all photos and videos
- Proper insurance coverage for their equipment
- Their own safety during sessions
- Verifying the identity and credentials of other users
- All content they create or share

3. CONTENT RIGHTS AND USAGE
- Seekers retain all rights to photos/videos taken during sessions
- Photographers may only use session photos in their portfolio with explicit seeker permission
- Users grant ISO FLASH a license to use content for platform promotion
- Users must not share, sell, or distribute content without proper consent

4. PROHIBITED CONDUCT
Users may not:
- Use the platform for illegal activities
- Harass, threaten, or harm other users
- Misrepresent their identity or qualifications
- Infringe on intellectual property rights
- Use the platform for unauthorized commercial purposes

5. PAYMENT AND FEES
- All payment disputes are between users
- ISO FLASH is not responsible for payment failures or disputes
- Users are responsible for applicable taxes
- Editing fees and session fees are set by photographers

6. INDEMNIFICATION
Users agree to indemnify and hold harmless ISO FLASH from any claims, damages, or expenses arising from their use of the service.

7. NO WARRANTIES
The service is provided "AS IS" without warranties of any kind.

8. DISPUTE RESOLUTION
Any disputes shall be resolved through binding arbitration.

9. MODIFICATIONS
ISO FLASH reserves the right to modify these terms at any time.

By clicking "I Accept", you acknowledge that you have read, understood, and agree to be bound by these terms.', NOW());