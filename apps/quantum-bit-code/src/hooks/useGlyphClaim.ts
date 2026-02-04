import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { generateContentHash, canonicalizeText } from '@/lib/qbc/hash';
import { EncodedPath, GlyphOrientation, GlyphStyle, LatticeRules } from '@/lib/qbc/types';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface ClaimResult {
  success: boolean;
  claimId?: string;
  error?: string;
  alreadyClaimed?: boolean;
  existingClaimId?: string;
}

export function useGlyphClaim() {
  const [claiming, setClaiming] = useState(false);

  const checkExistingClaim = async (contentHash: string): Promise<{ exists: boolean; claimId?: string }> => {
    const { data, error } = await supabase
      .from('glyph_claims')
      .select('id')
      .eq('content_hash', contentHash)
      .maybeSingle();

    if (error) {
      console.error('Error checking claim:', error);
      return { exists: false };
    }

    return { exists: !!data, claimId: data?.id };
  };

  const claimGlyph = async (
    displayText: string,
    latticeId: string,
    latticeVersion: number,
    rulesJson: LatticeRules,
    path: EncodedPath,
    orientation: GlyphOrientation,
    style: GlyphStyle,
    svgData?: string
  ): Promise<ClaimResult> => {
    setClaiming(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'Must be logged in to claim' };
      }

      const canonicalText = canonicalizeText(displayText);
      
      // Generate content hash
      const contentHash = await generateContentHash(
        canonicalText,
        latticeId,
        latticeVersion,
        rulesJson,
        path
      );

      // Check if already claimed
      const { exists, claimId: existingClaimId } = await checkExistingClaim(contentHash);
      
      if (exists) {
        return { 
          success: false, 
          alreadyClaimed: true, 
          existingClaimId,
          error: 'This exact glyph has already been claimed' 
        };
      }

      // Create the claim
      const { data, error } = await supabase
        .from('glyph_claims')
        .insert([{
          canonical_text: canonicalText,
          display_text: displayText,
          lattice_id: latticeId,
          lattice_version: latticeVersion,
          orientation_json: orientation as unknown as Json,
          style_json: style as unknown as Json,
          path_json: path as unknown as Json,
          image_svg_url: svgData ? `data:image/svg+xml;base64,${btoa(svgData)}` : null,
          owner_user_id: user.id,
          content_hash: contentHash,
          status: 'claimed'
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating claim:', error);
        return { success: false, error: error.message };
      }

      toast.success('Glyph claimed successfully!');
      return { success: true, claimId: data.id };

    } catch (err) {
      console.error('Claim error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setClaiming(false);
    }
  };

  return { claimGlyph, checkExistingClaim, claiming };
}
