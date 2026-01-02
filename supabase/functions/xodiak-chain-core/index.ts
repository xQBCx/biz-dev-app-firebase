import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chain configuration
const CHAIN_CONFIG = {
  chainId: 'xdk-mainnet-1',
  chainName: 'XDK Chain',
  blockTimeMs: 5000,
  gasLimit: 30000000,
  baseFeePerGas: 1000000000, // 1 gwei
  minStakeAmount: 10000, // 10,000 XDK
  blockReward: 2, // 2 XDK per block
  genesisSupply: 1000000000, // 1 billion XDK
};

// Utility functions for hashing
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateMerkleRoot(txHashes: string[]): Promise<string> {
  if (txHashes.length === 0) {
    return await sha256('empty');
  }
  
  let level = txHashes;
  while (level.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || left;
      nextLevel.push(await sha256(left + right));
    }
    level = nextLevel;
  }
  return level[0];
}

async function generateStateRoot(accounts: { address: string; balance: string; nonce: number }[]): Promise<string> {
  const stateData = accounts.map(a => `${a.address}:${a.balance}:${a.nonce}`).join('|');
  return await sha256(stateData);
}

function generateSignature(privateKey: string, data: string): string {
  // Simplified signature for demo - in production use proper ECDSA
  return '0x' + Array.from(new TextEncoder().encode(privateKey + data))
    .map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 130);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);
    const action = path[path.length - 1] || 'status';

    console.log(`XDK Chain Core: ${req.method} ${action}`);

    // GET endpoints
    if (req.method === 'GET') {
      switch (action) {
        case 'status':
        case 'chain-stats': {
          const { data: chainState } = await supabase
            .from('xodiak_chain_state')
            .select('*')
            .single();

          const { data: latestBlock } = await supabase
            .from('xodiak_blocks')
            .select('*')
            .order('block_number', { ascending: false })
            .limit(1)
            .single();

          const { count: pendingTxCount } = await supabase
            .from('xodiak_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

          return new Response(JSON.stringify({
            chain: chainState || CHAIN_CONFIG,
            latestBlock,
            pendingTransactions: pendingTxCount || 0,
            config: CHAIN_CONFIG,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'blocks': {
          const limit = parseInt(url.searchParams.get('limit') || '20');
          const offset = parseInt(url.searchParams.get('offset') || '0');
          
          const { data: blocks, count } = await supabase
            .from('xodiak_blocks')
            .select('*, xodiak_validators(name, address)', { count: 'exact' })
            .order('block_number', { ascending: false })
            .range(offset, offset + limit - 1);

          return new Response(JSON.stringify({ blocks, total: count }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'transactions': {
          const limit = parseInt(url.searchParams.get('limit') || '20');
          const status = url.searchParams.get('status');
          
          let query = supabase
            .from('xodiak_transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (status) query = query.eq('status', status);

          const { data: transactions } = await query;
          return new Response(JSON.stringify({ transactions }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'validators': {
          const { data: validators } = await supabase
            .from('xodiak_validators')
            .select('*')
            .order('stake_amount', { ascending: false });

          return new Response(JSON.stringify({ validators }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'accounts': {
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const { data: accounts } = await supabase
            .from('xodiak_accounts')
            .select('*')
            .order('balance', { ascending: false })
            .limit(limit);

          return new Response(JSON.stringify({ accounts }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'assets': {
          const { data: assets } = await supabase
            .from('xodiak_tokenized_assets')
            .select('*')
            .order('created_at', { ascending: false });

          return new Response(JSON.stringify({ assets }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        default: {
          // Check if it's a specific resource lookup
          const resourceType = path[path.length - 2];
          const resourceId = action;

          if (resourceType === 'block') {
            const { data: block } = await supabase
              .from('xodiak_blocks')
              .select('*, xodiak_validators(name, address)')
              .or(`block_number.eq.${resourceId},block_hash.eq.${resourceId}`)
              .single();

            if (block) {
              const { data: transactions } = await supabase
                .from('xodiak_transactions')
                .select('*')
                .eq('block_id', block.id);

              return new Response(JSON.stringify({ block, transactions }), 
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
          }

          if (resourceType === 'tx') {
            const { data: transaction } = await supabase
              .from('xodiak_transactions')
              .select('*, xodiak_blocks(block_number, block_hash)')
              .eq('tx_hash', resourceId)
              .single();

            return new Response(JSON.stringify({ transaction }), 
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          if (resourceType === 'account') {
            const { data: account } = await supabase
              .from('xodiak_accounts')
              .select('*')
              .eq('address', resourceId)
              .single();

            if (account) {
              const { data: transactions } = await supabase
                .from('xodiak_transactions')
                .select('*')
                .or(`from_address.eq.${resourceId},to_address.eq.${resourceId}`)
                .order('created_at', { ascending: false })
                .limit(50);

              return new Response(JSON.stringify({ account, transactions }), 
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
          }

          return new Response(JSON.stringify({ error: 'Not found' }), 
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    // POST endpoints
    if (req.method === 'POST') {
      const body = await req.json();

      switch (action) {
        case 'initialize-chain': {
          // Initialize chain state and genesis block
          const { data: existingState } = await supabase
            .from('xodiak_chain_state')
            .select('id')
            .single();

          if (existingState) {
            return new Response(JSON.stringify({ error: 'Chain already initialized' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Create chain state
          const { data: chainState, error: stateError } = await supabase
            .from('xodiak_chain_state')
            .insert({
              chain_id: CHAIN_CONFIG.chainId,
              chain_name: CHAIN_CONFIG.chainName,
              current_block_number: 0,
              total_supply: CHAIN_CONFIG.genesisSupply,
              circulating_supply: 0,
              total_staked: 0,
              total_validators: 0,
              active_validators: 0,
              total_transactions: 0,
              block_time_ms: CHAIN_CONFIG.blockTimeMs,
              min_stake_amount: CHAIN_CONFIG.minStakeAmount,
              genesis_timestamp: new Date().toISOString(),
              parameters: CHAIN_CONFIG,
            })
            .select()
            .single();

          if (stateError) throw stateError;

          // Create treasury account
          const treasuryAddress = 'xdk1treasury000000000000000000000000000000';
          const { error: treasuryError } = await supabase
            .from('xodiak_accounts')
            .insert({
              address: treasuryAddress,
              balance: CHAIN_CONFIG.genesisSupply,
              account_type: 'treasury',
              metadata: { name: 'XDK Treasury', description: 'Genesis treasury account' },
            });

          if (treasuryError) throw treasuryError;

          // Create genesis block
          const genesisHash = await sha256('genesis' + Date.now());
          const { data: genesisBlock, error: blockError } = await supabase
            .from('xodiak_blocks')
            .insert({
              block_number: 0,
              previous_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              block_hash: genesisHash,
              merkle_root: await sha256('genesis'),
              state_root: await sha256(treasuryAddress + ':' + CHAIN_CONFIG.genesisSupply + ':0'),
              transaction_count: 0,
              extra_data: { type: 'genesis', timestamp: new Date().toISOString() },
            })
            .select()
            .single();

          if (blockError) throw blockError;

          console.log('XDK Chain initialized with genesis block:', genesisHash);

          return new Response(JSON.stringify({
            success: true,
            chainState,
            genesisBlock,
            treasury: { address: treasuryAddress, balance: CHAIN_CONFIG.genesisSupply },
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'create-account': {
          const { userId, initialBalance = 0 } = body;

          // Generate unique address
          const { data: addressData } = await supabase.rpc('generate_xdk_address');
          const address = addressData || 'xdk1' + crypto.randomUUID().replace(/-/g, '').slice(0, 38);

          const { data: account, error } = await supabase
            .from('xodiak_accounts')
            .insert({
              address,
              user_id: userId,
              balance: initialBalance,
              account_type: 'user',
              metadata: { created_via: 'api' },
            })
            .select()
            .single();

          if (error) throw error;

          console.log('Created XDK account:', address);

          return new Response(JSON.stringify({ account }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'submit-transaction': {
          const { from, to, amount, txType = 'transfer', data: txData = {}, signature } = body;

          // Validate sender account
          const { data: fromAccount } = await supabase
            .from('xodiak_accounts')
            .select('*')
            .eq('address', from)
            .single();

          if (!fromAccount) {
            return new Response(JSON.stringify({ error: 'Sender account not found' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Check balance for transfers
          if (txType === 'transfer' && parseFloat(fromAccount.balance) < parseFloat(amount)) {
            return new Response(JSON.stringify({ error: 'Insufficient balance' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Generate transaction hash
          const txHash = await sha256(from + (to || '') + amount + fromAccount.nonce + Date.now());

          // Create transaction
          const { data: transaction, error } = await supabase
            .from('xodiak_transactions')
            .insert({
              tx_hash: txHash,
              from_address: from,
              to_address: to,
              amount,
              tx_type: txType,
              data: txData,
              signature: signature || generateSignature('demo', txHash),
              status: 'pending',
              gas_price: CHAIN_CONFIG.baseFeePerGas,
              gas_limit: txType === 'transfer' ? 21000 : 100000,
            })
            .select()
            .single();

          if (error) throw error;

          // Increment sender nonce
          await supabase
            .from('xodiak_accounts')
            .update({ nonce: fromAccount.nonce + 1 })
            .eq('address', from);

          console.log('Submitted transaction:', txHash);

          return new Response(JSON.stringify({ transaction }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'create-block': {
          // Get chain state
          const { data: chainState } = await supabase
            .from('xodiak_chain_state')
            .select('*')
            .single();

          if (!chainState) {
            return new Response(JSON.stringify({ error: 'Chain not initialized' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Get pending transactions
          const { data: pendingTxs } = await supabase
            .from('xodiak_transactions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(100);

          if (!pendingTxs || pendingTxs.length === 0) {
            return new Response(JSON.stringify({ message: 'No pending transactions' }), 
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Get previous block
          const { data: prevBlock } = await supabase
            .from('xodiak_blocks')
            .select('block_hash')
            .eq('block_number', chainState.current_block_number)
            .single();

          const previousHash = prevBlock?.block_hash || '0x0';
          const newBlockNumber = chainState.current_block_number + 1;

          // Process transactions and update state
          let totalGasUsed = 0;
          const confirmedTxHashes: string[] = [];

          for (const tx of pendingTxs) {
            try {
              // Execute state transition
              if (tx.tx_type === 'transfer' && tx.to_address) {
                // Deduct from sender
                await supabase
                  .from('xodiak_accounts')
                  .update({ balance: supabase.rpc('') }) // Use raw SQL for numeric operations
                  .eq('address', tx.from_address);

                // For now, use direct update
                const { data: sender } = await supabase
                  .from('xodiak_accounts')
                  .select('balance')
                  .eq('address', tx.from_address)
                  .single();

                if (sender) {
                  const newSenderBalance = parseFloat(sender.balance) - parseFloat(tx.amount);
                  await supabase
                    .from('xodiak_accounts')
                    .update({ balance: newSenderBalance })
                    .eq('address', tx.from_address);
                }

                // Credit receiver (create if not exists)
                const { data: receiver } = await supabase
                  .from('xodiak_accounts')
                  .select('balance')
                  .eq('address', tx.to_address)
                  .single();

                if (receiver) {
                  const newReceiverBalance = parseFloat(receiver.balance) + parseFloat(tx.amount);
                  await supabase
                    .from('xodiak_accounts')
                    .update({ balance: newReceiverBalance })
                    .eq('address', tx.to_address);
                } else {
                  await supabase
                    .from('xodiak_accounts')
                    .insert({
                      address: tx.to_address,
                      balance: parseFloat(tx.amount),
                      account_type: 'user',
                    });
                }
              }

              confirmedTxHashes.push(tx.tx_hash);
              totalGasUsed += parseInt(tx.gas_limit) || 21000;
            } catch (txError) {
              console.error('Transaction failed:', tx.tx_hash, txError);
              await supabase
                .from('xodiak_transactions')
                .update({ status: 'failed', error_message: String(txError) })
                .eq('id', tx.id);
            }
          }

          // Calculate merkle root
          const merkleRoot = await generateMerkleRoot(confirmedTxHashes);

          // Get updated accounts for state root
          const { data: accounts } = await supabase
            .from('xodiak_accounts')
            .select('address, balance, nonce')
            .order('address')
            .limit(1000);

          const stateRoot = await generateStateRoot(
            (accounts || []).map(a => ({ 
              address: a.address, 
              balance: String(a.balance), 
              nonce: a.nonce 
            }))
          );

          // Create block hash
          const timestamp = new Date().toISOString();
          const blockHash = await sha256(
            newBlockNumber + previousHash + merkleRoot + stateRoot + timestamp
          );

          // Insert new block
          const { data: newBlock, error: blockError } = await supabase
            .from('xodiak_blocks')
            .insert({
              block_number: newBlockNumber,
              previous_hash: previousHash,
              block_hash: blockHash,
              merkle_root: merkleRoot,
              state_root: stateRoot,
              transaction_count: confirmedTxHashes.length,
              gas_used: totalGasUsed,
              gas_limit: CHAIN_CONFIG.gasLimit,
              timestamp,
            })
            .select()
            .single();

          if (blockError) throw blockError;

          // Update confirmed transactions
          for (let i = 0; i < confirmedTxHashes.length; i++) {
            await supabase
              .from('xodiak_transactions')
              .update({
                block_id: newBlock.id,
                block_number: newBlockNumber,
                tx_index: i,
                status: 'confirmed',
                gas_used: 21000,
                confirmed_at: timestamp,
              })
              .eq('tx_hash', confirmedTxHashes[i]);
          }

          // Update chain state
          await supabase
            .from('xodiak_chain_state')
            .update({
              current_block_number: newBlockNumber,
              total_transactions: chainState.total_transactions + confirmedTxHashes.length,
              last_block_timestamp: timestamp,
            })
            .eq('id', chainState.id);

          console.log('Created block:', newBlockNumber, 'with', confirmedTxHashes.length, 'transactions');

          return new Response(JSON.stringify({
            block: newBlock,
            transactionsProcessed: confirmedTxHashes.length,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'register-validator': {
          const { address, name, stakeAmount, userId } = body;

          // Verify minimum stake
          if (parseFloat(stakeAmount) < CHAIN_CONFIG.minStakeAmount) {
            return new Response(JSON.stringify({ 
              error: `Minimum stake is ${CHAIN_CONFIG.minStakeAmount} XDK` 
            }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Check account balance
          const { data: account } = await supabase
            .from('xodiak_accounts')
            .select('balance')
            .eq('address', address)
            .single();

          if (!account || parseFloat(account.balance) < parseFloat(stakeAmount)) {
            return new Response(JSON.stringify({ error: 'Insufficient balance for stake' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Create validator
          const { data: validator, error } = await supabase
            .from('xodiak_validators')
            .insert({
              address,
              name: name || `Validator ${address.slice(0, 8)}`,
              stake_amount: stakeAmount,
              status: 'active',
              user_id: userId,
            })
            .select()
            .single();

          if (error) throw error;

          // Update account staked amount
          await supabase
            .from('xodiak_accounts')
            .update({
              balance: parseFloat(account.balance) - parseFloat(stakeAmount),
              staked_amount: parseFloat(stakeAmount),
            })
            .eq('address', address);

          // Update chain state
          const { data: chainState } = await supabase
            .from('xodiak_chain_state')
            .select('*')
            .single();

          if (chainState) {
            await supabase
              .from('xodiak_chain_state')
              .update({
                total_validators: chainState.total_validators + 1,
                active_validators: chainState.active_validators + 1,
                total_staked: parseFloat(chainState.total_staked) + parseFloat(stakeAmount),
              })
              .eq('id', chainState.id);
          }

          console.log('Registered validator:', address, 'with stake:', stakeAmount);

          return new Response(JSON.stringify({ validator }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'tokenize-asset': {
          const { name, symbol, assetType, totalSupply, issuerAddress, underlyingAssetId, complianceMetadata } = body;

          // Generate token address
          const tokenAddress = 'xdk1token' + crypto.randomUUID().replace(/-/g, '').slice(0, 32);

          const { data: asset, error } = await supabase
            .from('xodiak_tokenized_assets')
            .insert({
              token_address: tokenAddress,
              name,
              symbol,
              asset_type: assetType,
              total_supply: totalSupply,
              circulating_supply: 0,
              issuer_address: issuerAddress,
              underlying_asset_id: underlyingAssetId,
              compliance_metadata: complianceMetadata || {},
            })
            .select()
            .single();

          if (error) throw error;

          console.log('Tokenized asset:', tokenAddress, symbol);

          return new Response(JSON.stringify({ asset }), 
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'faucet': {
          // Development faucet to distribute test tokens
          const { address, amount = 1000 } = body;

          // Get treasury
          const { data: treasury } = await supabase
            .from('xodiak_accounts')
            .select('*')
            .eq('account_type', 'treasury')
            .single();

          if (!treasury) {
            return new Response(JSON.stringify({ error: 'Treasury not found. Initialize chain first.' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          // Check/create recipient account
          let { data: recipient } = await supabase
            .from('xodiak_accounts')
            .select('*')
            .eq('address', address)
            .single();

          if (!recipient) {
            const { data: newAccount } = await supabase
              .from('xodiak_accounts')
              .insert({
                address,
                balance: 0,
                account_type: 'user',
              })
              .select()
              .single();
            recipient = newAccount;
          }

          // Transfer from treasury
          const txHash = await sha256('faucet' + address + amount + Date.now());

          await supabase
            .from('xodiak_accounts')
            .update({ balance: parseFloat(treasury.balance) - amount })
            .eq('address', treasury.address);

          await supabase
            .from('xodiak_accounts')
            .update({ balance: parseFloat(recipient?.balance || 0) + amount })
            .eq('address', address);

          // Record transaction
          await supabase
            .from('xodiak_transactions')
            .insert({
              tx_hash: txHash,
              from_address: treasury.address,
              to_address: address,
              amount,
              tx_type: 'transfer',
              data: { source: 'faucet' },
              signature: generateSignature('faucet', txHash),
              status: 'confirmed',
              confirmed_at: new Date().toISOString(),
            });

          // Update circulating supply
          const { data: chainState } = await supabase
            .from('xodiak_chain_state')
            .select('*')
            .single();

          if (chainState) {
            await supabase
              .from('xodiak_chain_state')
              .update({
                circulating_supply: parseFloat(chainState.circulating_supply) + amount,
                total_transactions: chainState.total_transactions + 1,
              })
              .eq('id', chainState.id);
          }

          console.log('Faucet: sent', amount, 'XDK to', address);

          return new Response(JSON.stringify({
            success: true,
            txHash,
            amount,
            recipient: address,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        default:
          return new Response(JSON.stringify({ error: 'Unknown action' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('XDK Chain Core error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
