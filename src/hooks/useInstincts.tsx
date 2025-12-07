/**
 * Unity Meridian: Instincts Layer Hook
 * 
 * This hook provides event emission capabilities for the Instincts system.
 * Every major action across the platform should emit events through this hook
 * to build user embeddings and enable personalization.
 */

import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { EventCategory, PlatformModule, InstinctsEvent } from '@/types/instincts';

// Session ID persists for the browser session
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

interface EmitEventOptions {
  category: EventCategory;
  module: PlatformModule;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  valueAmount?: number;
  valueCurrency?: string;
  durationMs?: number;
  sequencePosition?: number;
  context?: Record<string, unknown>;
  relatedUserIds?: string[];
  relatedEntityIds?: string[];
}

export function useInstincts() {
  const { user } = useAuth();
  const pageLoadTime = useRef<number>(Date.now());
  const lastRoute = useRef<string>(window.location.pathname);

  // Emit a generic event
  const emit = useCallback(async (options: EmitEventOptions) => {
    if (!user?.id) return;

    const event: Partial<InstinctsEvent> = {
      user_id: user.id,
      session_id: getSessionId(),
      category: options.category,
      module: options.module,
      action: options.action,
      entity_type: options.entityType,
      entity_id: options.entityId,
      entity_name: options.entityName,
      value_amount: options.valueAmount,
      value_currency: options.valueCurrency || 'USD',
      duration_ms: options.durationMs,
      sequence_position: options.sequencePosition,
      context: options.context || {},
      source_url: window.location.pathname,
      referrer_url: document.referrer || undefined,
      device_type: getDeviceType(),
      related_user_ids: options.relatedUserIds,
      related_entity_ids: options.relatedEntityIds,
    };

    try {
      const { error } = await supabase
        .from('instincts_events')
        .insert(event as any);
      
      if (error) {
        console.error('Failed to emit instincts event:', error);
      }

      // Build graph edges for entity relationships (fire and forget)
      if (options.entityType && options.entityId) {
        supabase.rpc('upsert_instincts_graph_edge', {
          p_source_type: 'user',
          p_source_id: user.id,
          p_target_type: options.entityType,
          p_target_id: options.entityId,
          p_edge_type: options.action,
          p_weight: 1.0,
          p_metadata: JSON.stringify(options.context || {}),
        }).then(() => {}, () => {});
      }

      // Also create edges for related entities
      if (options.relatedEntityIds?.length && options.entityId) {
        for (const relatedId of options.relatedEntityIds) {
          supabase.rpc('upsert_instincts_graph_edge', {
            p_source_type: options.entityType || 'unknown',
            p_source_id: options.entityId,
            p_target_type: 'entity',
            p_target_id: relatedId,
            p_edge_type: 'related_to',
            p_weight: 0.5,
            p_metadata: '{}',
          }).then(() => {}, () => {});
        }
      }
    } catch (err) {
      console.error('Instincts emit error:', err);
    }
  }, [user?.id]);

  // Convenience methods for common event types
  const trackPageView = useCallback((module: PlatformModule, pageName?: string) => {
    const timeOnPreviousPage = Date.now() - pageLoadTime.current;
    
    emit({
      category: 'navigation',
      module,
      action: 'page_viewed',
      entityType: 'page',
      entityName: pageName || window.location.pathname,
      durationMs: lastRoute.current !== window.location.pathname ? timeOnPreviousPage : undefined,
      context: {
        previous_route: lastRoute.current,
        current_route: window.location.pathname,
      },
    });

    pageLoadTime.current = Date.now();
    lastRoute.current = window.location.pathname;
  }, [emit]);

  const trackClick = useCallback((module: PlatformModule, elementName: string, context?: Record<string, unknown>) => {
    emit({
      category: 'interaction',
      module,
      action: 'button_clicked',
      entityType: 'button',
      entityName: elementName,
      context,
    });
  }, [emit]);

  const trackSearch = useCallback((module: PlatformModule, query: string, resultsCount?: number) => {
    emit({
      category: 'search',
      module,
      action: 'search_performed',
      entityType: 'search',
      entityName: query,
      context: {
        query,
        results_count: resultsCount,
      },
    });
  }, [emit]);

  const trackFormSubmit = useCallback((module: PlatformModule, formName: string, success: boolean, context?: Record<string, unknown>) => {
    emit({
      category: 'interaction',
      module,
      action: success ? 'form_submitted' : 'form_failed',
      entityType: 'form',
      entityName: formName,
      context: {
        success,
        ...context,
      },
    });
  }, [emit]);

  const trackEntityCreated = useCallback((
    module: PlatformModule,
    entityType: string,
    entityId: string,
    entityName: string,
    valueAmount?: number
  ) => {
    emit({
      category: 'workflow',
      module,
      action: `${entityType}_created`,
      entityType,
      entityId,
      entityName,
      valueAmount,
    });
  }, [emit]);

  const trackEntityUpdated = useCallback((
    module: PlatformModule,
    entityType: string,
    entityId: string,
    entityName: string,
    changes?: Record<string, unknown>
  ) => {
    emit({
      category: 'workflow',
      module,
      action: `${entityType}_updated`,
      entityType,
      entityId,
      entityName,
      context: { changes },
    });
  }, [emit]);

  const trackEntityDeleted = useCallback((
    module: PlatformModule,
    entityType: string,
    entityId: string,
    entityName: string
  ) => {
    emit({
      category: 'workflow',
      module,
      action: `${entityType}_deleted`,
      entityType,
      entityId,
      entityName,
    });
  }, [emit]);

  const trackTransaction = useCallback((
    module: PlatformModule,
    transactionType: string,
    amount: number,
    currency: string = 'USD',
    context?: Record<string, unknown>
  ) => {
    emit({
      category: 'transaction',
      module,
      action: transactionType,
      valueAmount: amount,
      valueCurrency: currency,
      context,
    });
  }, [emit]);

  const trackCommunication = useCallback((
    module: PlatformModule,
    communicationType: 'email' | 'call' | 'message' | 'meeting',
    direction: 'inbound' | 'outbound',
    relatedUserIds?: string[],
    context?: Record<string, unknown>
  ) => {
    emit({
      category: 'communication',
      module,
      action: `${communicationType}_${direction}`,
      entityType: communicationType,
      relatedUserIds,
      context,
    });
  }, [emit]);

  const trackContent = useCallback((
    module: PlatformModule,
    contentType: string,
    action: 'created' | 'viewed' | 'edited' | 'shared' | 'downloaded',
    entityId?: string,
    entityName?: string
  ) => {
    emit({
      category: 'content',
      module,
      action: `content_${action}`,
      entityType: contentType,
      entityId,
      entityName,
    });
  }, [emit]);

  const trackIntegration = useCallback((
    module: PlatformModule,
    integrationName: string,
    action: string,
    success: boolean,
    context?: Record<string, unknown>
  ) => {
    emit({
      category: 'integration',
      module,
      action: `integration_${action}`,
      entityType: 'integration',
      entityName: integrationName,
      context: {
        success,
        ...context,
      },
    });
  }, [emit]);

  const trackError = useCallback((
    module: PlatformModule,
    errorType: string,
    errorMessage: string,
    context?: Record<string, unknown>
  ) => {
    emit({
      category: 'system',
      module,
      action: 'error_occurred',
      entityType: 'error',
      entityName: errorType,
      context: {
        error_message: errorMessage,
        ...context,
      },
    });
  }, [emit]);

  return {
    emit,
    trackPageView,
    trackClick,
    trackSearch,
    trackFormSubmit,
    trackEntityCreated,
    trackEntityUpdated,
    trackEntityDeleted,
    trackTransaction,
    trackCommunication,
    trackContent,
    trackIntegration,
    trackError,
  };
}

// Module mapping helper for route-based detection
export const routeToModule: Record<string, PlatformModule> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/driveby': 'driveby',
  '/crm': 'crm',
  '/tasks': 'tasks',
  '/calendar': 'calendar',
  '/messages': 'messages',
  '/marketplace': 'marketplace',
  '/ai-gift-cards': 'ai_gift_cards',
  '/iplaunch': 'iplaunch',
  '/portfolio': 'portfolio',
  '/xbuilderx': 'xbuilderx',
  '/xodiak': 'xodiak',
  '/grid-os': 'grid_os',
  '/trueodds': 'true_odds',
  '/erp': 'erp',
  '/social': 'social',
  '/social-media': 'social',
  '/website-builder': 'website_builder',
  '/ecosystem': 'ecosystem',
  '/admin': 'admin',
  '/clients': 'clients',
  '/client-portal': 'client_portal',
  '/directory': 'directory',
  '/business-cards': 'business_cards',
  '/franchises': 'franchises',
  '/tools': 'tools',
  '/activity': 'activity',
  '/funding': 'funding',
  '/integrations': 'integrations',
  '/workflows': 'workflows',
};

export function getModuleFromRoute(path: string): PlatformModule {
  // Check exact match first
  if (routeToModule[path]) {
    return routeToModule[path];
  }
  
  // Check prefix match
  for (const [route, module] of Object.entries(routeToModule)) {
    if (path.startsWith(route) && route !== '/') {
      return module;
    }
  }
  
  return 'dashboard';
}
