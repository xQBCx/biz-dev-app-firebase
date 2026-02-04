import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon, Loader2, Send, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const fundRequestSchema = z.object({
  participant_id: z.string().min(1, "Please select a participant"),
  amount: z.number().min(1, "Amount must be at least $1"),
  purpose: z.string().min(3, "Purpose is required"),
  due_date: z.date().optional(),
  notes: z.string().optional(),
});

type FundRequestFormData = z.infer<typeof fundRequestSchema>;

interface FundRequestPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealRoomId: string;
  dealRoomName: string;
}

interface Participant {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  can_contribute_funds: boolean;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export function FundRequestPanel({
  open,
  onOpenChange,
  dealRoomId,
  dealRoomName,
}: FundRequestPanelProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FundRequestFormData>({
    resolver: zodResolver(fundRequestSchema),
    defaultValues: {
      amount: 0,
      purpose: "",
      notes: "",
    },
  });

  // Fetch participants who can contribute funds
  const { data: participants, isLoading: loadingParticipants } = useQuery({
    queryKey: ["fund-eligible-participants", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_room_participants")
        .select("id, user_id, name, email, can_contribute_funds")
        .eq("deal_room_id", dealRoomId)
        .eq("can_contribute_funds", true);

      if (error) throw error;
      
      // Fetch profiles separately to avoid relation issues
      const userIds = (data || []).map(p => p.user_id).filter(Boolean) as string[];
      let profileMap = new Map<string, { full_name: string | null; email: string | null }>();
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        
        profileMap = new Map(profiles?.map(p => [p.id, { full_name: p.full_name, email: p.email }]) || []);
      }
      
      return (data || []).map(p => ({
        ...p,
        profiles: p.user_id ? profileMap.get(p.user_id) : undefined,
      })) as Participant[];
    },
    enabled: open,
  });

  // Fetch existing fund requests
  const { data: existingRequests } = useQuery({
    queryKey: ["fund-requests", dealRoomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fund_contribution_requests")
        .select("*")
        .eq("deal_room_id", dealRoomId)
        .eq("status", "pending");

      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (values: FundRequestFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const participant = participants?.find(p => p.id === values.participant_id);
      if (!participant?.user_id) throw new Error("Participant not found");

      const { data, error } = await supabase
        .from("fund_contribution_requests")
        .insert({
          deal_room_id: dealRoomId,
          requested_by: user.id,
          requested_from_participant_id: values.participant_id,
          requested_from_user_id: participant.user_id,
          amount: values.amount,
          currency: "USD",
          purpose: values.purpose,
          due_date: values.due_date?.toISOString().split('T')[0],
          notes: values.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the participant using the correct table structure
      try {
        await supabase.from("communications").insert({
          user_id: participant.user_id,
          communication_type: "notification",
          subject: "Fund Contribution Request",
          body: `You've been asked to contribute $${values.amount.toFixed(2)} for: ${values.purpose}`,
          status: "pending",
          metadata: {
            request_id: data.id,
            deal_room_id: dealRoomId,
            deal_room_name: dealRoomName,
            amount: values.amount,
            purpose: values.purpose,
            notification_type: "fund_request",
          },
        });
      } catch (notifyError) {
        console.warn("Failed to send notification:", notifyError);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Fund request sent!", {
        description: "The participant has been notified.",
      });
      queryClient.invalidateQueries({ queryKey: ["fund-requests", dealRoomId] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to send request", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const onSubmit = async (values: FundRequestFormData) => {
    setIsSubmitting(true);
    try {
      await createRequestMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParticipantDisplay = (p: Participant) => {
    const name = p.profiles?.full_name || p.name || p.email || p.profiles?.email;
    return { name };
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Request Fund Contribution
          </SheetTitle>
          <SheetDescription>
            Request funds from a participant to contribute to the Deal Room treasury.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {participants?.length === 0 && !loadingParticipants ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-muted-foreground">
                No participants are enabled to contribute funds.
              </p>
              <p className="text-sm text-muted-foreground">
                Enable "Can Contribute Funds" permission for participants in the Participants tab.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="participant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request From</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a participant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingParticipants ? (
                            <div className="p-2 text-center text-muted-foreground">Loading...</div>
                          ) : (
                            participants?.map((p) => {
                              const { name } = getParticipantDisplay(p);
                              return (
                                <SelectItem key={p.id} value={p.id}>
                                  <span>{name}</span>
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="250"
                            className="pl-9"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Will be minted as XDK to the treasury upon payment
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
                          placeholder="Partner retainer contribution - January 2026"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes..."
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
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Fund Request
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {existingRequests && existingRequests.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h4 className="text-sm font-medium mb-3">Pending Requests</h4>
              <div className="space-y-2">
                {existingRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">${Number(req.amount).toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{req.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
