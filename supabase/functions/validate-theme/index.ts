import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationRequest {
  theme_id: string;
}

interface ValidationReport {
  accessibility: {
    passed: boolean;
    issues: string[];
    contrast_ratios: Record<string, number>;
  };
  layout: {
    passed: boolean;
    issues: string[];
    forbidden_properties: string[];
  };
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

    const { theme_id }: ValidationRequest = await req.json();

    // Fetch theme
    const { data: theme, error: themeError } = await supabaseClient
      .from('themes')
      .select('*')
      .eq('id', theme_id)
      .eq('user_id', user.id)
      .single();

    if (themeError) throw themeError;

    const report: ValidationReport = {
      accessibility: {
        passed: true,
        issues: [],
        contrast_ratios: {}
      },
      layout: {
        passed: true,
        issues: [],
        forbidden_properties: []
      }
    };

    // Validate CSS content
    if (theme.css_content) {
      const cssContent = theme.css_content.toLowerCase();
      
      // Check for forbidden properties that could break layout
      const forbiddenProps = [
        'position', 'display', 'grid', 'flex', 'width', 'height',
        'left', 'right', 'top', 'bottom', 'overflow'
      ];

      for (const prop of forbiddenProps) {
        const regex = new RegExp(`\\b${prop}\\s*:`, 'g');
        if (regex.test(cssContent)) {
          report.layout.passed = false;
          report.layout.forbidden_properties.push(prop);
          report.layout.issues.push(`Forbidden property '${prop}' found in CSS`);
        }
      }
    }

    // Validate color contrast from palette
    if (theme.palette_json) {
      const palette = theme.palette_json as Record<string, string>;
      const bg = palette.background || '#e0e0e0';
      const fg = palette.foreground || '#4d4d4d';

      // Simple contrast calculation (luminance-based)
      const getContrastRatio = (color1: string, color2: string): number => {
        const getLuminance = (color: string): number => {
          // Simple RGB extraction (assumes hex format)
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;
          
          const adjust = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          
          return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
        };

        const l1 = getLuminance(color1);
        const l2 = getLuminance(color2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
      };

      const contrastRatio = getContrastRatio(bg, fg);
      report.accessibility.contrast_ratios['background-foreground'] = contrastRatio;

      if (contrastRatio < 4.5) {
        report.accessibility.passed = false;
        report.accessibility.issues.push(
          `Insufficient contrast ratio ${contrastRatio.toFixed(2)}:1 (minimum 4.5:1 required)`
        );
      }
    }

    // Store validation result
    const { error: validationError } = await supabaseClient
      .from('theme_validations')
      .insert({
        theme_id: theme.id,
        passes_accessibility: report.accessibility.passed,
        passes_layout: report.layout.passed,
        report_json: report
      });

    if (validationError) throw validationError;

    return new Response(
      JSON.stringify({
        success: true,
        report,
        passes: report.accessibility.passed && report.layout.passed
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in validate-theme:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
