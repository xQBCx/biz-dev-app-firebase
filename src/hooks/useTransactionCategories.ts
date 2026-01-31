import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TransactionCategory {
  id: string;
  name: string;
  type: "income" | "expense" | "transfer";
  tax_treatment: "taxable" | "deductible" | "exempt" | "owner_draw" | null;
  icon: string | null;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export function useTransactionCategories() {
  return useQuery({
    queryKey: ["transaction-categories"],
    queryFn: async (): Promise<TransactionCategory[]> => {
      const { data, error } = await supabase
        .from("transaction_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return (data || []) as TransactionCategory[];
    },
  });
}

export function useCategoriesByType(type?: "income" | "expense" | "transfer") {
  return useQuery({
    queryKey: ["transaction-categories", type],
    queryFn: async (): Promise<TransactionCategory[]> => {
      let query = supabase
        .from("transaction_categories")
        .select("*")
        .order("name");

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as TransactionCategory[];
    },
  });
}
