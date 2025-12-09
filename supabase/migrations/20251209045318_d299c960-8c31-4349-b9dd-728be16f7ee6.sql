
-- ERP Templates based on industry/strategy
CREATE TABLE public.erp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  strategy_type TEXT,
  description TEXT,
  folder_structure JSONB NOT NULL DEFAULT '{}',
  recommended_integrations TEXT[] DEFAULT '{}',
  recommended_workflows TEXT[] DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company ERP configurations
CREATE TABLE public.company_erp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.crm_companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  template_id UUID REFERENCES public.erp_templates(id),
  industry TEXT NOT NULL,
  strategy TEXT,
  folder_structure JSONB NOT NULL DEFAULT '{}',
  integrations JSONB DEFAULT '{}',
  workflows JSONB DEFAULT '{}',
  ai_assessment JSONB,
  status TEXT DEFAULT 'draft',
  last_evolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ERP Folders for navigation
CREATE TABLE public.erp_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_config_id UUID REFERENCES public.company_erp_configs(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.erp_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  folder_type TEXT,
  description TEXT,
  icon TEXT,
  color TEXT,
  metadata JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents stored in ERP
CREATE TABLE public.erp_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_config_id UUID REFERENCES public.company_erp_configs(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.erp_folders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT,
  ai_analysis JSONB,
  extracted_data JSONB,
  routing_recommendation JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ERP Evolution history
CREATE TABLE public.erp_evolution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  erp_config_id UUID REFERENCES public.company_erp_configs(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  change_description TEXT,
  previous_state JSONB,
  new_state JSONB,
  trigger_source TEXT,
  ai_reasoning TEXT,
  applied_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.erp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_erp_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_evolution_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view templates" ON public.erp_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON public.erp_templates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own ERP configs" ON public.company_erp_configs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ERP configs" ON public.company_erp_configs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ERP configs" ON public.company_erp_configs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ERP configs" ON public.company_erp_configs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view folders for own ERP" ON public.erp_folders FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.company_erp_configs WHERE id = erp_config_id AND user_id = auth.uid()));
CREATE POLICY "Users can manage folders for own ERP" ON public.erp_folders FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.company_erp_configs WHERE id = erp_config_id AND user_id = auth.uid()));

CREATE POLICY "Users can view own documents" ON public.erp_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents" ON public.erp_documents FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view evolution log for own ERP" ON public.erp_evolution_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.company_erp_configs WHERE id = erp_config_id AND user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_erp_templates_updated_at BEFORE UPDATE ON public.erp_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_erp_configs_updated_at BEFORE UPDATE ON public.company_erp_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_erp_documents_updated_at BEFORE UPDATE ON public.erp_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default industry templates
INSERT INTO public.erp_templates (name, industry, strategy_type, description, folder_structure, recommended_integrations, recommended_workflows, is_default) VALUES
('Technology Startup', 'technology', 'growth', 'ERP structure optimized for fast-growing tech startups', 
  '{"root": {"Engineering": {"Development": {}, "DevOps": {}, "Architecture": {}}, "Product": {"Roadmap": {}, "Research": {}, "Design": {}}, "Sales": {"Leads": {}, "Proposals": {}, "Contracts": {}}, "Marketing": {"Content": {}, "Campaigns": {}, "Analytics": {}}, "Operations": {"HR": {}, "Finance": {}, "Legal": {}}, "Customer Success": {"Onboarding": {}, "Support": {}, "Feedback": {}}}}',
  ARRAY['github', 'slack', 'jira', 'stripe'],
  ARRAY['lead_nurturing', 'customer_onboarding', 'bug_tracking'],
  true),
('Professional Services', 'consulting', 'client-focused', 'ERP for consulting and professional service firms',
  '{"root": {"Clients": {"Active": {}, "Prospects": {}, "Archive": {}}, "Projects": {"Current": {}, "Completed": {}, "Templates": {}}, "Deliverables": {"Reports": {}, "Presentations": {}, "Documents": {}}, "Business Development": {"Proposals": {}, "RFPs": {}, "Partnerships": {}}, "Knowledge Base": {"Methodologies": {}, "Best Practices": {}, "Training": {}}, "Operations": {"Finance": {}, "HR": {}, "Administration": {}}}}',
  ARRAY['google_workspace', 'zoom', 'quickbooks'],
  ARRAY['project_management', 'client_reporting', 'proposal_generation'],
  true),
('E-commerce', 'retail', 'omnichannel', 'ERP for online and omnichannel retail businesses',
  '{"root": {"Products": {"Catalog": {}, "Inventory": {}, "Pricing": {}}, "Orders": {"Processing": {}, "Fulfillment": {}, "Returns": {}}, "Customers": {"Profiles": {}, "Segments": {}, "Loyalty": {}}, "Marketing": {"Campaigns": {}, "Email": {}, "Social": {}}, "Suppliers": {"Vendors": {}, "Purchase Orders": {}, "Invoices": {}}, "Analytics": {"Sales": {}, "Traffic": {}, "Performance": {}}}}',
  ARRAY['shopify', 'stripe', 'mailchimp', 'google_analytics'],
  ARRAY['order_processing', 'inventory_alerts', 'customer_retention'],
  true),
('Construction', 'construction', 'project-based', 'ERP for construction and contracting companies',
  '{"root": {"Projects": {"Active": {}, "Bidding": {}, "Completed": {}}, "Estimates": {"Templates": {}, "Proposals": {}, "Approved": {}}, "Documents": {"Plans": {}, "Permits": {}, "Contracts": {}}, "Subcontractors": {"Directory": {}, "Agreements": {}, "Insurance": {}}, "Equipment": {"Inventory": {}, "Maintenance": {}, "Rentals": {}}, "Finance": {"Invoicing": {}, "Payroll": {}, "Job Costing": {}}, "Safety": {"Protocols": {}, "Incidents": {}, "Training": {}}}}',
  ARRAY['procore', 'quickbooks', 'buildertrend'],
  ARRAY['bid_management', 'project_tracking', 'safety_compliance'],
  true),
('Healthcare', 'healthcare', 'compliance', 'HIPAA-compliant ERP for healthcare organizations',
  '{"root": {"Patients": {"Records": {}, "Appointments": {}, "Billing": {}}, "Clinical": {"Protocols": {}, "Documentation": {}, "Lab Results": {}}, "Staff": {"Credentials": {}, "Scheduling": {}, "Training": {}}, "Compliance": {"HIPAA": {}, "Audits": {}, "Policies": {}}, "Operations": {"Inventory": {}, "Equipment": {}, "Facilities": {}}, "Finance": {"Revenue Cycle": {}, "Insurance": {}, "Reporting": {}}}}',
  ARRAY['epic', 'salesforce_health', 'docusign'],
  ARRAY['appointment_reminders', 'compliance_monitoring', 'claims_processing'],
  true);
