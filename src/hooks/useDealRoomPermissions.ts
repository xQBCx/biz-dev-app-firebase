import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveUser } from "@/hooks/useEffectiveUser";
import { useEffectiveUserRole } from "@/hooks/useEffectiveUserRole";

import type { Json } from "@/integrations/supabase/types";

interface DealRoomParticipant {
  id: string;
  user_id: string | null;
  default_permissions: Json | null;
  visibility_config: Json | null;
  role_type: string | null;
}

interface UseDealRoomPermissionsReturn {
  isLoading: boolean;
  permissions: Record<string, boolean>;
  visibility: Record<string, string>;
  roleType: string;
  participantId: string | null;
  canView: (permissionKey: string) => boolean;
  canAccess: (tabName: string) => boolean;
  getVisibility: (dataType: string) => string;
  isParticipant: boolean;
  isCreator: boolean;
}

// Maps tab names to required permissions
const TAB_PERMISSION_MAP: Record<string, string[]> = {
  "overview": [], // Always visible
  "participants": ["view_participants"],
  "ingredients": ["view_ingredients", "view_deal_terms"],
  "contributions": ["view_own_deliverables", "view_all_deliverables"],
  "credits": ["view_own_financials", "view_all_financials"],
  "structures": ["view_deal_terms"],
  "settlement": ["view_all_financials"],
  "formulations": ["view_deal_terms"],
  "analytics": ["view_all_financials"],
  "financial-rails": ["view_own_financials", "view_all_financials"],
  "chat": ["send_messages", "view_all_messages"],
  "messaging": ["send_messages", "view_all_messages"],
  "deliverables": ["view_own_deliverables", "view_all_deliverables"],
  "terms": ["view_deal_terms"],
  "invites": ["invite_participants"],
  "governance": ["manage_deal_settings"],
  "agents": ["view_documents"], // For agent setup guide access
  "xodiak-anchors": ["view_documents"],
  "crm": ["view_documents"],
  "ai": [], // Based on room.ai_analysis_enabled
};

export function useDealRoomPermissions(dealRoomId: string): UseDealRoomPermissionsReturn {
  // Use EFFECTIVE user/roles - respects impersonation
  const { id: effectiveUserId, isImpersonating, isRealAdmin } = useEffectiveUser();
  const { hasRole } = useEffectiveUserRole();
  
  // When impersonating, we check if the IMPERSONATED user is admin
  // isRealAdmin tells us the REAL logged-in user is admin (for audit purposes)
  const isGlobalAdmin = hasRole("admin");
  
  const [isLoading, setIsLoading] = useState(true);
  const [participant, setParticipant] = useState<DealRoomParticipant | null>(null);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    if (!effectiveUserId || !dealRoomId) {
      setIsLoading(false);
      return;
    }

    const fetchParticipant = async () => {
      setIsLoading(true);
      try {
        // Fetch participant data for the EFFECTIVE user (impersonated or real)
        const { data: participantData, error: participantError } = await supabase
          .from("deal_room_participants")
          .select("id, user_id, default_permissions, visibility_config, role_type")
          .eq("deal_room_id", dealRoomId)
          .eq("user_id", effectiveUserId)
          .single();

        if (participantError && participantError.code !== "PGRST116") {
          console.error("Error fetching participant:", participantError);
        }

        // Check if user is the creator
        const { data: roomData } = await supabase
          .from("deal_rooms")
          .select("created_by")
          .eq("id", dealRoomId)
          .single();

        setParticipant(participantData || null);
        // Creator check uses EFFECTIVE user id
        setIsCreator(roomData?.created_by === effectiveUserId);
      } catch (error) {
        console.error("Error in useDealRoomPermissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipant();
  }, [effectiveUserId, dealRoomId]);

  const permissions = useMemo(() => {
    return (participant?.default_permissions as Record<string, boolean>) || {};
  }, [participant]);

  const visibility = useMemo(() => {
    return (participant?.visibility_config as Record<string, string>) || {};
  }, [participant]);

  const roleType = useMemo(() => {
    return participant?.role_type || "participant";
  }, [participant]);

  const canView = (permissionKey: string): boolean => {
    // Global admins and creators can view everything
    if (isGlobalAdmin || isCreator) return true;
    
    // Not a participant = no access
    if (!participant) return false;
    
    return permissions[permissionKey] === true;
  };

  const canAccess = (tabName: string): boolean => {
    // Global admins and creators can access all tabs
    if (isGlobalAdmin || isCreator) return true;
    
    // Not a participant = only overview
    if (!participant) return tabName === "overview";

    const requiredPermissions = TAB_PERMISSION_MAP[tabName];
    
    // If no permissions required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // User needs at least ONE of the required permissions (OR logic)
    return requiredPermissions.some(perm => permissions[perm] === true);
  };

  const getVisibility = (dataType: string): string => {
    // Global admins and creators see everything
    if (isGlobalAdmin || isCreator) return "all";
    
    // Not a participant = none
    if (!participant) return "none";
    
    return visibility[dataType] || "none";
  };

  return {
    isLoading,
    permissions,
    visibility,
    roleType,
    participantId: participant?.id || null,
    canView,
    canAccess,
    getVisibility,
    isParticipant: !!participant,
    isCreator,
  };
}
