import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarIcon, Loader2, Send, Receipt, DollarSign, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

const invoiceSchema = z.object({
  client_id: z.string().min(1, "Please select a client"),
  amount: z.number().min(1, "Amount must be at least $1"),
  description: z.string().min(3, "Description is required"),
  due_date: z.date().optional(),
  deal_room_id: z.string().optional(),
  route_to_treasury: z.boolean().default(false),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceCreationPanelProps {
  onSuccess?: () => void;
  defaultDealRoomId?: string;
}

export function InvoiceCreationPanel({ onSuccess, defaultDealRoomId }: InvoiceCreationPanelProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      amount: 0,
      description: "",
      deal_room_id: defaultDealRoomId || "",
      route_to_treasury: !!defaultDealRoomId, // Default to true if in deal room context
    },
  });

  // Fetch clients (users the current user has worked with)
  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ["invoice-clients"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get clients from deal room participants where user is creator
      const { data: dealRooms } = await supabase
        .from("deal_rooms")
        .select("id")
        .eq("created_by", user.id);

      if (!dealRooms?.length) return [];

      const dealRoomIds = dealRooms.map(dr => dr.id);

      const { data: participants } = await supabase
        .from("deal_room_participants")
        .select(`
          user_id,
          profiles:user_id (
            id,
            full_name,
            email,
            company
          )
        `)
        .in("deal_room_id", dealRoomIds)
        .neq("user_id", user.id);

      // Deduplicate by user_id
      const uniqueClients = new Map();
      participants?.forEach(p => {
        if (p.profiles && !uniqueClients.has(p.user_id)) {
          uniqueClients.set(p.user_id, p.profiles);
        }
      });

      return Array.from(uniqueClients.values());
    },
  });

  // Fetch deal rooms
  const { data: dealRooms } = useQuery({
    queryKey: ["user-deal-rooms"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data } = await supabase
        .from("deal_rooms")
        .select("id, name")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      return data || [];
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (values: InvoiceFormData) => {
      const client = clients?.find(c => c.id === values.client_id);
      if (!client) throw new Error("Client not found");

      const response = await supabase.functions.invoke("create-client-invoice", {
        body: {
          client_id: values.client_id,
          client_email: client.email,
          amount: values.amount,
          currency: "USD",
          description: values.description,
          due_date: values.due_date?.toISOString().split('T')[0],
          deal_room_id: values.deal_room_id || null,
          route_to_treasury: values.route_to_treasury,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create invoice");
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Invoice created and sent!", {
        description: `Invoice for $${form.getValues("amount")} sent to client.`,
      });
      queryClient.invalidateQueries({ queryKey: ["platform-invoices"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Failed to create invoice", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const onSubmit = async (values: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      await createInvoiceMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Create Invoice
        </CardTitle>
        <CardDescription>
          Send an invoice to a client. They'll receive a notification and can pay in-app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingClients ? (
                        <div className="p-2 text-center text-muted-foreground">Loading...</div>
                      ) : clients?.length === 0 ? (
                        <div className="p-2 text-center text-muted-foreground">
                          No clients found. Add participants to a deal room first.
                        </div>
                      ) : (
                        clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex flex-col">
                              <span>{client.full_name || client.email}</span>
                              {client.company && (
                                <span className="text-xs text-muted-foreground">{client.company}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
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
                        placeholder="1000"
                        className="pl-9"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Will be converted to XDK upon payment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Monthly retainer - January 2026"
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
                  <FormLabel>Due Date</FormLabel>
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
                            <span>Pick a date (default: 30 days)</span>
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

            {dealRooms && dealRooms.length > 0 && (
              <FormField
                control={form.control}
                name="deal_room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link to Deal Room (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a deal room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {dealRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create & Send Invoice
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
