-- Bills uploaded by companies for analysis
CREATE TABLE public.company_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  bill_name TEXT NOT NULL,
  bill_type TEXT NOT NULL,
  vendor_name TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  bill_date DATE,
  due_date DATE,
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  extracted_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI analyses of bills using multiple models
CREATE TABLE public.bill_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES public.company_bills(id) ON DELETE CASCADE,
  model_used TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  confidence_score NUMERIC(3,2),
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  cost_estimate NUMERIC(10,6),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Multi-model comparison results
CREATE TABLE public.bill_model_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_id UUID NOT NULL REFERENCES public.company_bills(id) ON DELETE CASCADE,
  models_used TEXT[] NOT NULL,
  comparison_result JSONB NOT NULL,
  best_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recommendations generated for users
CREATE TABLE public.bill_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bill_id UUID REFERENCES public.company_bills(id) ON DELETE SET NULL,
  service_offering_id UUID REFERENCES public.service_offerings(id) ON DELETE SET NULL,
  recommendation_type TEXT NOT NULL,
  current_cost NUMERIC(12,2),
  projected_cost NUMERIC(12,2),
  potential_savings NUMERIC(12,2),
  confidence_score NUMERIC(3,2),
  reasoning TEXT,
  action_steps JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Linked billing accounts for real-time optimization
CREATE TABLE public.linked_billing_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE SET NULL,
  provider_name TEXT NOT NULL,
  account_identifier TEXT NOT NULL,
  category TEXT NOT NULL,
  connection_status TEXT DEFAULT 'pending',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  credentials_encrypted JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI model usage tracking for arbitrage optimization
CREATE TABLE public.ai_model_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  requests_count INTEGER DEFAULT 1,
  total_cost NUMERIC(10,6),
  revenue_generated NUMERIC(10,2),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_model_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_billing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_model_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_bills
CREATE POLICY "Users can view their own bills" ON public.company_bills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bills" ON public.company_bills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bills" ON public.company_bills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bills" ON public.company_bills FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bill_analyses
CREATE POLICY "Users can view analyses of their bills" ON public.bill_analyses FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.company_bills WHERE id = bill_id AND user_id = auth.uid()));

-- RLS Policies for bill_model_comparisons
CREATE POLICY "Users can view comparisons of their bills" ON public.bill_model_comparisons FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.company_bills WHERE id = bill_id AND user_id = auth.uid()));

-- RLS Policies for bill_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.bill_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own recommendations" ON public.bill_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for linked_billing_accounts
CREATE POLICY "Users can view their own linked accounts" ON public.linked_billing_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own linked accounts" ON public.linked_billing_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own linked accounts" ON public.linked_billing_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own linked accounts" ON public.linked_billing_accounts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_model_usage
CREATE POLICY "Service role can manage model usage" ON public.ai_model_usage FOR ALL USING (true);

-- Create storage bucket for bills
INSERT INTO storage.buckets (id, name, public) VALUES ('bills', 'bills', false);

-- Storage policies for bills bucket
CREATE POLICY "Users can upload their own bills" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'bills' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own bills" ON storage.objects FOR SELECT 
  USING (bucket_id = 'bills' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own bills" ON storage.objects FOR DELETE 
  USING (bucket_id = 'bills' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_bills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_recommendations;

-- Indexes for performance
CREATE INDEX idx_company_bills_user_id ON public.company_bills(user_id);
CREATE INDEX idx_company_bills_status ON public.company_bills(status);
CREATE INDEX idx_bill_analyses_bill_id ON public.bill_analyses(bill_id);
CREATE INDEX idx_bill_recommendations_user_id ON public.bill_recommendations(user_id);
CREATE INDEX idx_ai_model_usage_date ON public.ai_model_usage(usage_date);

-- Update trigger for timestamps
CREATE TRIGGER update_company_bills_updated_at BEFORE UPDATE ON public.company_bills 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bill_recommendations_updated_at BEFORE UPDATE ON public.bill_recommendations 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_linked_billing_accounts_updated_at BEFORE UPDATE ON public.linked_billing_accounts 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();