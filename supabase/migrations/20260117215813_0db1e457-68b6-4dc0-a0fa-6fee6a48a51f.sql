-- Add initiative_id column to crm_contacts and crm_companies for filtering
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS initiative_id UUID REFERENCES initiatives(id);
ALTER TABLE crm_companies ADD COLUMN IF NOT EXISTS initiative_id UUID REFERENCES initiatives(id);

-- Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_crm_contacts_initiative_id ON crm_contacts(initiative_id);
CREATE INDEX IF NOT EXISTS idx_crm_companies_initiative_id ON crm_companies(initiative_id);