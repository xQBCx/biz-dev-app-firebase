import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateThemeRequest {
  name: string;
  source_type: 'uploaded_image' | 'uploaded_css' | 'library' | 'manual';
  library_version_id?: string;
  css_content?: string;
  image_url?: string;
  base_colors?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const {
      name,
      source_type,
      library_version_id,
      css_content,
      image_url,
      base_colors
    }: GenerateThemeRequest = await req.json();

    let tokens: Record<string, string> = {};
    let palette: Record<string, string> = {};
    let finalCss = '';

    // Generate based on source type
    switch (source_type) {
      case 'manual':
        // Use provided base colors to generate tokens
        palette = base_colors || {
          background: '#e0e0e0',
          foreground: '#4d4d4d',
          primary: '#2563eb',
          secondary: '#10b981',
          accent: '#f59e0b',
          muted: '#6b7280'
        };

        tokens = {
          '--color-bg': palette.background,
          '--color-fg': palette.foreground,
          '--color-primary': palette.primary,
          '--color-secondary': palette.secondary,
          '--color-accent': palette.accent,
          '--color-muted': palette.muted,
          '--radius-sm': '0.375rem',
          '--radius-md': '0.5rem',
          '--radius-lg': '0.75rem',
          '--spacing-sm': '0.5rem',
          '--spacing-md': '1rem',
          '--spacing-lg': '1.5rem'
        };

        finalCss = generateCSSFromTokens(tokens);
        break;

      case 'uploaded_css':
        // Parse and sanitize CSS
        if (!css_content) throw new Error('CSS content required');
        
        finalCss = sanitizeCSS(css_content);
        tokens = extractTokensFromCSS(finalCss);
        palette = extractColorsFromTokens(tokens);
        break;

      case 'library':
        // Fetch library version and generate theme from it
        if (!library_version_id) throw new Error('Library version ID required');
        
        const { data: libraryVersion } = await supabaseClient
          .from('library_versions')
          .select('*, libraries(*)')
          .eq('id', library_version_id)
          .single();

        if (!libraryVersion) throw new Error('Library version not found');

        // Generate default theme based on library metadata
        tokens = generateDefaultTokens();
        palette = generateDefaultPalette();
        finalCss = generateCSSFromTokens(tokens);
        break;

      case 'uploaded_image':
        // Extract colors from image using a color extraction algorithm
        // This would typically use an AI service or image processing library
        // For now, generate a default theme
        palette = generateDefaultPalette();
        tokens = generateDefaultTokens();
        finalCss = generateCSSFromTokens(tokens);
        break;
    }

    // Create theme record
    const { data: theme, error: themeError } = await supabaseClient
      .from('themes')
      .insert({
        user_id: user.id,
        name,
        source_type,
        library_version_id,
        tokens_json: tokens,
        palette_json: palette,
        css_content: finalCss
      })
      .select()
      .single();

    if (themeError) throw themeError;

    return new Response(
      JSON.stringify({
        success: true,
        theme
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-theme:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function sanitizeCSS(css: string): string {
  // Remove dangerous properties that could break layout
  const forbidden = [
    /position\s*:/gi,
    /display\s*:/gi,
    /grid[^-]/gi,
    /flex[^-]/gi,
    /width\s*:/gi,
    /height\s*:/gi,
    /overflow\s*:/gi,
    /@import/gi,
    /url\s*\(/gi
  ];

  let sanitized = css;
  for (const pattern of forbidden) {
    sanitized = sanitized.replace(pattern, '/* removed */');
  }

  return sanitized;
}

function extractTokensFromCSS(css: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const cssVarPattern = /--([\w-]+)\s*:\s*([^;]+);/g;
  
  let match;
  while ((match = cssVarPattern.exec(css)) !== null) {
    tokens[`--${match[1]}`] = match[2].trim();
  }

  return tokens;
}

function extractColorsFromTokens(tokens: Record<string, string>): Record<string, string> {
  const colors: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(tokens)) {
    if (key.includes('color') || value.match(/#[0-9a-f]{3,6}/i)) {
      const colorName = key.replace('--color-', '').replace('--', '');
      colors[colorName] = value;
    }
  }

  return colors;
}

function generateDefaultTokens(): Record<string, string> {
  return {
    '--color-bg': '#e0e0e0',
    '--color-fg': '#4d4d4d',
    '--color-primary': '#2563eb',
    '--color-secondary': '#10b981',
    '--color-accent': '#f59e0b',
    '--color-muted': '#6b7280',
    '--radius-sm': '0.375rem',
    '--radius-md': '0.5rem',
    '--radius-lg': '0.75rem',
    '--spacing-sm': '0.5rem',
    '--spacing-md': '1rem',
    '--spacing-lg': '1.5rem',
    '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
    '--shadow-md': '0 4px 6px rgba(0,0,0,0.1)',
    '--shadow-lg': '0 10px 15px rgba(0,0,0,0.1)'
  };
}

function generateDefaultPalette(): Record<string, string> {
  return {
    background: '#e0e0e0',
    foreground: '#4d4d4d',
    primary: '#2563eb',
    secondary: '#10b981',
    accent: '#f59e0b',
    muted: '#6b7280'
  };
}

function generateCSSFromTokens(tokens: Record<string, string>): string {
  let css = ':root {\n';
  for (const [key, value] of Object.entries(tokens)) {
    css += `  ${key}: ${value};\n`;
  }
  css += '}\n';
  return css;
}
