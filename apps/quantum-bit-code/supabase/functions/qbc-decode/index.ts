import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-license-key',
};

interface PathEvent {
  type: 'move' | 'line' | 'tick';
  char: string;
  x: number;
  y: number;
  tickEndX?: number;
  tickEndY?: number;
}

interface EncodedPath {
  events: PathEvent[];
  visitedChars: string[];
  visitCounts: Record<string, number>;
}

interface DecodeRequest {
  path?: EncodedPath;
  binary?: string; // Base64 encoded binary format
  svg?: string; // SVG string to parse
  lattice_key?: string;
}

interface DecodeResult {
  text: string;
  confidence: number;
  path: EncodedPath;
  lattice_key: string;
  notes?: string;
}

// Decode from binary format
function decodeFromBinary(base64: string): EncodedPath {
  const binaryString = atob(base64);
  const buffer = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    buffer[i] = binaryString.charCodeAt(i);
  }
  
  let offset = 0;
  
  // Version check
  const version = buffer[offset++];
  if (version !== 1) {
    throw new Error(`Unsupported binary version: ${version}`);
  }
  
  // Event count
  const eventCount = (buffer[offset++] << 8) | buffer[offset++];
  
  const events: PathEvent[] = [];
  const visitedChars: string[] = [];
  const visitCounts: Record<string, number> = {};
  
  for (let i = 0; i < eventCount; i++) {
    const typeCode = buffer[offset++];
    const type = typeCode === 0 ? 'move' : typeCode === 1 ? 'line' : 'tick';
    
    const charCode = buffer[offset++];
    const char = charCode === 0 ? ' ' : String.fromCharCode(charCode + 64);
    
    const xInt = (buffer[offset++] << 8) | buffer[offset++];
    const x = xInt / 65535;
    
    const yInt = (buffer[offset++] << 8) | buffer[offset++];
    const y = yInt / 65535;
    
    const event: PathEvent = { type, char, x, y };
    
    if (type === 'tick') {
      const txInt = (buffer[offset++] << 8) | buffer[offset++];
      const tyInt = (buffer[offset++] << 8) | buffer[offset++];
      event.tickEndX = txInt / 65535;
      event.tickEndY = tyInt / 65535;
    }
    
    events.push(event);
    visitedChars.push(char);
    visitCounts[char] = (visitCounts[char] || 0) + 1;
  }
  
  return { events, visitedChars, visitCounts };
}

// Decode path back to text
function decodePathToText(path: EncodedPath): string {
  return path.visitedChars.join('');
}

// Calculate decode confidence based on path quality
function calculateConfidence(path: EncodedPath, anchors: Record<string, [number, number]>): number {
  let totalError = 0;
  let pointCount = 0;
  
  for (const event of path.events) {
    const expectedAnchor = anchors[event.char];
    if (expectedAnchor) {
      const [ex, ey] = expectedAnchor;
      const error = Math.sqrt(Math.pow(event.x - ex, 2) + Math.pow(event.y - ey, 2));
      totalError += error;
      pointCount++;
    }
  }
  
  if (pointCount === 0) return 0;
  
  const avgError = totalError / pointCount;
  // Convert error to confidence (0 error = 100%, 0.1 error = ~90%, etc.)
  const confidence = Math.max(0, Math.min(100, 100 * Math.exp(-avgError * 20)));
  
  return Math.round(confidence * 100) / 100;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check authentication
    const apiKey = req.headers.get('x-api-key');
    const licenseKey = req.headers.get('x-license-key');
    const authHeader = req.headers.get('authorization');
    
    let orgId: string | null = null;
    let userId: string | null = null;
    let allowedLatticeIds: string[] | null = null;
    
    if (licenseKey) {
      // Validate decoder license
      const { data: license, error: licenseError } = await supabase
        .from('decoder_licenses')
        .select('id, org_id, user_id, lattice_ids, permissions, revoked, expires_at')
        .eq('license_key', licenseKey)
        .eq('revoked', false)
        .maybeSingle();
      
      if (licenseError || !license) {
        return new Response(JSON.stringify({ error: 'Invalid license key' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check expiry
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'License expired' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check decode permission
      if (!license.permissions?.decode) {
        return new Response(JSON.stringify({ error: 'License lacks decode permission' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      orgId = license.org_id;
      userId = license.user_id;
      allowedLatticeIds = license.lattice_ids?.length > 0 ? license.lattice_ids : null;
      
      // Update usage
      await supabase
        .from('decoder_licenses')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', license.id);
        
    } else if (apiKey) {
      // Validate API key
      const keyPrefix = apiKey.substring(0, 8);
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('id, org_id, permissions, is_active')
        .eq('key_prefix', keyPrefix)
        .eq('is_active', true)
        .maybeSingle();
      
      if (keyError || !keyData) {
        return new Response(JSON.stringify({ error: 'Invalid API key' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!keyData.permissions?.decode) {
        return new Response(JSON.stringify({ error: 'API key lacks decode permission' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      orgId = keyData.org_id;
      
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyData.id);
        
    } else if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      userId = user.id;
      
      const { data: membership } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      
      orgId = membership?.org_id || null;
    }

    const body: DecodeRequest = await req.json();
    const { path: inputPath, binary, svg, lattice_key = 'G1' } = body;

    // Fetch lattice
    const { data: lattice, error: latticeError } = await supabase
      .from('lattices')
      .select('id, anchors_json, rules_json')
      .eq('lattice_key', lattice_key)
      .eq('is_active', true)
      .maybeSingle();

    if (latticeError || !lattice) {
      return new Response(JSON.stringify({ error: 'Lattice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check lattice access for license holders
    if (allowedLatticeIds && !allowedLatticeIds.includes(lattice.id)) {
      return new Response(JSON.stringify({ error: 'License does not grant access to this lattice' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anchors = lattice.anchors_json as Record<string, [number, number]>;
    
    // Get the path from input
    let path: EncodedPath;
    
    if (binary) {
      // Decode from binary format
      path = decodeFromBinary(binary);
    } else if (inputPath) {
      // Use provided path directly
      path = inputPath;
    } else if (svg) {
      // SVG parsing not implemented server-side for security
      return new Response(JSON.stringify({ 
        error: 'SVG parsing not supported via API. Please provide path or binary format.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: 'No input provided. Provide path, binary, or svg.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decode to text
    const text = decodePathToText(path);
    const confidence = calculateConfidence(path, anchors);
    
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

    // Log usage
    if (orgId) {
      await supabase.from('usage_events').insert({
        org_id: orgId,
        user_id: userId,
        event_type: 'decode',
        word_count: wordCount,
        glyph_count: 1,
        lattice_id: lattice.id,
        metadata: { lattice_key, confidence },
      });
    }

    const result: DecodeResult = {
      text,
      confidence,
      path,
      lattice_key,
      notes: confidence < 80 ? 'Low confidence decode - path may not match lattice exactly' : undefined,
    };

    // Log audit
    if (orgId) {
      await supabase.from('lattice_audit_log').insert({
        org_id: orgId,
        user_id: userId,
        lattice_id: lattice.id,
        action: 'decode',
        output_hash: await hashText(text),
        metadata: { confidence, word_count: wordCount },
      });
    }

    console.log(`Decoded glyph to "${text.substring(0, 50)}..." with ${confidence}% confidence`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Decode error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toUpperCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}
