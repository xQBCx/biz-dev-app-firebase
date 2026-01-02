-- XDK Chain: Xodiak Layer 1 Blockchain Schema

-- Enum types for chain state
CREATE TYPE xdk_tx_type AS ENUM ('transfer', 'stake', 'unstake', 'contract_call', 'asset_tokenization', 'genesis', 'reward');
CREATE TYPE xdk_tx_status AS ENUM ('pending', 'confirmed', 'failed');
CREATE TYPE xdk_account_type AS ENUM ('user', 'contract', 'validator', 'treasury');
CREATE TYPE xdk_validator_status AS ENUM ('active', 'jailed', 'inactive');
CREATE TYPE xdk_consensus_status AS ENUM ('proposing', 'voting', 'committed', 'finalized');

-- Validators table (must be created before blocks due to FK)
CREATE TABLE public.xodiak_validators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL UNIQUE,
  name TEXT,
  stake_amount NUMERIC(30, 18) NOT NULL DEFAULT 0,
  status xdk_validator_status NOT NULL DEFAULT 'inactive',
  uptime_percentage NUMERIC(5, 2) DEFAULT 100.00,
  blocks_produced BIGINT DEFAULT 0,
  rewards_earned NUMERIC(30, 18) DEFAULT 0,
  commission_rate NUMERIC(5, 2) DEFAULT 5.00,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now()
);

-- Blocks table - the core blockchain structure
CREATE TABLE public.xodiak_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number BIGINT NOT NULL UNIQUE,
  previous_hash TEXT NOT NULL,
  block_hash TEXT NOT NULL UNIQUE,
  merkle_root TEXT NOT NULL,
  state_root TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  validator_id UUID REFERENCES public.xodiak_validators(id),
  transaction_count INT NOT NULL DEFAULT 0,
  gas_used NUMERIC(30, 0) DEFAULT 0,
  gas_limit NUMERIC(30, 0) DEFAULT 30000000,
  difficulty NUMERIC(30, 0) DEFAULT 1,
  nonce BIGINT DEFAULT 0,
  extra_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts table - wallet and contract state
CREATE TABLE public.xodiak_accounts (
  address TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  balance NUMERIC(30, 18) NOT NULL DEFAULT 0,
  staked_amount NUMERIC(30, 18) NOT NULL DEFAULT 0,
  nonce BIGINT NOT NULL DEFAULT 0,
  account_type xdk_account_type NOT NULL DEFAULT 'user',
  code_hash TEXT, -- for contracts
  storage_root TEXT, -- for contracts
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions table - all chain transactions
CREATE TABLE public.xodiak_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT NOT NULL UNIQUE,
  block_id UUID REFERENCES public.xodiak_blocks(id),
  block_number BIGINT,
  tx_index INT,
  from_address TEXT NOT NULL REFERENCES public.xodiak_accounts(address),
  to_address TEXT REFERENCES public.xodiak_accounts(address),
  amount NUMERIC(30, 18) NOT NULL DEFAULT 0,
  tx_type xdk_tx_type NOT NULL,
  data JSONB DEFAULT '{}',
  signature TEXT NOT NULL,
  status xdk_tx_status NOT NULL DEFAULT 'pending',
  gas_price NUMERIC(30, 0) DEFAULT 1000000000,
  gas_limit NUMERIC(30, 0) DEFAULT 21000,
  gas_used NUMERIC(30, 0),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

-- Consensus rounds table - track block consensus
CREATE TABLE public.xodiak_consensus_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number BIGINT NOT NULL,
  proposer_id UUID REFERENCES public.xodiak_validators(id),
  proposed_block_hash TEXT,
  votes JSONB DEFAULT '[]',
  vote_count INT DEFAULT 0,
  total_stake_voted NUMERIC(30, 18) DEFAULT 0,
  status xdk_consensus_status NOT NULL DEFAULT 'proposing',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at TIMESTAMPTZ
);

-- Tokenized assets table - bridge to real-world assets
CREATE TABLE public.xodiak_tokenized_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INT NOT NULL DEFAULT 18,
  asset_type TEXT NOT NULL,
  underlying_asset_id TEXT,
  issuer_address TEXT NOT NULL REFERENCES public.xodiak_accounts(address),
  total_supply NUMERIC(30, 18) NOT NULL DEFAULT 0,
  circulating_supply NUMERIC(30, 18) NOT NULL DEFAULT 0,
  is_frozen BOOLEAN DEFAULT false,
  compliance_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chain state table - singleton for chain parameters
CREATE TABLE public.xodiak_chain_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id TEXT NOT NULL DEFAULT 'xdk-mainnet-1',
  chain_name TEXT NOT NULL DEFAULT 'XDK Chain',
  current_block_number BIGINT NOT NULL DEFAULT 0,
  total_supply NUMERIC(30, 18) NOT NULL DEFAULT 1000000000000000000000000000,
  circulating_supply NUMERIC(30, 18) NOT NULL DEFAULT 0,
  total_staked NUMERIC(30, 18) NOT NULL DEFAULT 0,
  total_validators INT NOT NULL DEFAULT 0,
  active_validators INT NOT NULL DEFAULT 0,
  total_transactions BIGINT NOT NULL DEFAULT 0,
  block_time_ms INT NOT NULL DEFAULT 5000,
  min_stake_amount NUMERIC(30, 18) NOT NULL DEFAULT 10000000000000000000000,
  genesis_timestamp TIMESTAMPTZ,
  last_block_timestamp TIMESTAMPTZ,
  parameters JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_xodiak_blocks_number ON public.xodiak_blocks(block_number DESC);
CREATE INDEX idx_xodiak_blocks_hash ON public.xodiak_blocks(block_hash);
CREATE INDEX idx_xodiak_blocks_timestamp ON public.xodiak_blocks(timestamp DESC);
CREATE INDEX idx_xodiak_transactions_hash ON public.xodiak_transactions(tx_hash);
CREATE INDEX idx_xodiak_transactions_block ON public.xodiak_transactions(block_id);
CREATE INDEX idx_xodiak_transactions_from ON public.xodiak_transactions(from_address);
CREATE INDEX idx_xodiak_transactions_to ON public.xodiak_transactions(to_address);
CREATE INDEX idx_xodiak_transactions_status ON public.xodiak_transactions(status);
CREATE INDEX idx_xodiak_transactions_pending ON public.xodiak_transactions(status) WHERE status = 'pending';
CREATE INDEX idx_xodiak_accounts_user ON public.xodiak_accounts(user_id);
CREATE INDEX idx_xodiak_accounts_type ON public.xodiak_accounts(account_type);
CREATE INDEX idx_xodiak_validators_status ON public.xodiak_validators(status);
CREATE INDEX idx_xodiak_validators_stake ON public.xodiak_validators(stake_amount DESC);

-- Enable RLS on all tables
ALTER TABLE public.xodiak_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xodiak_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xodiak_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xodiak_validators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xodiak_consensus_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xodiak_tokenized_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xodiak_chain_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Blocks are publicly readable
CREATE POLICY "Blocks are publicly readable" ON public.xodiak_blocks FOR SELECT USING (true);
CREATE POLICY "Only system can insert blocks" ON public.xodiak_blocks FOR INSERT WITH CHECK (false);

-- RLS Policies: Transactions publicly readable, users can create their own
CREATE POLICY "Transactions are publicly readable" ON public.xodiak_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can submit transactions" ON public.xodiak_transactions FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies: Accounts publicly readable, users manage their own
CREATE POLICY "Accounts are publicly readable" ON public.xodiak_accounts FOR SELECT USING (true);
CREATE POLICY "Users can create accounts" ON public.xodiak_accounts FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own accounts" ON public.xodiak_accounts FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS Policies: Validators publicly readable
CREATE POLICY "Validators are publicly readable" ON public.xodiak_validators FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register as validators" ON public.xodiak_validators FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Validators can update their own record" ON public.xodiak_validators FOR UPDATE 
  USING (user_id = auth.uid());

-- RLS Policies: Consensus rounds publicly readable
CREATE POLICY "Consensus rounds are publicly readable" ON public.xodiak_consensus_rounds FOR SELECT USING (true);

-- RLS Policies: Tokenized assets publicly readable
CREATE POLICY "Tokenized assets are publicly readable" ON public.xodiak_tokenized_assets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tokenized assets" ON public.xodiak_tokenized_assets FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies: Chain state publicly readable
CREATE POLICY "Chain state is publicly readable" ON public.xodiak_chain_state FOR SELECT USING (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.xodiak_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.xodiak_transactions;

-- Function to generate addresses
CREATE OR REPLACE FUNCTION public.generate_xdk_address()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_address TEXT;
  address_exists BOOLEAN;
BEGIN
  LOOP
    new_address := 'xdk1' || LOWER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 38));
    SELECT EXISTS(SELECT 1 FROM xodiak_accounts WHERE address = new_address) INTO address_exists;
    EXIT WHEN NOT address_exists;
  END LOOP;
  RETURN new_address;
END;
$$;

-- Function to generate transaction hash
CREATE OR REPLACE FUNCTION public.generate_xdk_tx_hash(
  p_from TEXT,
  p_to TEXT,
  p_amount NUMERIC,
  p_nonce BIGINT,
  p_data JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN '0x' || MD5(p_from || COALESCE(p_to, '') || p_amount::TEXT || p_nonce::TEXT || COALESCE(p_data::TEXT, '') || CLOCK_TIMESTAMP()::TEXT);
END;
$$;

-- Function to generate block hash  
CREATE OR REPLACE FUNCTION public.generate_xdk_block_hash(
  p_block_number BIGINT,
  p_previous_hash TEXT,
  p_merkle_root TEXT,
  p_timestamp TIMESTAMPTZ
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN '0x' || MD5(p_block_number::TEXT || p_previous_hash || p_merkle_root || p_timestamp::TEXT);
END;
$$;

-- Update trigger for accounts
CREATE TRIGGER update_xodiak_accounts_updated_at
  BEFORE UPDATE ON public.xodiak_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for tokenized assets
CREATE TRIGGER update_xodiak_tokenized_assets_updated_at
  BEFORE UPDATE ON public.xodiak_tokenized_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();