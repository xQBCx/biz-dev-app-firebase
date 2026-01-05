-- Phase 6: Chemical Blender Model Enhancement

-- Add classification columns to blender_ingredients
ALTER TABLE IF EXISTS blender_ingredients
  ADD COLUMN IF NOT EXISTS value_category text DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS contribution_weight numeric(5,2) DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS credit_multiplier numeric(5,2) DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS ip_classification text DEFAULT 'internal';

-- Add formulation activation and versioning to blender_formulations
ALTER TABLE IF EXISTS blender_formulations
  ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS activated_by uuid,
  ADD COLUMN IF NOT EXISTS total_weight_percent numeric(6,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS formulation_status text DEFAULT 'draft';

-- Create blender_payout_calculations table for tracking credit-to-payout conversions
CREATE TABLE IF NOT EXISTS blender_payout_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_room_id uuid REFERENCES deal_rooms(id) ON DELETE CASCADE,
  formulation_id uuid REFERENCES blender_formulations(id) ON DELETE SET NULL,
  participant_id uuid REFERENCES deal_room_participants(id) ON DELETE CASCADE,
  calculation_date timestamptz DEFAULT now(),
  
  -- Credit inputs
  compute_credits_in numeric(12,2) DEFAULT 0,
  action_credits_in numeric(12,2) DEFAULT 0,
  outcome_credits_in numeric(12,2) DEFAULT 0,
  total_credits_in numeric(12,2) GENERATED ALWAYS AS (compute_credits_in + action_credits_in + outcome_credits_in) STORED,
  
  -- Attribution results
  attribution_percentage numeric(5,2) DEFAULT 0,
  calculated_payout numeric(12,2) DEFAULT 0,
  min_payout_applied boolean DEFAULT false,
  max_payout_applied boolean DEFAULT false,
  
  -- Status
  status text DEFAULT 'pending',
  approved_at timestamptz,
  approved_by uuid,
  paid_at timestamptz,
  payment_reference text,
  
  created_at timestamptz DEFAULT now()
);

-- Create formulation_version_history for audit trail
CREATE TABLE IF NOT EXISTS formulation_version_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id uuid REFERENCES blender_formulations(id) ON DELETE CASCADE,
  version integer NOT NULL,
  changes_json jsonb DEFAULT '{}',
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  change_reason text
);

-- Enable RLS
ALTER TABLE blender_payout_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulation_version_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for payout calculations - participants can view their deal room's calculations
CREATE POLICY "Users can view payout calculations for their deal rooms"
  ON blender_payout_calculations FOR SELECT
  USING (
    deal_room_id IN (
      SELECT drp.deal_room_id FROM deal_room_participants drp WHERE drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Deal room owners can manage payout calculations"
  ON blender_payout_calculations FOR ALL
  USING (
    deal_room_id IN (
      SELECT dr.id FROM deal_rooms dr WHERE dr.created_by = auth.uid()
    )
  );

-- RLS policies for version history - participants can view
CREATE POLICY "Users can view formulation history for their deal rooms"
  ON formulation_version_history FOR SELECT
  USING (
    formulation_id IN (
      SELECT bf.id FROM blender_formulations bf
      JOIN deal_room_participants drp ON drp.deal_room_id = bf.deal_room_id
      WHERE drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Deal room owners can manage formulation history"
  ON formulation_version_history FOR INSERT
  WITH CHECK (
    formulation_id IN (
      SELECT bf.id FROM blender_formulations bf
      JOIN deal_rooms dr ON dr.id = bf.deal_room_id
      WHERE dr.created_by = auth.uid()
    )
  );

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_payout_calc_deal_room ON blender_payout_calculations(deal_room_id);
CREATE INDEX IF NOT EXISTS idx_payout_calc_participant ON blender_payout_calculations(participant_id);
CREATE INDEX IF NOT EXISTS idx_formulation_history_version ON formulation_version_history(formulation_id, version);