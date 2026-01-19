import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Building2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  UserPlus
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { XEventRegistration } from "@/hooks/useXEvents";

interface XEventCRMSyncProps {
  eventId: string;
  eventName: string;
  registrations: XEventRegistration[];
  onSyncComplete?: () => void;
}

interface SyncResult {
  email: string;
  name: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message?: string;
}

export const XEventCRMSync = ({ 
  eventId, 
  eventName, 
  registrations, 
  onSyncComplete 
}: XEventCRMSyncProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SyncResult[]>([]);

  const syncToCRM = async () => {
    if (registrations.length === 0) {
      toast.error("No registrations to sync");
      return;
    }

    setIsSyncing(true);
    setProgress(0);
    setResults([]);

    const syncResults: SyncResult[] = [];

    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i];
      const name = `${reg.first_name} ${reg.last_name}`;

      try {
        // Check if contact already exists
        const { data: existing } = await supabase
          .from('crm_contacts')
          .select('id')
          .eq('email', reg.email)
          .maybeSingle();

        if (existing) {
          // Update existing contact with event tag
          const { data: contactData } = await supabase
            .from('crm_contacts')
            .select('tags')
            .eq('id', existing.id)
            .single();

          const currentTags = contactData?.tags || [];
          const eventTag = `event:${eventName.substring(0, 30)}`;
          
          if (!currentTags.includes(eventTag)) {
            await supabase
              .from('crm_contacts')
              .update({ 
                tags: [...currentTags, eventTag],
                company_name: reg.company || contactData?.tags || undefined
              })
              .eq('id', existing.id);
          }

          syncResults.push({
            email: reg.email,
            name,
            status: 'updated',
            message: 'Contact updated with event tag'
          });
        } else {
          // Get current user for user_id
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            syncResults.push({
              email: reg.email,
              name,
              status: 'error',
              message: 'Not authenticated'
            });
            continue;
          }

          // Split name into first/last
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Create new contact
          const { error: insertError } = await supabase
            .from('crm_contacts')
            .insert({
              user_id: user.id,
              first_name: firstName,
              last_name: lastName,
              email: reg.email,
              phone: reg.phone,
              title: reg.title,
              tags: [`event:${eventName.substring(0, 30)}`],
              lead_source: 'xevents',
              lead_score: 50,
            });

          if (insertError) throw insertError;

          syncResults.push({
            email: reg.email,
            name,
            status: 'created',
            message: 'New contact created'
          });
        }

        // Also create company if provided
        if (reg.company) {
          const { data: existingCompany } = await supabase
            .from('crm_companies')
            .select('id')
            .ilike('name', reg.company)
            .maybeSingle();

          if (!existingCompany) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from('crm_companies')
                .insert({
                  user_id: user.id,
                  name: reg.company,
                  tags: [`event:${eventName.substring(0, 30)}`],
                });
            }
          }
        }

      } catch (err: any) {
        syncResults.push({
          email: reg.email,
          name,
          status: 'error',
          message: err.message
        });
      }

      setProgress(((i + 1) / registrations.length) * 100);
    }

    setResults(syncResults);
    setIsSyncing(false);

    const created = syncResults.filter(r => r.status === 'created').length;
    const updated = syncResults.filter(r => r.status === 'updated').length;
    const errors = syncResults.filter(r => r.status === 'error').length;

    if (errors === 0) {
      toast.success(`CRM sync complete: ${created} created, ${updated} updated`);
    } else {
      toast.warning(`Sync completed with ${errors} errors`);
    }

    onSyncComplete?.();
  };

  const created = results.filter(r => r.status === 'created').length;
  const updated = results.filter(r => r.status === 'updated').length;
  const errors = results.filter(r => r.status === 'error').length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            CRM Integration
          </h3>
          <p className="text-sm text-muted-foreground">
            Sync {registrations.length} registrations to your CRM
          </p>
        </div>
        <Button 
          onClick={syncToCRM} 
          disabled={isSyncing || registrations.length === 0}
          className="gap-2"
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {isSyncing ? 'Syncing...' : 'Sync to CRM'}
        </Button>
      </div>

      {isSyncing && (
        <div className="space-y-2 mb-4">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground text-center">
            Processing {Math.round(progress)}%
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex gap-4 text-sm">
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {created} Created
            </Badge>
            <Badge variant="outline" className="gap-1">
              <RefreshCw className="w-3 h-3 text-blue-600" />
              {updated} Updated
            </Badge>
            {errors > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors} Errors
              </Badge>
            )}
          </div>

          {/* Results List */}
          <ScrollArea className="h-48 border rounded-md">
            <div className="p-2 space-y-1">
              {results.map((result, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 text-sm rounded hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {result.status === 'created' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {result.status === 'updated' && <RefreshCw className="w-4 h-4 text-blue-600" />}
                    {result.status === 'error' && <AlertCircle className="w-4 h-4 text-destructive" />}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-xs text-muted-foreground">{result.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </Card>
  );
};
