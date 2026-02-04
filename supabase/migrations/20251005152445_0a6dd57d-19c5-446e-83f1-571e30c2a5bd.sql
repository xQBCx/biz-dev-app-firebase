-- Create enum types for connectors and sync
CREATE TYPE connector_type AS ENUM (
  'gmail', 'outlook', 'imap_smtp',
  'hubspot', 'salesforce', 'zoho', 'pipedrive', 'dynamics',
  'netsuite', 'odoo', 'sap', 'quickbooks',
  'wordpress', 'webflow', 'contentful', 'notion', 'gdrive', 'sharepoint',
  'mailchimp', 'klaviyo', 'zendesk', 'freshdesk'
);

CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'completed', 'failed', 'paused');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE migration_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- Email identities and linked accounts
CREATE TABLE email_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  connector_type connector_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  oauth_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  imap_settings JSONB,
  smtp_settings JSONB,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, email)
);

-- Messages (unified inbox)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identity_id UUID REFERENCES email_identities(id) ON DELETE SET NULL,
  thread_id TEXT,
  external_id TEXT,
  direction message_direction NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails JSONB NOT NULL DEFAULT '[]',
  cc_emails JSONB DEFAULT '[]',
  bcc_emails JSONB DEFAULT '[]',
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  labels JSONB DEFAULT '[]',
  folder TEXT,
  has_attachments BOOLEAN DEFAULT false,
  message_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Message attachments
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  storage_path TEXT,
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- External system connectors
CREATE TABLE connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_type connector_type NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  credentials_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_status sync_status DEFAULT 'pending',
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, connector_type, name)
);

-- Migration jobs
CREATE TABLE migration_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES connectors(id) ON DELETE SET NULL,
  source_system TEXT NOT NULL,
  migration_type TEXT NOT NULL, -- 'full', 'incremental', 'contacts_only', etc.
  status migration_status DEFAULT 'pending',
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  config JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Export jobs for portability
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'full', 'messages', 'contacts', 'crm', etc.
  format TEXT NOT NULL, -- 'json', 'parquet', 'mbox', 'vcard', 'ics'
  status sync_status DEFAULT 'pending',
  file_path TEXT,
  size_bytes BIGINT,
  config JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unified contacts (merged from all sources)
CREATE TABLE unified_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_connector_id UUID REFERENCES connectors(id) ON DELETE SET NULL,
  external_id TEXT,
  email TEXT,
  phone TEXT,
  name TEXT NOT NULL,
  company_name TEXT,
  title TEXT,
  avatar_url TEXT,
  properties JSONB DEFAULT '{}', -- flexible schema for different sources
  tags TEXT[] DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unified companies
CREATE TABLE unified_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_connector_id UUID REFERENCES connectors(id) ON DELETE SET NULL,
  external_id TEXT,
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  employee_count INTEGER,
  annual_revenue NUMERIC,
  properties JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unified deals/opportunities
CREATE TABLE unified_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_connector_id UUID REFERENCES connectors(id) ON DELETE SET NULL,
  external_id TEXT,
  contact_id UUID REFERENCES unified_contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES unified_companies(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  stage TEXT,
  probability INTEGER,
  expected_close_date DATE,
  properties JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sync logs for auditing
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES connectors(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status sync_status NOT NULL,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE email_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own email identities"
  ON email_identities FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view message attachments"
  ON message_attachments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM messages WHERE messages.id = message_attachments.message_id AND messages.user_id = auth.uid()));

CREATE POLICY "Users can manage their own connectors"
  ON connectors FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own migration jobs"
  ON migration_jobs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own export jobs"
  ON export_jobs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their unified contacts"
  ON unified_contacts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their unified companies"
  ON unified_companies FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their unified deals"
  ON unified_deals FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their sync logs"
  ON sync_logs FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_date ON messages(message_date DESC);
CREATE INDEX idx_messages_identity_id ON messages(identity_id);
CREATE INDEX idx_unified_contacts_user_id ON unified_contacts(user_id);
CREATE INDEX idx_unified_contacts_email ON unified_contacts(email);
CREATE INDEX idx_unified_companies_user_id ON unified_companies(user_id);
CREATE INDEX idx_unified_deals_user_id ON unified_deals(user_id);
CREATE INDEX idx_connectors_user_id ON connectors(user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_identities_updated_at BEFORE UPDATE ON email_identities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connectors_updated_at BEFORE UPDATE ON connectors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unified_contacts_updated_at BEFORE UPDATE ON unified_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unified_companies_updated_at BEFORE UPDATE ON unified_companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unified_deals_updated_at BEFORE UPDATE ON unified_deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();