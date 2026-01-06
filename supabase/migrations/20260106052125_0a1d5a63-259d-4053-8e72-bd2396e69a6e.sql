-- Additional RLS Policies for remaining tables

-- deal_message_quality_ratings
CREATE POLICY "Users can view quality ratings in their deal rooms" ON deal_message_quality_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_messages drm
      JOIN deal_room_participants drp ON drp.deal_room_id = drm.deal_room_id
      WHERE drm.id = deal_message_quality_ratings.message_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can rate messages" ON deal_message_quality_ratings
  FOR INSERT WITH CHECK (rated_by = auth.uid());

-- deal_proposal_votes
CREATE POLICY "Users can view votes in their deal rooms" ON deal_proposal_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_change_proposals drcp
      JOIN deal_room_participants drp ON drp.deal_room_id = drcp.deal_room_id
      WHERE drcp.id = deal_proposal_votes.proposal_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can vote on proposals" ON deal_proposal_votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.id = deal_proposal_votes.participant_id 
      AND drp.user_id = auth.uid()
    )
  );

-- advisor_notes
CREATE POLICY "Users can view advisor notes they have access to" ON advisor_notes
  FOR SELECT USING (
    auth.uid() = ANY(visible_to_participant_ids) OR
    EXISTS (
      SELECT 1 FROM deal_room_advisors dra 
      WHERE dra.id = advisor_notes.advisor_id 
      AND dra.user_id = auth.uid()
    )
  );

CREATE POLICY "Advisors can create notes" ON advisor_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_room_advisors dra 
      WHERE dra.id = advisor_notes.advisor_id 
      AND dra.user_id = auth.uid()
    )
  );

-- deal_audit_actions
CREATE POLICY "Users can view audit actions in their deal rooms" ON deal_audit_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_audit_actions.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Auditors can create audit actions" ON deal_audit_actions
  FOR INSERT WITH CHECK (auditor_user_id = auth.uid());

-- deal_room_clarifications
CREATE POLICY "Users can view clarifications in their deal rooms" ON deal_room_clarifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_clarifications.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can answer clarifications" ON deal_room_clarifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_clarifications.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- participant_wallet_connections
CREATE POLICY "Users can view their wallet connections" ON participant_wallet_connections
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their wallet connections" ON participant_wallet_connections
  FOR ALL USING (user_id = auth.uid());

-- deal_room_inflows
CREATE POLICY "Users can view inflows in their deal rooms" ON deal_room_inflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_inflows.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- deal_room_distributions
CREATE POLICY "Users can view distributions in their deal rooms" ON deal_room_distributions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_distributions.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- deal_room_learning_candidates
CREATE POLICY "Users can view learning candidates in their deal rooms" ON deal_room_learning_candidates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = deal_room_learning_candidates.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

-- agent_attribution_rules
CREATE POLICY "Users can view attribution rules in their deal rooms" ON agent_attribution_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.deal_room_id = agent_attribution_rules.deal_room_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage attribution rules" ON agent_attribution_rules
  FOR ALL USING (auth.uid() IS NOT NULL);

-- participant_data_requests
CREATE POLICY "Users can view their own data requests" ON participant_data_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.id = participant_data_requests.participant_id 
      AND drp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own data requests" ON participant_data_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deal_room_participants drp 
      WHERE drp.id = participant_data_requests.participant_id 
      AND drp.user_id = auth.uid()
    )
  );