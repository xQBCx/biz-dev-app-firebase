import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export type OracleProviderType = "sensor" | "api" | "manual" | "attestation" | "price_feed" | "iot_device";
export type OracleTrustLevel = "bronze" | "silver" | "gold" | "platinum";
export type OracleAttestationType = "field_supervisor" | "quality_inspector" | "auditor" | "compliance_officer" | "executive" | "third_party";
export type CommodityType = "oil" | "natural_gas" | "electricity" | "carbon_credit" | "rin" | "water" | "minerals" | "agricultural" | "other";

export interface UsageStats {
  total_calls: number;
  failed_calls: number;
  last_success_at?: string;
  average_response_ms?: number;
}

export interface OracleProvider {
  id: string;
  name: string;
  description?: string | null;
  provider_type: OracleProviderType;
  endpoint_url?: string | null;
  data_schema?: Record<string, unknown> | null;
  trust_level: OracleTrustLevel;
  is_certified: boolean;
  certified_at?: string | null;
  owner_user_id?: string | null;
  usage_stats: UsageStats;
  last_polled_at?: string | null;
  polling_enabled: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}


export interface OracleDataFeed {
  id: string;
  provider_id: string;
  feed_name: string;
  feed_type: string;
  commodity_type?: CommodityType | null;
  unit_of_measure?: string | null;
  polling_frequency_seconds: number;
  last_value?: unknown;
  last_updated?: string | null;
  validation_rules?: Record<string, unknown> | null;
  anomaly_threshold?: number | null;
  deal_room_subscriptions: string[] | null;
  settlement_contract_subscriptions: string[] | null;
  is_active: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  provider?: OracleProvider | null;
}

export interface OracleAttestation {
  id: string;
  provider_id?: string;
  attester_id: string;
  attestation_type: OracleAttestationType;
  subject_entity_type: string;
  subject_entity_id: string;
  deal_room_id?: string;
  settlement_contract_id?: string;
  attestation_data: Record<string, unknown>;
  signature_hash?: string;
  xodiak_tx_hash?: string;
  xodiak_block_number?: number;
  geolocation?: { lat: number; lng: number };
  device_info?: Record<string, unknown>;
  photo_evidence_urls?: string[];
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_reason?: string;
  created_at: string;
}

export interface OracleCondition {
  id: string;
  name: string;
  description?: string;
  feed_id?: string;
  attestation_type?: OracleAttestationType;
  condition_expression: string;
  settlement_contract_id?: string;
  deal_room_id?: string;
  is_met: boolean;
  last_checked_at?: string;
  met_at?: string;
  triggered_action?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Fetch oracle providers
export function useOracleProviders() {
  return useQuery({
    queryKey: ["oracle-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oracle_data_providers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as OracleProvider[];
    },
  });
}

// Fetch oracle data feeds
export function useOracleDataFeeds(providerId?: string) {
  return useQuery({
    queryKey: ["oracle-data-feeds", providerId],
    queryFn: async () => {
      let query = supabase
        .from("oracle_data_feeds")
        .select(`
          *,
          provider:oracle_data_providers(*)
        `)
        .order("created_at", { ascending: false });

      if (providerId) {
        query = query.eq("provider_id", providerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as OracleDataFeed[];
    },
  });
}

// Fetch oracle attestations
export function useOracleAttestations(dealRoomId?: string) {
  return useQuery({
    queryKey: ["oracle-attestations", dealRoomId],
    queryFn: async () => {
      let query = supabase
        .from("oracle_attestations")
        .select("*")
        .order("created_at", { ascending: false });

      if (dealRoomId) {
        query = query.eq("deal_room_id", dealRoomId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OracleAttestation[];
    },
  });
}

// Fetch oracle conditions
export function useOracleConditions(dealRoomId?: string) {
  return useQuery({
    queryKey: ["oracle-conditions", dealRoomId],
    queryFn: async () => {
      let query = supabase
        .from("oracle_conditions")
        .select("*")
        .order("created_at", { ascending: false });

      if (dealRoomId) {
        query = query.eq("deal_room_id", dealRoomId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as OracleCondition[];
    },
  });
}

// Register a new oracle provider
export function useRegisterOracleProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: {
      name: string;
      description?: string;
      provider_type: OracleProviderType;
      endpoint_url?: string;
      data_schema?: Record<string, unknown>;
      trust_level?: OracleTrustLevel;
      metadata?: Record<string, unknown>;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("oracle-register-provider", {
        body: provider,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oracle-providers"] });
      toast.success("Oracle provider registered successfully");
    },
    onError: (error) => {
      toast.error(`Failed to register provider: ${error.message}`);
    },
  });
}

// Submit an attestation
export function useSubmitAttestation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attestation: {
      provider_id?: string;
      attestation_type: OracleAttestationType;
      subject_entity_type: string;
      subject_entity_id: string;
      deal_room_id?: string;
      settlement_contract_id?: string;
      attestation_data: Record<string, unknown>;
      geolocation?: { lat: number; lng: number };
      device_info?: Record<string, unknown>;
      photo_evidence_urls?: string[];
      expires_at?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("oracle-submit-attestation", {
        body: attestation,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["oracle-attestations"] });
      queryClient.invalidateQueries({ queryKey: ["oracle-conditions"] });
      if (variables.deal_room_id) {
        queryClient.invalidateQueries({ queryKey: ["oracle-attestations", variables.deal_room_id] });
        queryClient.invalidateQueries({ queryKey: ["oracle-conditions", variables.deal_room_id] });
      }
      toast.success("Attestation submitted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to submit attestation: ${error.message}`);
    },
  });
}

// Verify oracle conditions
export function useVerifyCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      condition_id?: string;
      deal_room_id?: string;
      settlement_contract_id?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("oracle-verify-condition", {
        body: params,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oracle-conditions"] });
    },
    onError: (error) => {
      toast.error(`Failed to verify condition: ${error.message}`);
    },
  });
}

// Create a data feed
export function useCreateDataFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feed: {
      provider_id: string;
      feed_name: string;
      feed_type: string;
      commodity_type?: CommodityType;
      unit_of_measure?: string;
      polling_frequency_seconds?: number;
      anomaly_threshold?: number;
    }) => {
      const { data, error } = await supabase
        .from("oracle_data_feeds")
        .insert([feed])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oracle-data-feeds"] });
      toast.success("Data feed created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create data feed: ${error.message}`);
    },
  });
}

// Create an oracle condition
export function useCreateCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (condition: {
      name: string;
      description?: string;
      feed_id?: string;
      attestation_type?: OracleAttestationType;
      condition_expression: string;
      settlement_contract_id?: string;
      deal_room_id?: string;
      triggered_action?: string;
    }) => {
      const { data, error } = await supabase
        .from("oracle_conditions")
        .insert([condition])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["oracle-conditions"] });
      if (variables.deal_room_id) {
        queryClient.invalidateQueries({ queryKey: ["oracle-conditions", variables.deal_room_id] });
      }
      toast.success("Condition created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create condition: ${error.message}`);
    },
  });
}
