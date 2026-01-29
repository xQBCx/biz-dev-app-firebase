import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ValueLedgerEntry {
  id: string;
  deal_room_id: string | null;
  source_user_id: string | null;
  source_entity_type: string;
  source_entity_id: string | null;
  source_entity_name: string;
  destination_user_id: string | null;
  destination_entity_type: string | null;
  destination_entity_id: string | null;
  destination_entity_name: string | null;
  entry_type: string;
  amount: number;
  currency: string;
  xdk_amount: number | null;
  purpose: string | null;
  reference_type: string | null;
  reference_id: string | null;
  contribution_credits: number;
  credit_category: string | null;
  verification_source: string | null;
  verification_id: string | null;
  verified_at: string | null;
  xdk_tx_hash: string | null;
  xodiak_block_number: number | null;
  narrative: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface LedgerStats {
  totalValue: number;
  totalXdk: number;
  totalCredits: number;
  entryCount: number;
  uniqueEntities: number;
  byEntityType: Record<string, number>;
  byEntryType: Record<string, number>;
}

interface UseValueLedgerOptions {
  dealRoomId?: string;
  entryType?: string;
  sourceEntityName?: string;
  limit?: number;
}

export function useValueLedger(options: UseValueLedgerOptions = {}) {
  const { dealRoomId, entryType, sourceEntityName, limit = 100 } = options;

  return useQuery({
    queryKey: ["value-ledger", dealRoomId, entryType, sourceEntityName, limit],
    queryFn: async (): Promise<{ entries: ValueLedgerEntry[]; stats: LedgerStats }> => {
      let query = supabase
        .from("value_ledger_entries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (dealRoomId) {
        query = query.eq("deal_room_id", dealRoomId);
      }

      if (entryType) {
        query = query.eq("entry_type", entryType);
      }

      if (sourceEntityName) {
        query = query.ilike("source_entity_name", `%${sourceEntityName}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const entries = (data || []) as ValueLedgerEntry[];

      // Calculate stats
      const stats: LedgerStats = {
        totalValue: 0,
        totalXdk: 0,
        totalCredits: 0,
        entryCount: entries.length,
        uniqueEntities: 0,
        byEntityType: {},
        byEntryType: {},
      };

      const entitySet = new Set<string>();

      entries.forEach((entry) => {
        stats.totalValue += Number(entry.amount) || 0;
        stats.totalXdk += Number(entry.xdk_amount) || 0;
        stats.totalCredits += Number(entry.contribution_credits) || 0;

        entitySet.add(entry.source_entity_name);
        if (entry.destination_entity_name) {
          entitySet.add(entry.destination_entity_name);
        }

        // Count by entity type
        if (entry.source_entity_type) {
          stats.byEntityType[entry.source_entity_type] = 
            (stats.byEntityType[entry.source_entity_type] || 0) + Number(entry.amount);
        }

        // Count by entry type
        if (entry.entry_type) {
          stats.byEntryType[entry.entry_type] = 
            (stats.byEntryType[entry.entry_type] || 0) + Number(entry.amount);
        }
      });

      stats.uniqueEntities = entitySet.size;

      return { entries, stats };
    },
  });
}

export function useLedgerEntryDetails(entryId: string | null) {
  return useQuery({
    queryKey: ["value-ledger-entry", entryId],
    queryFn: async () => {
      if (!entryId) return null;

      const { data, error } = await supabase
        .from("value_ledger_entries")
        .select("*")
        .eq("id", entryId)
        .single();

      if (error) throw error;
      return data as ValueLedgerEntry;
    },
    enabled: !!entryId,
  });
}
