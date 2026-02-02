import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowRight, Wallet, Building2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const transferSchema = z.object({
  to_type: z.enum(["personal", "entity", "participant"]),
  to_address: z.string().optional(),
  to_participant_id: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be at least $0.01"),
  category_id: z.string().optional(),
  purpose: z.string().min(3, "Purpose is required"),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface XdkTransferPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealRoomId: string;
  dealRoomName: string;
  treasuryBalance: number;
  treasuryAddress: string;
}

export function XdkTransferPanel({
  open,
  onOpenChange,
  dealRoomId,
  dealRoomName,
  treasuryBalance,
  treasuryAddress,
}: XdkTransferPanelProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      to_type: "personal",
      amount: 0,
      purpose: "",
    },
  });

  const toType = form.watch("to_type");

  // Fetch transaction categories
  const { data: categories } = useQuery({
    queryKey: ["transaction-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch participants for transfer
  const { data: participants } = useQuery({
    queryKey: ["transfer-participants", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_room_participants")
        .select("id, user_id, name, wallet_address")
        .eq("deal_room_id", dealRoomId);

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = (data || []).map(p => p.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return (data || []).map(p => ({
        ...p,
        profile: p.user_id ? profileMap.get(p.user_id) : undefined,
      }));
    },
    enabled: open && toType === "participant",
  });

  // Fetch user's personal wallet
  const { data: personalWallet } = useQuery({
    queryKey: ["personal-xdk-wallet"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("xodiak_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("account_type", "user")
        .single();

      return data;
    },
    enabled: open,
  });

  // Helper to resolve participant ID to user ID
  const getParticipantUserId = (participantId: string | undefined) => {
    if (!participantId) return undefined;
    const participant = participants?.find(p => p.id === participantId);
    return participant?.user_id;
  };

  const transferMutation = useMutation({
    mutationFn: async (values: TransferFormData) => {
      const response = await supabase.functions.invoke("xdk-internal-transfer", {
        body: {
          deal_room_id: dealRoomId,
          amount: values.amount,
          destination_type: values.to_type,
          destination_wallet_address: values.to_type === "entity" 
            ? values.to_address 
            : undefined,
          destination_user_id: values.to_type === "participant" 
            ? getParticipantUserId(values.to_participant_id)
            : undefined,
          purpose: values.purpose,
          category_id: values.category_id,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Transfer failed");
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Transfer completed!", {
        description: "XDK has been transferred successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["deal-room-treasury", dealRoomId] });
      queryClient.invalidateQueries({ queryKey: ["personal-xdk-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["value-ledger", dealRoomId] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Transfer failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const onSubmit = async (values: TransferFormData) => {
    if (values.amount > treasuryBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);
    try {
      await transferMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Transfer XDK
          </SheetTitle>
          <SheetDescription>
            Move XDK from the {dealRoomName} treasury (fee-free internal transfer)
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <div className="p-4 bg-muted rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="text-xl font-bold">{treasuryBalance.toFixed(2)} XDK</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${treasuryBalance.toFixed(2)} USD
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="to_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transfer To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>My Personal Wallet</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="participant">
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            <span>Participant Wallet</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="entity">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>Entity/Business Wallet</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {toType === "participant" && (
                <FormField
                  control={form.control}
                  name="to_participant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Participant</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose participant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {participants?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.profile?.full_name || p.name || p.profile?.email || "Unknown"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {toType === "entity" && (
                <FormField
                  control={form.control}
                  name="to_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="xdk1..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (XDK)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Internal transfers are fee-free
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (for accounting)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Helps with tax categorization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Owner's draw - January 2026"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Transfer XDK
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
