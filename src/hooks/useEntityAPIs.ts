import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

// Types
export type EntityApiType = 
  | "publish_work_order" 
  | "submit_bid" 
  | "accept_bid" 
  | "reject_bid" 
  | "approve_completion" 
  | "reject_completion"
  | "submit_invoice" 
  | "approve_invoice" 
  | "issue_payment"
  | "issue_change_order" 
  | "approve_change_order"
  | "confirm_delivery" 
  | "report_issue" 
  | "custom";

export type EntityAuthType = "api_key" | "oauth2" | "jwt" | "basic" | "none";

export type BindingSourceType = "oracle_feed" | "entity_api" | "attestation" | "manual";

export interface EntityApiEndpoint {
  id: string;
  entity_id: string;
  endpoint_name: string;
  endpoint_type: EntityApiType;
  http_method: string;
  endpoint_path: string;
  base_url: string;
  request_schema: Json;
  response_schema: Json;
  auth_type: EntityAuthType;
  auth_config: Json;
  webhook_url?: string;
  headers_template: Json;
  timeout_seconds: number;
  retry_config: Json;
  is_active: boolean;
  last_invoked_at?: string;
  invocation_count: number;
  success_count: number;
  failure_count: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface EntitySopMapping {
  id: string;
  entity_id: string;
  sop_name: string;
  sop_description?: string;
  sop_document_url?: string;
  sop_version: string;
  trigger_points: Json;
  mapped_api_endpoints: string[];
  ai_extracted: boolean;
  ai_extraction_confidence?: number;
  review_status: "pending" | "approved" | "rejected" | "needs_revision";
  is_active: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface EntityApiCallLog {
  id: string;
  endpoint_id: string;
  deal_room_id?: string;
  settlement_contract_id?: string;
  invoked_by: string;
  request_payload?: Json;
  response_payload?: Json;
  response_status_code?: number;
  response_time_ms?: number;
  error_message?: string;
  success: boolean;
  triggered_bindings: string[];
  created_at: string;
}

export interface SmartContractBinding {
  id: string;
  settlement_contract_id: string;
  deal_room_id?: string;
  binding_name: string;
  binding_description?: string;
  binding_source_type: BindingSourceType;
  binding_source_id: string;
  condition_expression: string;
  action_on_trigger: string;
  action_payload_template: Json;
  priority: number;
  is_active: boolean;
  last_evaluated_at?: string;
  last_triggered_at?: string;
  evaluation_count: number;
  trigger_count: number;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

// Fetch entity API endpoints
export function useEntityApiEndpoints(entityId?: string) {
  return useQuery({
    queryKey: ["entity-api-endpoints", entityId],
    queryFn: async () => {
      let query = supabase
        .from("entity_api_endpoints")
        .select("*")
        .order("created_at", { ascending: false });

      if (entityId) {
        query = query.eq("entity_id", entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as EntityApiEndpoint[];
    },
  });
}

// Fetch entity SOP mappings
export function useEntitySopMappings(entityId?: string) {
  return useQuery({
    queryKey: ["entity-sop-mappings", entityId],
    queryFn: async () => {
      let query = supabase
        .from("entity_sop_mappings")
        .select("*")
        .order("created_at", { ascending: false });

      if (entityId) {
        query = query.eq("entity_id", entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as EntitySopMapping[];
    },
  });
}

// Fetch API call logs
export function useEntityApiCallLogs(endpointId?: string, dealRoomId?: string) {
  return useQuery({
    queryKey: ["entity-api-call-logs", endpointId, dealRoomId],
    queryFn: async () => {
      let query = supabase
        .from("entity_api_call_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (endpointId) {
        query = query.eq("endpoint_id", endpointId);
      }
      if (dealRoomId) {
        query = query.eq("deal_room_id", dealRoomId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as EntityApiCallLog[];
    },
  });
}

// Fetch smart contract bindings
export function useSmartContractBindings(settlementContractId?: string, dealRoomId?: string) {
  return useQuery({
    queryKey: ["smart-contract-bindings", settlementContractId, dealRoomId],
    queryFn: async () => {
      let query = supabase
        .from("smart_contract_bindings")
        .select("*")
        .order("priority", { ascending: true });

      if (settlementContractId) {
        query = query.eq("settlement_contract_id", settlementContractId);
      }
      if (dealRoomId) {
        query = query.eq("deal_room_id", dealRoomId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as SmartContractBinding[];
    },
  });
}

// Register a new entity API endpoint
export function useRegisterEntityApiEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endpoint: {
      entity_id: string;
      endpoint_name: string;
      endpoint_type?: EntityApiType;
      http_method?: string;
      endpoint_path: string;
      base_url: string;
      request_schema?: Json;
      response_schema?: Json;
      auth_type?: EntityAuthType;
      auth_config?: Json;
      webhook_url?: string;
      headers_template?: Json;
      timeout_seconds?: number;
      metadata?: Json;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("entity-api-register", {
        body: endpoint,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entity-api-endpoints"] });
      queryClient.invalidateQueries({ queryKey: ["entity-api-endpoints", variables.entity_id] });
      toast.success("API endpoint registered successfully");
    },
    onError: (error) => {
      toast.error(`Failed to register endpoint: ${error.message}`);
    },
  });
}

// Invoke an entity API endpoint
export function useInvokeEntityApi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      endpoint_id: string;
      payload?: Json;
      deal_room_id?: string;
      settlement_contract_id?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("entity-api-invoke", {
        body: params,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-api-call-logs"] });
      queryClient.invalidateQueries({ queryKey: ["entity-api-endpoints"] });
    },
    onError: (error) => {
      toast.error(`API invocation failed: ${error.message}`);
    },
  });
}

// Create a smart contract binding
export function useCreateSmartContractBinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (binding: {
      settlement_contract_id: string;
      deal_room_id?: string;
      binding_name: string;
      binding_description?: string;
      binding_source_type: BindingSourceType;
      binding_source_id: string;
      condition_expression: string;
      action_on_trigger?: string;
      action_payload_template?: Json;
      priority?: number;
    }) => {
      const { data, error } = await supabase
        .from("smart_contract_bindings")
        .insert([binding])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["smart-contract-bindings"] });
      if (variables.settlement_contract_id) {
        queryClient.invalidateQueries({ 
          queryKey: ["smart-contract-bindings", variables.settlement_contract_id] 
        });
      }
      toast.success("Smart contract binding created");
    },
    onError: (error) => {
      toast.error(`Failed to create binding: ${error.message}`);
    },
  });
}

// Update a smart contract binding
export function useUpdateSmartContractBinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SmartContractBinding> & { id: string }) => {
      const { data, error } = await supabase
        .from("smart_contract_bindings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-contract-bindings"] });
      toast.success("Binding updated");
    },
    onError: (error) => {
      toast.error(`Failed to update binding: ${error.message}`);
    },
  });
}

// Delete a smart contract binding
export function useDeleteSmartContractBinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("smart_contract_bindings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smart-contract-bindings"] });
      toast.success("Binding deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete binding: ${error.message}`);
    },
  });
}

// Create an SOP mapping
export function useCreateSopMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mapping: {
      entity_id: string;
      sop_name: string;
      sop_description?: string;
      sop_document_url?: string;
      trigger_points?: Json;
      mapped_api_endpoints?: string[];
    }) => {
      const { data, error } = await supabase
        .from("entity_sop_mappings")
        .insert([mapping])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entity-sop-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["entity-sop-mappings", variables.entity_id] });
      toast.success("SOP mapping created");
    },
    onError: (error) => {
      toast.error(`Failed to create SOP mapping: ${error.message}`);
    },
  });
}
