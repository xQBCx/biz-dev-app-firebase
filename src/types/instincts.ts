/**
 * Unity Meridian: Instincts Layer Type Definitions
 * 
 * These types define the structure of events and user profiles
 * for the Instincts behavioral tracking system.
 */

export type EventCategory = 
  | 'navigation'
  | 'interaction'
  | 'transaction'
  | 'communication'
  | 'content'
  | 'workflow'
  | 'search'
  | 'integration'
  | 'system';

export type PlatformModule =
  | 'core'
  | 'dashboard'
  | 'crm'
  | 'tasks'
  | 'calendar'
  | 'messages'
  | 'marketplace'
  | 'ai_gift_cards'
  | 'iplaunch'
  | 'portfolio'
  | 'xbuilderx'
  | 'xbuilderx_home'
  | 'xbuilderx_discovery'
  | 'xbuilderx_engineering'
  | 'xbuilderx_pipeline'
  | 'xbuilderx_construction'
  | 'xodiak'
  | 'xodiak_assets'
  | 'xodiak_compliance'
  | 'grid_os'
  | 'true_odds'
  | 'true_odds_explore'
  | 'true_odds_picks'
  | 'true_odds_signals'
  | 'erp'
  | 'social'
  | 'website_builder'
  | 'ecosystem'
  | 'admin'
  | 'clients'
  | 'client_portal'
  | 'directory'
  | 'business_cards'
  | 'franchises'
  | 'franchise_applications'
  | 'tools'
  | 'activity'
  | 'funding'
  | 'integrations'
  | 'workflows'
  | 'network'
  | 'theme_harvester'
  | 'launchpad'
  | 'app_store'
  | 'my_apps'
  | 'white_label_portal'
  | 'earnings'
  | 'team'
  | 'team_invitations';

export interface InstinctsEvent {
  id: string;
  user_id: string;
  session_id: string | null;
  created_at: string;
  
  // Classification
  category: EventCategory;
  module: PlatformModule;
  action: string;
  
  // Entity context
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  
  // Value signals
  value_amount: number | null;
  value_currency: string;
  
  // Behavioral signals
  duration_ms: number | null;
  sequence_position: number | null;
  
  // Rich context
  context: Record<string, unknown>;
  
  // Source tracking
  source_url: string | null;
  referrer_url: string | null;
  device_type: string | null;
  
  // Graph connections
  related_user_ids: string[] | null;
  related_entity_ids: string[] | null;
  
  // Embedding status
  embedding_processed: boolean;
  embedding_version: number | null;
}

export interface InstinctsUserStats {
  id: string;
  user_id: string;
  
  // Category counts
  navigation_count: number;
  interaction_count: number;
  transaction_count: number;
  communication_count: number;
  content_count: number;
  workflow_count: number;
  search_count: number;
  
  // Value metrics
  total_transaction_value: number;
  avg_session_duration_ms: number | null;
  
  // Module engagement
  module_engagement: Record<string, number>;
  
  // Behavioral patterns
  peak_hours: number[] | null;
  preferred_modules: string[] | null;
  completion_rate: number | null;
  
  // Timestamps
  first_event_at: string | null;
  last_event_at: string | null;
  updated_at: string;
}

/**
 * Event action naming conventions by category:
 * 
 * navigation:
 *   - page_viewed
 *   - route_changed
 *   - tab_switched
 * 
 * interaction:
 *   - button_clicked
 *   - form_submitted
 *   - form_failed
 *   - filter_applied
 *   - sort_changed
 *   - modal_opened
 *   - modal_closed
 * 
 * transaction:
 *   - payment_initiated
 *   - payment_completed
 *   - payment_failed
 *   - refund_issued
 *   - invoice_created
 *   - deal_closed
 * 
 * communication:
 *   - email_inbound
 *   - email_outbound
 *   - call_inbound
 *   - call_outbound
 *   - message_inbound
 *   - message_outbound
 *   - meeting_scheduled
 *   - meeting_completed
 * 
 * content:
 *   - content_created
 *   - content_viewed
 *   - content_edited
 *   - content_shared
 *   - content_downloaded
 *   - document_uploaded
 * 
 * workflow:
 *   - {entity}_created (e.g., task_created, deal_created)
 *   - {entity}_updated
 *   - {entity}_deleted
 *   - {entity}_completed
 *   - workflow_started
 *   - workflow_completed
 *   - step_completed
 * 
 * search:
 *   - search_performed
 *   - filter_applied
 *   - results_clicked
 * 
 * integration:
 *   - integration_connected
 *   - integration_disconnected
 *   - integration_synced
 *   - api_called
 * 
 * system:
 *   - error_occurred
 *   - session_started
 *   - session_ended
 *   - auth_login
 *   - auth_logout
 */
