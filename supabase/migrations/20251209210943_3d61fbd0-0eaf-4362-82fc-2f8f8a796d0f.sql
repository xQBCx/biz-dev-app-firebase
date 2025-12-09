-- Create service offerings table
CREATE TABLE public.service_offerings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  category TEXT NOT NULL,
  subcategory TEXT,
  name TEXT NOT NULL,
  description TEXT,
  pricing_model TEXT DEFAULT 'custom',
  base_price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_offerings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all active offerings"
ON public.service_offerings FOR SELECT
USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can create offerings"
ON public.service_offerings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own offerings"
ON public.service_offerings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own offerings"
ON public.service_offerings FOR DELETE
USING (auth.uid() = user_id);

-- Create default service offerings from the blockchain/AI catalog
INSERT INTO public.service_offerings (category, subcategory, name, description, is_active, is_featured) VALUES
-- Blockchain Development
('Blockchain', 'Development', 'Private Blockchain Development', 'Custom private blockchain solutions for enterprises', true, true),
('Blockchain', 'Development', 'Smart Contract Development', 'Solidity and other smart contract development', true, true),
('Blockchain', 'Development', 'Smart Contract Audits', 'Security audits for smart contracts', true, false),
('Blockchain', 'Development', 'Enterprise Blockchain Solutions', 'Scalable blockchain for enterprise needs', true, true),
('Blockchain', 'Development', 'IPFS Blockchain Development', 'Decentralized storage solutions', true, false),
('Blockchain', 'Development', 'Solana Blockchain Development', 'High-performance Solana development', true, false),
('Blockchain', 'Development', 'Blockchain Wallet Development', 'Custom crypto wallet solutions', true, false),
('Blockchain', 'Industry', 'Blockchain in Supply Chain', 'Supply chain transparency and tracking', true, true),
('Blockchain', 'Industry', 'Blockchain in Real Estate', 'Property tokenization and management', true, false),
('Blockchain', 'Industry', 'Blockchain in Healthcare', 'Healthcare data management on blockchain', true, false),
('Blockchain', 'Industry', 'Blockchain in Manufacturing', 'Manufacturing process tracking', true, false),
('Blockchain', 'Industry', 'Blockchain in Insurance', 'Insurance claims automation', true, false),
('Blockchain', 'Services', 'Security Token Offering Services', 'STO development and launch', true, true),
('Blockchain', 'Services', 'Blockchain Consulting Services', 'Strategic blockchain consulting', true, false),

-- AI Services
('AI', 'Development', 'AI Development Company', 'Custom AI solution development', true, true),
('AI', 'Development', 'Machine Learning Development', 'ML model development and training', true, true),
('AI', 'Development', 'Generative AI Development', 'GenAI applications and integrations', true, true),
('AI', 'Development', 'AI Chatbot Development', 'Custom chatbot solutions', true, false),
('AI', 'Development', 'Predictive Analytics', 'Data-driven predictive models', true, false),
('AI', 'Enterprise', 'Enterprise AI Development', 'Large-scale enterprise AI', true, true),
('AI', 'Enterprise', 'AI for Enterprises', 'Enterprise AI transformation', true, false),
('AI', 'Industry', 'AI in Ecommerce', 'E-commerce AI solutions', true, false),
('AI', 'Industry', 'AI in Supply Chain', 'Supply chain optimization AI', true, false),
('AI', 'Industry', 'AI in Real Estate', 'Real estate AI applications', true, false),
('AI', 'Industry', 'AI for Cyber Security', 'AI-powered security solutions', true, false),

-- Metaverse
('Metaverse', 'Development', 'Metaverse Development Services', 'Full metaverse development', true, true),
('Metaverse', 'Development', 'Metaverse Game Development', 'Games in metaverse environments', true, false),
('Metaverse', 'Development', 'Metaverse NFT Marketplace', 'NFT marketplaces for metaverse', true, false),
('Metaverse', 'Development', 'Metaverse Wallet Development', 'Wallets for metaverse assets', true, false),
('Metaverse', 'Enterprise', 'Enterprise Metaverse Services', 'Business solutions in metaverse', true, true),
('Metaverse', 'Enterprise', 'Metaverse Virtual Office', 'Virtual workspace development', true, false),
('Metaverse', 'Commerce', 'Metaverse Store Development', 'Virtual storefronts', true, false),
('Metaverse', 'Commerce', 'Metaverse Real Estate', 'Virtual real estate development', true, false),

-- NFT
('NFT', 'Marketplace', 'NFT Marketplace Development', 'Custom NFT marketplace platforms', true, true),
('NFT', 'Marketplace', 'White Label NFT Marketplace', 'Ready-to-launch NFT platforms', true, true),
('NFT', 'Development', 'NFT Token Development', 'Custom NFT creation and minting', true, false),
('NFT', 'Development', 'NFT Minting Platform', 'NFT minting infrastructure', true, false),
('NFT', 'Development', 'NFT Game Development', 'Gaming with NFT integration', true, false),
('NFT', 'Industry', 'Real Estate NFT Marketplace', 'Property NFT solutions', true, false),

-- Crypto Exchange
('Exchange', 'Development', 'Cryptocurrency Exchange Development', 'Full exchange platform development', true, true),
('Exchange', 'Development', 'Decentralized Exchange Development', 'DEX development services', true, true),
('Exchange', 'Development', 'P2P Cryptocurrency Exchange', 'Peer-to-peer exchange platforms', true, false),
('Exchange', 'Development', 'Cryptocurrency Trading Bot', 'Automated trading solutions', true, false),
('Exchange', 'Token', 'Crypto Token Development', 'Custom token creation', true, false),
('Exchange', 'Token', 'Stablecoin Development', 'Stable cryptocurrency development', true, false),

-- Web3
('Web3', 'Development', 'Web3 Development', 'Full Web3 application development', true, true),
('Web3', 'Development', 'Web3 Game Development', 'Gaming on Web3', true, false),
('Web3', 'Development', 'Web3 Smart Contract Auditing', 'Web3 security audits', true, false),
('Web3', 'Development', 'Web3 Wallet Development', 'Web3 wallet solutions', true, false),
('Web3', 'Industry', 'Web3 in Healthcare', 'Healthcare Web3 applications', true, false),
('Web3', 'Enterprise', 'Web3 for Enterprises', 'Enterprise Web3 solutions', true, true),

-- Games
('Games', 'Blockchain', 'Blockchain Game Development', 'Blockchain-integrated games', true, true),
('Games', 'Development', 'Unity 3D Game Development', 'Unity game development', true, false),
('Games', 'Development', 'Unreal Engine Game Development', 'Unreal Engine games', true, false),
('Games', 'Play to Earn', 'Play To Earn Game Development', 'P2E game development', true, true),
('Games', 'VR/AR', 'Virtual Reality Game Development', 'VR game development', true, false),

-- DApps
('DApp', 'Development', 'DApp Development Company', 'Decentralized app development', true, true),
('DApp', 'Development', 'Ethereum DApp Development', 'Ethereum-based DApps', true, false),
('DApp', 'Industry', 'DApp in ERP', 'ERP DApp solutions', true, false),
('DApp', 'Industry', 'DApp in Ecommerce', 'E-commerce DApps', true, false),
('DApp', 'Development', 'DAO Blockchain Development', 'DAO creation and management', true, true),

-- Mobile & Cloud
('Mobile', 'Development', 'Android App Development', 'Android application development', true, false),
('Mobile', 'Development', 'iOS App Development', 'iOS application development', true, false),
('Mobile', 'Development', 'Mobile App Development', 'Cross-platform mobile apps', true, true),
('Cloud', 'Services', 'Cloud Consulting', 'Cloud strategy and consulting', true, false),
('Cloud', 'Services', 'Cloud Migration Services', 'Cloud migration support', true, false),
('Cloud', 'Services', 'Cloud Based Software', 'Custom cloud software', true, false),

-- Cybersecurity
('Cybersecurity', 'Development', 'Cybersecurity Development', 'Security solution development', true, true),
('Cybersecurity', 'Services', 'Cybersecurity Consulting', 'Security audits and consulting', true, false),

-- VR/AR
('VR/AR', 'Development', 'VR Development', 'Virtual reality development', true, false),
('VR/AR', 'Development', 'AR Development', 'Augmented reality development', true, false);

-- Add updated_at trigger
CREATE TRIGGER update_service_offerings_updated_at
  BEFORE UPDATE ON public.service_offerings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add Research Studio integration table for ERP documents
CREATE TABLE public.erp_notebook_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  erp_document_id UUID REFERENCES public.erp_documents(id) ON DELETE CASCADE,
  notebook_id UUID REFERENCES public.notebooks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(erp_document_id, notebook_id)
);

ALTER TABLE public.erp_notebook_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their notebook links"
ON public.erp_notebook_links FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.erp_documents d
    JOIN public.company_erp_configs c ON d.erp_config_id = c.id
    WHERE d.id = erp_document_id AND c.user_id = auth.uid()
  )
);

-- Enable realtime for ERP evolution updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.erp_evolution_log;