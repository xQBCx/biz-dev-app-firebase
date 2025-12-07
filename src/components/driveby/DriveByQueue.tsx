import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, CheckCircle, XCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

export const DriveByQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: captures, isLoading } = useQuery({
    queryKey: ["field-captures", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("field_capture").select("*").eq("captured_by", user.id).in("status", ["new", "processing"]).order("ts", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const convertMutation = useMutation({
    mutationFn: async (captureId: string) => {
      setProcessingId(captureId);
      const { data, error } = await supabase.functions.invoke("driveby-convert", { body: { captureId } });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Lead created successfully!" });
      queryClient.invalidateQueries({ queryKey: ["field-captures"] });
      queryClient.invalidateQueries({ queryKey: ["driveby-leads"] });
    },
    onError: () => toast({ title: "Failed to convert capture", variant: "destructive" }),
    onSettled: () => setProcessingId(null),
  });

  const dismissMutation = useMutation({
    mutationFn: async (captureId: string) => {
      const { error } = await supabase.from("field_capture").update({ status: "dismissed" }).eq("id", captureId);
      if (error) throw error;
    },
    onSuccess: () => { toast({ title: "Capture dismissed" }); queryClient.invalidateQueries({ queryKey: ["field-captures"] }); },
    onError: () => toast({ title: "Failed to dismiss", variant: "destructive" }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  if (!captures?.length) return <Card><CardContent className="py-12 text-center"><ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-medium">No captures to triage</h3><p className="text-muted-foreground mt-1">Capture new leads using the Capture tab</p></CardContent></Card>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{captures.length} capture{captures.length !== 1 ? "s" : ""} to review</h2></div>
      <div className="grid gap-4">
        {captures.map((capture: any) => (
          <Card key={capture.id} className="overflow-hidden">
            <div className="flex">
              {capture.photo_url && <div className="w-48 h-48 flex-shrink-0"><img src={capture.photo_url} alt="Capture" className="w-full h-full object-cover" /></div>}
              <div className="flex-1 p-4">
                <div className="space-y-2">
                  <Badge variant={capture.status === "processing" ? "secondary" : "outline"}>{capture.status === "processing" ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing</> : "New"}</Badge>
                  {capture.ai_tags?.length > 0 && <div className="flex flex-wrap gap-1">{capture.ai_tags.map((tag: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>)}</div>}
                  {capture.notes && <p className="text-sm">{capture.notes}</p>}
                  {capture.address && <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3 w-3" /><span className="line-clamp-1">{capture.address}</span></div>}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3 w-3" />{format(new Date(capture.ts), "MMM d, h:mm a")}</div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="sm" onClick={() => convertMutation.mutate(capture.id)} disabled={processingId === capture.id}>{processingId === capture.id ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}Convert to Lead</Button>
                  <Button size="sm" variant="outline" onClick={() => dismissMutation.mutate(capture.id)} disabled={processingId === capture.id}><XCircle className="h-4 w-4 mr-1" />Dismiss</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
