-- Phone numbers table
CREATE TABLE IF NOT EXISTS phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number TEXT NOT NULL,
  label TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  lindy_integration_id UUID REFERENCES lindy_integrations(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Call logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number_id UUID REFERENCES phone_numbers(id) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  caller_number TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  recording_url TEXT,
  transcription TEXT,
  call_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI receptionist configuration table
CREATE TABLE IF NOT EXISTS ai_receptionist_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  config_text TEXT NOT NULL,
  parsed_rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_receptionist_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for phone_numbers
CREATE POLICY "Users can manage their own phone numbers"
  ON phone_numbers
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for call_logs
CREATE POLICY "Users can view their own call logs"
  ON call_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create call logs"
  ON call_logs
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for ai_receptionist_config
CREATE POLICY "Users can manage their own receptionist config"
  ON ai_receptionist_config
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_phone_numbers_user_id ON phone_numbers(user_id);
CREATE INDEX idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX idx_call_logs_phone_number_id ON call_logs(phone_number_id);
CREATE INDEX idx_ai_receptionist_config_user_id ON ai_receptionist_config(user_id);

-- Create updated_at trigger for phone_numbers
CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for ai_receptionist_config
CREATE TRIGGER update_ai_receptionist_config_updated_at
  BEFORE UPDATE ON ai_receptionist_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();