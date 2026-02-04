import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-license-key',
};

interface EncodeRequest {
  text: string;
  lattice_key?: string;
  format?: 'svg' | 'json' | 'binary';
  options?: {
    style?: Record<string, unknown>;
    orientation?: Record<string, unknown>;
  };
}

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

// QBC Encoder Logic (server-side implementation)
function encodeText(
  text: string, 
  anchors: Record<string, [number, number]>,
  rules: { enableTick: boolean; tickLengthFactor: number; insideBoundaryPreference: boolean; nodeSpacing: number }
): EncodedPath {
  const normalizedText = text.toUpperCase().replace(/[^A-Z ]/g, '');
  const events: PathEvent[] = [];
  const visitedChars: string[] = [];
  const visitCounts: Record<string, number> = {};

  if (normalizedText.length === 0) {
    return { events, visitedChars, visitCounts };
  }

  let lastX = 0;
  let lastY = 0;
  let isFirstChar = true;

  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    const anchor = anchors[char];
    
    if (!anchor) continue;
    
    const [x, y] = anchor;
    visitCounts[char] = (visitCounts[char] || 0) + 1;
    
    if (isFirstChar) {
      events.push({ type: 'move', char, x, y });
      visitedChars.push(char);
      lastX = x;
      lastY = y;
      isFirstChar = false;
    } else {
      // Check if we need a restart tick (revisiting a character)
      const isRevisit = visitCounts[char] > 1;
      
      if (isRevisit && rules.enableTick) {
        // Calculate tick direction (perpendicular to incoming line)
        const dx = x - lastX;
        const dy = y - lastY;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        if (len > 0) {
          const perpX = -dy / len;
          const perpY = dx / len;
          const tickLen = rules.tickLengthFactor;
          
          // Determine tick direction based on boundary preference
          const tickDir = rules.insideBoundaryPreference ? 1 : -1;
          const tickEndX = x + perpX * tickLen * tickDir;
          const tickEndY = y + perpY * tickLen * tickDir;
          
          events.push({ type: 'tick', char, x, y, tickEndX, tickEndY });
        } else {
          events.push({ type: 'line', char, x, y });
        }
      } else {
        events.push({ type: 'line', char, x, y });
      }
      
      visitedChars.push(char);
      lastX = x;
      lastY = y;
    }
  }

  return { events, visitedChars, visitCounts };
}

// Generate SVG from path
function generateSVG(
  path: EncodedPath, 
  anchors: Record<string, [number, number]>,
  style: {
    strokeWidth: number;
    strokeColor: string;
    nodeSize: number;
    nodeColor: string;
    nodeFillColor: string;
    showNodes: boolean;
    backgroundColor: string;
  },
  size: number = 200
): string {
  const margin = 20;
  const innerSize = size - 2 * margin;
  
  const scale = (val: number) => margin + val * innerSize;
  
  let pathD = '';
  for (const event of path.events) {
    const x = scale(event.x);
    const y = scale(event.y);
    
    if (event.type === 'move') {
      pathD += `M ${x} ${y} `;
    } else if (event.type === 'line') {
      pathD += `L ${x} ${y} `;
    } else if (event.type === 'tick' && event.tickEndX !== undefined && event.tickEndY !== undefined) {
      pathD += `L ${x} ${y} `;
      const tickX = scale(event.tickEndX);
      const tickY = scale(event.tickEndY);
      pathD += `M ${tickX} ${tickY} `;
    }
  }

  let nodesMarkup = '';
  if (style.showNodes) {
    const visitedSet = new Set(path.visitedChars);
    for (const char of visitedSet) {
      const anchor = anchors[char];
      if (anchor) {
        const [ax, ay] = anchor;
        const x = scale(ax);
        const y = scale(ay);
        nodesMarkup += `<circle cx="${x}" cy="${y}" r="${style.nodeSize / 2}" fill="${style.nodeFillColor}" stroke="${style.nodeColor}" stroke-width="1"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="${style.backgroundColor}"/>
  <path d="${pathD.trim()}" fill="none" stroke="${style.strokeColor}" stroke-width="${style.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  ${nodesMarkup}
</svg>`;
}

// Binary format for efficient transmission
function encodeToBinary(path: EncodedPath): Uint8Array {
  // Format: [version:1][eventCount:2][events...]
  // Each event: [type:1][charCode:1][x:2][y:2] = 6 bytes
  // Tick events: [type:1][charCode:1][x:2][y:2][tickEndX:2][tickEndY:2] = 10 bytes
  
  const events = path.events;
  let totalBytes = 3; // header
  for (const event of events) {
    totalBytes += event.type === 'tick' ? 10 : 6;
  }
  
  const buffer = new Uint8Array(totalBytes);
  let offset = 0;
  
  // Version
  buffer[offset++] = 1;
  
  // Event count (16-bit)
  buffer[offset++] = (events.length >> 8) & 0xFF;
  buffer[offset++] = events.length & 0xFF;
  
  for (const event of events) {
    // Event type: 0=move, 1=line, 2=tick
    const typeCode = event.type === 'move' ? 0 : event.type === 'line' ? 1 : 2;
    buffer[offset++] = typeCode;
    
    // Character code
    buffer[offset++] = event.char === ' ' ? 0 : event.char.charCodeAt(0) - 64;
    
    // X coordinate (16-bit, 0-65535 mapped to 0-1)
    const xInt = Math.round(event.x * 65535);
    buffer[offset++] = (xInt >> 8) & 0xFF;
    buffer[offset++] = xInt & 0xFF;
    
    // Y coordinate
    const yInt = Math.round(event.y * 65535);
    buffer[offset++] = (yInt >> 8) & 0xFF;
    buffer[offset++] = yInt & 0xFF;
    
    // Tick endpoint if applicable
    if (event.type === 'tick' && event.tickEndX !== undefined && event.tickEndY !== undefined) {
      const txInt = Math.round(event.tickEndX * 65535);
      buffer[offset++] = (txInt >> 8) & 0xFF;
      buffer[offset++] = txInt & 0xFF;
      
      const tyInt = Math.round(event.tickEndY * 65535);
      buffer[offset++] = (tyInt >> 8) & 0xFF;
      buffer[offset++] = tyInt & 0xFF;
    }
  }
  
  return buffer;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check authentication (API key or JWT)
    const apiKey = req.headers.get('x-api-key');
    const licenseKey = req.headers.get('x-license-key');
    const authHeader = req.headers.get('authorization');
    
    let orgId: string | null = null;
    let userId: string | null = null;
    
    if (apiKey) {
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
      
      // Check encode permission
      if (!keyData.permissions?.encode) {
        return new Response(JSON.stringify({ error: 'API key lacks encode permission' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      orgId = keyData.org_id;
      
      // Update last used
      await supabase
        .from('api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', keyData.id);
        
    } else if (authHeader) {
      // JWT auth - for direct user access
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      userId = user.id;
      
      // Get user's org (first one for now)
      const { data: membership } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
      
      orgId = membership?.org_id || null;
    }

    const body: EncodeRequest = await req.json();
    const { text, lattice_key = 'G1', format = 'json', options = {} } = body;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch lattice
    const { data: lattice, error: latticeError } = await supabase
      .from('lattices')
      .select('id, anchors_json, rules_json, style_json')
      .eq('lattice_key', lattice_key)
      .eq('is_active', true)
      .maybeSingle();

    if (latticeError || !lattice) {
      return new Response(JSON.stringify({ error: 'Lattice not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Normalize rules
    const rawRules = lattice.rules_json as Record<string, unknown>;
    const rules = {
      enableTick: (rawRules.enableTick ?? rawRules.enableRestartNotch ?? true) as boolean,
      tickLengthFactor: (rawRules.tickLengthFactor ?? rawRules.notchLengthFactor ?? 0.08) as number,
      insideBoundaryPreference: (rawRules.insideBoundaryPreference ?? rawRules.insideSquarePreference ?? true) as boolean,
      nodeSpacing: (rawRules.nodeSpacing ?? 0.2) as number,
    };

    const anchors = lattice.anchors_json as Record<string, [number, number]>;
    
    // Encode the text
    const path = encodeText(text, anchors, rules);
    
    // Count words and glyphs for usage tracking
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const glyphCount = 1; // Each encode call = 1 glyph

    // Log usage if org exists
    if (orgId) {
      await supabase.from('usage_events').insert({
        org_id: orgId,
        user_id: userId,
        event_type: 'encode',
        word_count: wordCount,
        glyph_count: glyphCount,
        byte_count: text.length,
        lattice_id: lattice.id,
        metadata: { format, lattice_key },
      });
    }

    // Build response based on format
    let responseData: unknown;
    
    if (format === 'svg') {
      const defaultStyle = {
        strokeWidth: 2,
        strokeColor: '#000000',
        nodeSize: 6,
        nodeColor: '#000000',
        nodeFillColor: '#ffffff',
        showNodes: true,
        backgroundColor: '#ffffff',
        ...options.style,
      };
      
      const svg = generateSVG(path, anchors, defaultStyle);
      responseData = { svg, path, text, lattice_key };
      
    } else if (format === 'binary') {
      const binary = encodeToBinary(path);
      const base64 = btoa(String.fromCharCode(...binary));
      responseData = { binary: base64, path, text, lattice_key };
      
    } else {
      // JSON format (default)
      responseData = {
        path,
        text,
        lattice_key,
        lattice_id: lattice.id,
        metadata: {
          wordCount,
          charCount: path.visitedChars.length,
          uniqueChars: new Set(path.visitedChars).size,
        },
      };
    }

    // Log audit event
    if (orgId) {
      await supabase.from('lattice_audit_log').insert({
        org_id: orgId,
        user_id: userId,
        lattice_id: lattice.id,
        action: 'encode',
        input_hash: await hashText(text),
        metadata: { format, word_count: wordCount },
      });
    }

    console.log(`Encoded "${text.substring(0, 50)}..." to ${format} format`);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Encode error:', error);
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
