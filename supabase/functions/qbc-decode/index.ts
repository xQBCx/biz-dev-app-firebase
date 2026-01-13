import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CharacterMap {
  [key: string]: [number, number];
}

// Generate SHA-256 hash
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Reverse the character map for decoding
function reverseCharacterMap(characterMap: CharacterMap): Map<string, string> {
  const reversed = new Map<string, string>();
  for (const [char, [from, to]] of Object.entries(characterMap)) {
    const key = `${from}-${to}`;
    reversed.set(key, char);
  }
  return reversed;
}

// Decode paths back to text
function decodeFromPaths(
  paths: { from: number; to: number; char?: string }[],
  reversedMap: Map<string, string>
): string {
  let decoded = '';
  
  for (const path of paths) {
    const key = `${path.from}-${path.to}`;
    const char = reversedMap.get(key);
    if (char) {
      decoded += char;
    } else {
      // Unknown path - use placeholder
      decoded += '?';
    }
  }
  
  return decoded;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { gio, sourceContext } = await req.json();

    if (!gio || !gio.paths || !Array.isArray(gio.paths)) {
      return new Response(JSON.stringify({ error: 'Valid GIO with paths is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get lattice configuration
    const latticeId = gio.latticeId;
    let lattice;
    
    if (latticeId) {
      const { data, error } = await supabase
        .from('qbc_lattices')
        .select('*')
        .eq('id', latticeId)
        .single();
      
      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Lattice not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      lattice = data;
    } else {
      // Use default lattice
      const { data, error } = await supabase
        .from('qbc_lattices')
        .select('*')
        .eq('is_default', true)
        .single();
      
      if (error || !data) {
        return new Response(JSON.stringify({ error: 'No default lattice found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      lattice = data;
    }

    const characterMap = lattice.character_map as CharacterMap;
    const reversedMap = reverseCharacterMap(characterMap);

    // Decode the paths
    const decodedText = decodeFromPaths(gio.paths, reversedMap);
    
    // Verify content hash if provided
    let verified = false;
    if (gio.contentHash) {
      const computedHash = await hashContent(decodedText);
      verified = computedHash === gio.contentHash;
    }

    // Generate decoded content hash
    const contentHash = await hashContent(decodedText);

    // Log the decoding operation
    await supabase.from('qbc_encoding_log').insert({
      user_id: user.id,
      lattice_id: lattice.id,
      content_hash: contentHash,
      gio_hash: gio.gioHash || null,
      encoding_type: decodedText.split(' ').length > 1 ? 'phrase' : 'word',
      operation: 'decode',
      source_context: sourceContext || 'qbc_studio',
      metadata: {
        verified,
        original_hash_provided: !!gio.contentHash,
        path_count: gio.paths.length,
      },
    });

    return new Response(JSON.stringify({
      text: decodedText,
      verified,
      contentHash,
      latticeId: lattice.id,
      latticeType: lattice.lattice_type,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('QBC Decode error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
