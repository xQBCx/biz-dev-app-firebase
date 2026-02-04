import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SHA-256 hashing utility
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Build Merkle tree and return root + proofs
interface MerkleResult {
  root: string;
  proofs: { [eventId: string]: string[] };
  leaves: string[];
}

async function buildMerkleTree(eventHashes: { id: string; hash: string }[]): Promise<MerkleResult> {
  if (eventHashes.length === 0) {
    return { root: await sha256('empty'), proofs: {}, leaves: [] };
  }

  // Build leaf nodes (sorted for determinism)
  const sortedEvents = [...eventHashes].sort((a, b) => a.hash.localeCompare(b.hash));
  const leaves = sortedEvents.map(e => e.hash);
  const leafIndices = new Map(sortedEvents.map((e, i) => [e.id, i]));

  // Build tree levels
  const treeLevels: string[][] = [leaves];
  let currentLevel = leaves;

  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = currentLevel[i + 1] || left; // Duplicate last if odd
      nextLevel.push(await sha256(left + right));
    }
    treeLevels.push(nextLevel);
    currentLevel = nextLevel;
  }

  const root = currentLevel[0];

  // Generate Merkle proofs for each leaf
  const proofs: { [eventId: string]: string[] } = {};
  
  for (const event of sortedEvents) {
    const proof: string[] = [];
    let idx = leafIndices.get(event.id)!;
    
    for (let level = 0; level < treeLevels.length - 1; level++) {
      const levelNodes = treeLevels[level];
      const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      
      if (siblingIdx < levelNodes.length) {
        proof.push(levelNodes[siblingIdx]);
      } else if (idx < levelNodes.length) {
        proof.push(levelNodes[idx]); // Self-sibling for odd count
      }
      
      idx = Math.floor(idx / 2);
    }
    
    proofs[event.id] = proof;
  }

  return { root, proofs, leaves };
}

// Verify a Merkle proof
async function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string
): Promise<boolean> {
  let hash = leaf;
  for (const sibling of proof) {
    // Hash in sorted order for consistency
    if (hash < sibling) {
      hash = await sha256(hash + sibling);
    } else {
      hash = await sha256(sibling + hash);
    }
  }
  return hash === root;
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

    console.log(`XODIAK Anchor Process: ${req.method} ${action}`);

    // GET endpoints
    if (req.method === 'GET') {
      switch (action) {
        case 'status': {
          // Get anchor queue statistics
          const { data: pending } = await supabase
            .from('xodiak_anchor_queue')
            .select('id', { count: 'exact' })
            .eq('status', 'pending');

          const { data: anchored } = await supabase
            .from('xodiak_anchor_queue')
            .select('id', { count: 'exact' })
            .eq('status', 'anchored');

          const { data: recentBatches } = await supabase
            .from('xodiak_anchor_queue')
            .select('merkle_batch_id, merkle_root, anchored_at, xodiak_block_number, xodiak_tx_hash')
            .not('merkle_batch_id', 'is', null)
            .order('anchored_at', { ascending: false })
            .limit(10);

          // Get unique batches
          const batches = new Map();
          (recentBatches || []).forEach(r => {
            if (r.merkle_batch_id && !batches.has(r.merkle_batch_id)) {
              batches.set(r.merkle_batch_id, r);
            }
          });

          return new Response(JSON.stringify({
            pendingCount: pending?.length || 0,
            anchoredCount: anchored?.length || 0,
            recentBatches: Array.from(batches.values()),
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'batch': {
          const batchId = url.searchParams.get('id');
          if (!batchId) {
            return new Response(JSON.stringify({ error: 'Batch ID required' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const { data: events } = await supabase
            .from('xodiak_anchor_queue')
            .select('*, contribution_events(*)')
            .eq('merkle_batch_id', batchId);

          const firstEvent = events?.[0];
          return new Response(JSON.stringify({
            batchId,
            merkleRoot: firstEvent?.merkle_root,
            anchoredAt: firstEvent?.anchored_at,
            blockNumber: firstEvent?.xodiak_block_number,
            txHash: firstEvent?.xodiak_tx_hash,
            events,
            eventCount: events?.length || 0,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'verify': {
          const eventId = url.searchParams.get('eventId');
          if (!eventId) {
            return new Response(JSON.stringify({ error: 'Event ID required' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const { data: queueEntry } = await supabase
            .from('xodiak_anchor_queue')
            .select('*')
            .eq('contribution_event_id', eventId)
            .single();

          if (!queueEntry || !queueEntry.merkle_proof) {
            return new Response(JSON.stringify({ 
              verified: false, 
              error: 'Event not found or not yet anchored' 
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const isValid = await verifyMerkleProof(
            queueEntry.event_hash,
            queueEntry.merkle_proof,
            queueEntry.merkle_root
          );

          return new Response(JSON.stringify({
            verified: isValid,
            eventHash: queueEntry.event_hash,
            merkleRoot: queueEntry.merkle_root,
            proof: queueEntry.merkle_proof,
            blockNumber: queueEntry.xodiak_block_number,
            txHash: queueEntry.xodiak_tx_hash,
            anchoredAt: queueEntry.anchored_at,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    // POST endpoints
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const postAction = body.action || action;

      switch (postAction) {
        case 'process-queue':
        case 'anchor': {
          const batchSize = body.batchSize || 100;
          const autoAnchorOnly = body.autoAnchorOnly !== false;

          // Get pending events to anchor
          let query = supabase
            .from('xodiak_anchor_queue')
            .select('id, contribution_event_id, event_hash, combined_value, requires_approval')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(batchSize);

          if (autoAnchorOnly) {
            query = query.eq('requires_approval', false);
          }

          const { data: pendingEvents, error: fetchError } = await query;

          if (fetchError) throw fetchError;

          if (!pendingEvents || pendingEvents.length === 0) {
            return new Response(JSON.stringify({ 
              message: 'No pending events to anchor',
              processed: 0 
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          console.log(`Processing ${pendingEvents.length} events for anchoring`);

          // Build Merkle tree
          const eventData = pendingEvents.map(e => ({
            id: e.contribution_event_id,
            hash: e.event_hash,
          }));

          const merkleResult = await buildMerkleTree(eventData);
          const batchId = crypto.randomUUID();

          // Get chain state for block number
          const { data: chainState } = await supabase
            .from('xodiak_chain_state')
            .select('current_block_number')
            .single();

          const blockNumber = (chainState?.current_block_number || 0) + 1;

          // Create anchor transaction on XODIAK chain
          const anchorTxHash = await sha256(
            batchId + 
            merkleResult.root + 
            pendingEvents.length + 
            Date.now()
          );

          // Submit anchor transaction
          const { data: anchorTx, error: txError } = await supabase
            .from('xodiak_transactions')
            .insert({
              tx_hash: anchorTxHash,
              from_address: 'xdk1contribution000000000000000000000000000',
              to_address: null,
              amount: 0,
              tx_type: 'anchor',
              status: 'pending',
              data: {
                type: 'merkle_anchor',
                batch_id: batchId,
                merkle_root: merkleResult.root,
                event_count: pendingEvents.length,
                total_value: pendingEvents.reduce((sum, e) => sum + (e.combined_value || 0), 0),
              },
              gas_price: 1000000000,
              gas_limit: 50000,
            })
            .select()
            .single();

          if (txError) {
            console.error('Failed to create anchor transaction:', txError);
          }

          // Update all queue entries with Merkle proofs
          for (const event of pendingEvents) {
            const proof = merkleResult.proofs[event.contribution_event_id] || [];
            
            await supabase
              .from('xodiak_anchor_queue')
              .update({
                status: 'anchored',
                merkle_batch_id: batchId,
                merkle_root: merkleResult.root,
                merkle_proof: proof,
                xodiak_block_number: blockNumber,
                xodiak_tx_hash: anchorTxHash,
                anchored_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', event.id);
          }

          // Update contribution_events with anchor status
          const eventIds = pendingEvents.map(e => e.contribution_event_id);
          await supabase
            .from('contribution_events')
            .update({
              xodiak_anchor_status: 'anchored',
              xodiak_tx_hash: anchorTxHash,
              merkle_batch_id: batchId,
              anchored_at: new Date().toISOString(),
            })
            .in('id', eventIds);

          console.log(`Anchored ${pendingEvents.length} events with root: ${merkleResult.root}`);

          return new Response(JSON.stringify({
            success: true,
            batchId,
            merkleRoot: merkleResult.root,
            eventsAnchored: pendingEvents.length,
            blockNumber,
            txHash: anchorTxHash,
            leaves: merkleResult.leaves.length,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'approve': {
          // Approve events that require approval before anchoring
          const { eventIds } = body;
          
          if (!eventIds || !Array.isArray(eventIds)) {
            return new Response(JSON.stringify({ error: 'eventIds array required' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const { data, error } = await supabase
            .from('xodiak_anchor_queue')
            .update({
              requires_approval: false,
              approved_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .in('contribution_event_id', eventIds)
            .select();

          if (error) throw error;

          return new Response(JSON.stringify({
            success: true,
            approvedCount: data?.length || 0,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'reject': {
          // Reject events (remove from queue)
          const { eventIds, reason } = body;
          
          if (!eventIds || !Array.isArray(eventIds)) {
            return new Response(JSON.stringify({ error: 'eventIds array required' }), 
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const { error } = await supabase
            .from('xodiak_anchor_queue')
            .update({
              status: 'rejected',
              updated_at: new Date().toISOString(),
            })
            .in('contribution_event_id', eventIds);

          if (error) throw error;

          // Update contribution events
          await supabase
            .from('contribution_events')
            .update({
              xodiak_anchor_status: 'rejected',
            })
            .in('id', eventIds);

          return new Response(JSON.stringify({
            success: true,
            message: `Rejected ${eventIds.length} events`,
            reason,
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        default:
          return new Response(JSON.stringify({ error: 'Unknown action' }), 
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), 
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: unknown) {
    console.error('XODIAK Anchor Process error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
