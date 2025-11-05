-- Add fields to crm_deals for recurring revenue and customer linking
ALTER TABLE crm_deals 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recurring_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS recurring_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS upfront_amount DECIMAL(12,2);

-- Create deal documents table
CREATE TABLE IF NOT EXISTS crm_deal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  client_id UUID,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Enable RLS on deal documents
ALTER TABLE crm_deal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal documents
CREATE POLICY "Users can view their own deal documents"
  ON crm_deal_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deal documents"
  ON crm_deal_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal documents"
  ON crm_deal_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal documents"
  ON crm_deal_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Create deal tasks table
CREATE TABLE IF NOT EXISTS crm_deal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  client_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on deal tasks
ALTER TABLE crm_deal_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal tasks
CREATE POLICY "Users can view their own deal tasks"
  ON crm_deal_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deal tasks"
  ON crm_deal_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deal tasks"
  ON crm_deal_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deal tasks"
  ON crm_deal_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Link activities to deals
ALTER TABLE crm_activities
ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_documents_deal_id ON crm_deal_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_tasks_deal_id ON crm_deal_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON crm_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON crm_deals(contact_id);