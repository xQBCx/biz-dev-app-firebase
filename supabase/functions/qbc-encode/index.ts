import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Vertex {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface LatticeConfig {
  vertices: Vertex[];
  edges: number[][];
}

interface CharacterMap {
  [key: string]: [number, number];
}

interface EncodingResult {
  gio: {
    paths: { from: number; to: number; char: string }[];
    vertices: Vertex[];
    contentHash: string;
    timestamp: string;
  };
  svg: string;
  contentHash: string;
}

// Generate SHA-256 hash
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Encode text using lattice geometry
function encodeWithLattice(
  text: string,
  vertices: Vertex[],
  characterMap: CharacterMap
): { paths: { from: number; to: number; char: string }[] } {
  const paths: { from: number; to: number; char: string }[] = [];
  const upperText = text.toUpperCase();

  for (const char of upperText) {
    const mapping = characterMap[char];
    if (mapping) {
      paths.push({
        from: mapping[0],
        to: mapping[1],
        char: char,
      });
    } else {
      // Unknown character - use center vertex self-loop
      paths.push({
        from: 6,
        to: 6,
        char: char,
      });
    }
  }

  return { paths };
}

// Generate SVG visualization of encoded paths
function generateSVG(vertices: Vertex[], paths: { from: number; to: number; char: string }[]): string {
  const width = 400;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 1.5;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`;
  
  // Background
  svg += `<rect width="${width}" height="${height}" fill="#0a0a0a"/>`;
  
  // Draw all vertices as circles
  for (const vertex of vertices) {
    const x = centerX + vertex.x * scale;
    const y = centerY + vertex.y * scale;
    svg += `<circle cx="${x}" cy="${y}" r="8" fill="#1a1a2e" stroke="#4a4a6a" stroke-width="1"/>`;
  }

  // Draw encoded paths with gradient colors
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'];
  
  paths.forEach((path, index) => {
    const fromVertex = vertices.find(v => v.id === path.from);
    const toVertex = vertices.find(v => v.id === path.to);
    
    if (fromVertex && toVertex) {
      const x1 = centerX + fromVertex.x * scale;
      const y1 = centerY + fromVertex.y * scale;
      const x2 = centerX + toVertex.x * scale;
      const y2 = centerY + toVertex.y * scale;
      const color = colors[index % colors.length];
      
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" opacity="0.8"/>`;
    }
  });

  // Highlight active vertices
  const activeVertices = new Set<number>();
  paths.forEach(p => {
    activeVertices.add(p.from);
    activeVertices.add(p.to);
  });

  for (const vertexId of activeVertices) {
    const vertex = vertices.find(v => v.id === vertexId);
    if (vertex) {
      const x = centerX + vertex.x * scale;
      const y = centerY + vertex.y * scale;
      svg += `<circle cx="${x}" cy="${y}" r="6" fill="#4ecdc4" opacity="0.9"/>`;
    }
  }

  svg += '</svg>';
  return svg;
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

    const { text, latticeId, sourceContext } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get lattice configuration
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
      // Use default Metatron's Cube lattice
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

    const vertices = lattice.vertex_config.vertices as Vertex[];
    const characterMap = lattice.character_map as CharacterMap;

    // Encode the text
    const { paths } = encodeWithLattice(text, vertices, characterMap);
    
    // Generate content hash
    const contentHash = await hashContent(text);
    
    // Generate GIO hash
    const gioString = JSON.stringify(paths);
    const gioHash = await hashContent(gioString);

    // Generate SVG
    const svg = generateSVG(vertices, paths);

    // Create GIO (Geometric Information Object)
    const gio = {
      paths,
      vertices,
      contentHash,
      gioHash,
      timestamp: new Date().toISOString(),
      latticeId: lattice.id,
      latticeType: lattice.lattice_type,
    };

    // Log the encoding operation
    await supabase.from('qbc_encoding_log').insert({
      user_id: user.id,
      lattice_id: lattice.id,
      content_hash: contentHash,
      gio_hash: gioHash,
      encoding_type: text.split(' ').length > 1 ? 'phrase' : 'word',
      operation: 'encode',
      source_context: sourceContext || 'qbc_studio',
      metadata: {
        text_length: text.length,
        path_count: paths.length,
      },
    });

    const result: EncodingResult = {
      gio,
      svg,
      contentHash,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('QBC Encode error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
